//This file provides test-only repository implementations.
import type { BankEntry, ComplianceSnapshot, PoolMemberResult } from '../../../core/domain/compliance.js';
import type { Route } from '../../../core/domain/route.js';
import type { BankRepository, ComplianceRepository, PoolRepository, RoutesRepository } from '../../../core/ports/repositories.js';

export const seedRoutes: Route[] = [
  { id: '1', routeId: 'R001', vesselType: 'Container', fuelType: 'HFO', year: 2024, ghgIntensity: 91.0, fuelConsumption: 5000, distance: 12000, totalEmissions: 4500, isBaseline: true },
  { id: '2', routeId: 'R002', vesselType: 'BulkCarrier', fuelType: 'LNG', year: 2024, ghgIntensity: 88.0, fuelConsumption: 4800, distance: 11500, totalEmissions: 4200, isBaseline: false },
  { id: '3', routeId: 'R003', vesselType: 'Tanker', fuelType: 'MGO', year: 2024, ghgIntensity: 93.5, fuelConsumption: 5100, distance: 12500, totalEmissions: 4700, isBaseline: false },
  { id: '4', routeId: 'R004', vesselType: 'RoRo', fuelType: 'HFO', year: 2025, ghgIntensity: 89.2, fuelConsumption: 4900, distance: 11800, totalEmissions: 4300, isBaseline: false },
  { id: '5', routeId: 'R005', vesselType: 'Container', fuelType: 'LNG', year: 2025, ghgIntensity: 90.5, fuelConsumption: 4950, distance: 11900, totalEmissions: 4400, isBaseline: false }
];

export class InMemoryRoutesRepository implements RoutesRepository {
  constructor(private readonly routes: Route[] = structuredClone(seedRoutes)) {}

  async list(filters?: { vesselType?: string; fuelType?: string; year?: number }): Promise<Route[]> {
    return this.routes.filter((route) =>
      (!filters?.vesselType || route.vesselType === filters.vesselType) &&
      (!filters?.fuelType || route.fuelType === filters.fuelType) &&
      (!filters?.year || route.year === filters.year)
    );
  }
  async getByRouteId(routeId: string): Promise<Route | null> {
    return this.routes.find((route) => route.routeId === routeId) ?? null;
  }
  async getBaseline(): Promise<Route | null> {
    return this.routes.find((route) => route.isBaseline) ?? null;
  }
  async setBaseline(routeId: string): Promise<void> {
    this.routes.forEach((route) => { route.isBaseline = route.routeId === routeId; });
  }
}

export class InMemoryComplianceRepository implements ComplianceRepository {
  private readonly snapshots = new Map<string, ComplianceSnapshot>();
  async saveSnapshot(snapshot: ComplianceSnapshot): Promise<void> {
    this.snapshots.set(`${snapshot.shipId}-${snapshot.year}`, snapshot);
  }
  async getSnapshot(shipId: string, year: number): Promise<ComplianceSnapshot | null> {
    return this.snapshots.get(`${shipId}-${year}`) ?? null;
  }
}

export class InMemoryBankRepository implements BankRepository {
  private readonly entries: BankEntry[] = [];
  async list(shipId: string, year: number): Promise<BankEntry[]> {
    return this.entries.filter((entry) => entry.shipId === shipId && entry.year === year);
  }
  async create(entry: Omit<BankEntry, 'id'>): Promise<BankEntry> {
    const saved = { ...entry, id: String(this.entries.length + 1) };
    this.entries.push(saved);
    return saved;
  }
  async getAvailable(shipId: string, year: number): Promise<number> {
    return this.entries.filter((entry) => entry.shipId === shipId && entry.year === year)
      .reduce((sum, entry) => sum + entry.amountGco2eq, 0);
  }
  async apply(shipId: string, year: number, amount: number): Promise<void> {
    this.entries.push({ id: String(this.entries.length + 1), shipId, year, amountGco2eq: -amount });
  }
}

export class InMemoryPoolRepository implements PoolRepository {
  async createPool(year: number, members: PoolMemberResult[]) {
    return { poolId: 'pool-1', year, members };
  }
}
