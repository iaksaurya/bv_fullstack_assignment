//fetches the current baseline route
//fetches all routes
//compares each non-baseline route against the baseline
import type { RouteComparison } from '../domain/route.js';
import type { RoutesRepository } from '../ports/repositories.js';
import { TARGET_INTENSITY_2025 } from '../../shared/constants.js';

export class ComputeComparison {
  constructor(private readonly routesRepository: RoutesRepository) {}

  async execute(): Promise<RouteComparison[]> {
    const baseline = await this.routesRepository.getBaseline();
    if (!baseline) {
      return [];
    }
    const routes = await this.routesRepository.list();
    return routes
      .filter((route) => route.routeId !== baseline.routeId)
      .map((route) => ({
        baseline: { routeId: baseline.routeId, ghgIntensity: baseline.ghgIntensity },
        comparison: { routeId: route.routeId, ghgIntensity: route.ghgIntensity },
        percentDiff: ((route.ghgIntensity / baseline.ghgIntensity) - 1) * 100,
        compliant: route.ghgIntensity <= TARGET_INTENSITY_2025
      }));
  }
}
