//Computes a ship’s compliance balance for a given year.
import { ENERGY_PER_TON_MJ, TARGET_INTENSITY_2025 } from '../../shared/constants.js';
import type { ComplianceSnapshot } from '../domain/compliance.js';
import type { ComplianceRepository, RoutesRepository } from '../ports/repositories.js';

export class ComputeComplianceBalance {
  constructor(
    private readonly routesRepository: RoutesRepository,
    private readonly complianceRepository: ComplianceRepository
  ) {}

  async execute(input: { shipId: string; year: number }): Promise<ComplianceSnapshot> {
    const route = await this.routesRepository.getByRouteId(input.shipId);
    if (!route || route.year !== input.year) {
      throw new Error('Ship/route not found for given year');
    }

    const energyInScopeMJ = route.fuelConsumption * ENERGY_PER_TON_MJ;
    const cb = (TARGET_INTENSITY_2025 - route.ghgIntensity) * energyInScopeMJ;

    const snapshot: ComplianceSnapshot = {
      shipId: input.shipId,
      year: input.year,
      targetIntensity: TARGET_INTENSITY_2025,
      actualIntensity: route.ghgIntensity,
      energyInScopeMJ,
      cb
    };

    await this.complianceRepository.saveSnapshot(snapshot);
    return snapshot;
  }
}
