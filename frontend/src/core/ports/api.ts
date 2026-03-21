import type { AdjustedCb, BankEntry, ComparisonRow, ComplianceSnapshot, PoolResult, Route } from '../domain/models';

export interface DashboardApi {
  getRoutes(filters?: Partial<{ vesselType: string; fuelType: string; year: number }>): Promise<Route[]>;
  setBaseline(routeId: string): Promise<void>;
  getComparisons(): Promise<ComparisonRow[]>;
  getCb(shipId: string, year: number): Promise<ComplianceSnapshot>;
  getAdjustedCb(year: number): Promise<AdjustedCb[]>;
  getBankRecords(shipId: string, year: number): Promise<BankEntry[]>;
  bank(input: { shipId: string; year: number; amount?: number }): Promise<BankEntry>;
  applyBank(input: { shipId: string; year: number; amount: number }): Promise<{ cb_before: number; applied: number; cb_after: number }>;
  createPool(input: { year: number; members: Array<{ shipId: string; cbBefore: number }> }): Promise<PoolResult>;
}
