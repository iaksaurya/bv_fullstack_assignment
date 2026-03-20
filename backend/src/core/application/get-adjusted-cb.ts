import type { ComplianceRepository, BankRepository } from '../ports/repositories.js';
import { ComputeComplianceBalance } from './compute-cb.js';

export class GetAdjustedComplianceBalance {
  constructor(
    private readonly complianceRepository: ComplianceRepository,
    private readonly bankRepository: BankRepository,
    private readonly computeComplianceBalance: ComputeComplianceBalance
  ) {}

  async execute(input: { shipId: string; year: number }): Promise<{
    shipId: string;
    year: number;
    cb: number;
    bankedAvailable: number;
    adjustedCb: number;
  }> {
    const snapshot =
      (await this.complianceRepository.getSnapshot(input.shipId, input.year)) ??
      (await this.computeComplianceBalance.execute(input));

    const bankedAvailable = await this.bankRepository.getAvailable(input.shipId, input.year);
    return {
      shipId: input.shipId,
      year: input.year,
      cb: snapshot.cb,
      bankedAvailable,
      adjustedCb: snapshot.cb + bankedAvailable
    };
  }
}

//This supports the Pooling view and any place where “CB after bank effects” is needed.