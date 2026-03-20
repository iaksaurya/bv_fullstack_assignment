import type { BankRepository, ComplianceRepository } from '../ports/repositories.js';
import { ComputeComplianceBalance } from './compute-cb.js';

export class ApplyBankedSurplus {
  constructor(
    private readonly bankRepository: BankRepository,
    private readonly complianceRepository: ComplianceRepository,
    private readonly computeComplianceBalance: ComputeComplianceBalance
  ) {}

  async execute(input: { shipId: string; year: number; amount: number }) {
    const snapshot =
      (await this.complianceRepository.getSnapshot(input.shipId, input.year)) ??
      (await this.computeComplianceBalance.execute(input));

    if (snapshot.cb >= 0) {
      throw new Error('Banked surplus can only be applied to a deficit');
    }

    const available = await this.bankRepository.getAvailable(input.shipId, input.year);
    if (input.amount <= 0 || input.amount > available) {
      throw new Error('Requested amount exceeds available banked balance');
    }

    await this.bankRepository.apply(input.shipId, input.year, input.amount);

    return {
      cb_before: snapshot.cb,
      applied: input.amount,
      cb_after: snapshot.cb + input.amount
    };
  }
}
