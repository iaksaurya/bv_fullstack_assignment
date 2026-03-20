import { describe, expect, it } from 'vitest';
import { ComputeComparison } from './compute-comparison.js';
import { ComputeComplianceBalance } from './compute-cb.js';
import { BankSurplus } from './bank-surplus.js';
import { ApplyBankedSurplus } from './apply-banked.js';
import { CreatePool } from './create-pool.js';
import {
  InMemoryBankRepository,
  InMemoryComplianceRepository,
  InMemoryPoolRepository,
  InMemoryRoutesRepository
} from '../../adapters/outbound/memory/in-memory-repositories.js';

describe('application use cases', () => {
  it('computes comparison against baseline', async () => {
    const routes = new InMemoryRoutesRepository();
    const useCase = new ComputeComparison(routes);
    const result = await useCase.execute();
    expect(result[0].baseline.routeId).toBe('R001');
    expect(result[0].comparison.routeId).toBe('R002');
    expect(result[0].percentDiff).toBeCloseTo(((88 / 91) - 1) * 100);
  });

  it('computes CB from route', async () => {
    const routes = new InMemoryRoutesRepository();
    const compliance = new InMemoryComplianceRepository();
    const useCase = new ComputeComplianceBalance(routes, compliance);
    const result = await useCase.execute({ shipId: 'R001', year: 2024 });
    expect(result.cb).toBeLessThan(0);
    expect(result.energyInScopeMJ).toBe(205000000);
  });

  it('banks only positive CB', async () => {
    const routes = new InMemoryRoutesRepository();
    const compliance = new InMemoryComplianceRepository();
    const bank = new InMemoryBankRepository();
    const compute = new ComputeComplianceBalance(routes, compliance);
    const useCase = new BankSurplus(bank, compliance, compute);
    const result = await useCase.execute({ shipId: 'R002', year: 2024 });
    expect(result.amountGco2eq).toBeGreaterThan(0);
  });

  it('rejects banking negative CB', async () => {
    const routes = new InMemoryRoutesRepository();
    const compliance = new InMemoryComplianceRepository();
    const bank = new InMemoryBankRepository();
    const compute = new ComputeComplianceBalance(routes, compliance);
    const useCase = new BankSurplus(bank, compliance, compute);
    await expect(useCase.execute({ shipId: 'R003', year: 2024 })).rejects.toThrow('Only positive CB');
  });

  it('applies banked surplus to deficit', async () => {
    const routes = new InMemoryRoutesRepository();
    const compliance = new InMemoryComplianceRepository();
    const bank = new InMemoryBankRepository();
    const compute = new ComputeComplianceBalance(routes, compliance);

    await bank.create({ shipId: 'R003', year: 2024, amountGco2eq: 900_000_000 });

    const useCase = new ApplyBankedSurplus(bank, compliance, compute);
    const result = await useCase.execute({ shipId: 'R003', year: 2024, amount: 100_000_000 });
    expect(result.cb_before).toBeLessThan(0);
    expect(result.cb_after).toBe(result.cb_before + 100_000_000);
  });

  it('rejects over-apply', async () => {
    const routes = new InMemoryRoutesRepository();
    const compliance = new InMemoryComplianceRepository();
    const bank = new InMemoryBankRepository();
    const compute = new ComputeComplianceBalance(routes, compliance);

    await bank.create({ shipId: 'R003', year: 2024, amountGco2eq: 10 });

    const useCase = new ApplyBankedSurplus(bank, compliance, compute);
    await expect(useCase.execute({ shipId: 'R003', year: 2024, amount: 20 })).rejects.toThrow('exceeds');
  });

  it('creates a valid pool', async () => {
    const useCase = new CreatePool(new InMemoryPoolRepository());
    const result = await useCase.execute({
      year: 2024,
      members: [
        { shipId: 'S1', cbBefore: 100 },
        { shipId: 'S2', cbBefore: -50 },
        { shipId: 'S3', cbBefore: -20 }
      ]
    });
    const s1 = result.members.find((m) => m.shipId === 'S1')!;
    const s2 = result.members.find((m) => m.shipId === 'S2')!;
    expect(s1.cbAfter).toBeGreaterThanOrEqual(0);
    expect(s2.cbAfter).toBeGreaterThanOrEqual(s2.cbBefore);
  });

  it('rejects invalid pool sum', async () => {
    const useCase = new CreatePool(new InMemoryPoolRepository());
    await expect(useCase.execute({
      year: 2024,
      members: [
        { shipId: 'S1', cbBefore: 10 },
        { shipId: 'S2', cbBefore: -50 }
      ]
    })).rejects.toThrow('non-negative');
  });
});
