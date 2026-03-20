import type { BankEntry } from '../domain/compliance.js';
import type { BankRepository, ComplianceRepository } from '../ports/repositories.js';
import { ComputeComplianceBalance } from './compute-cb.js';

export class BankSurplus {
  constructor(
    private readonly bankRepository: BankRepository,
    private readonly complianceRepository: ComplianceRepository,
    private readonly computeComplianceBalance: ComputeComplianceBalance
  ) {}

  async execute(input: { shipId: string; year: number; amount?: number }): Promise<BankEntry> {
    const snapshot =
      (await this.complianceRepository.getSnapshot(input.shipId, input.year)) ??
      (await this.computeComplianceBalance.execute(input));

    if (snapshot.cb <= 0) {
      throw new Error('Only positive CB can be banked');
    }

    const amount = input.amount ?? snapshot.cb;
    if (amount <= 0 || amount > snapshot.cb) {
      throw new Error('Invalid bank amount');
    }

    return this.bankRepository.create({
      shipId: input.shipId,
      year: input.year,
      amountGco2eq: amount
    });
  }
}
