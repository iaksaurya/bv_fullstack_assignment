//It defines interfaces
//in production, use PostgreSQL repositories
//in tests, use in-memory repositories
import type { BankEntry, ComplianceSnapshot, PoolMemberResult } from '../domain/compliance.js';
import type { Route } from '../domain/route.js';

export interface RoutesRepository {
  list(filters?: { vesselType?: string; fuelType?: string; year?: number }): Promise<Route[]>;
  getByRouteId(routeId: string): Promise<Route | null>;
  getBaseline(): Promise<Route | null>;
  setBaseline(routeId: string): Promise<void>;
}

export interface ComplianceRepository {
  saveSnapshot(snapshot: ComplianceSnapshot): Promise<void>;
  getSnapshot(shipId: string, year: number): Promise<ComplianceSnapshot | null>;
}

export interface BankRepository {
  list(shipId: string, year: number): Promise<BankEntry[]>;
  create(entry: Omit<BankEntry, 'id'>): Promise<BankEntry>;
  getAvailable(shipId: string, year: number): Promise<number>;
  apply(shipId: string, year: number, amount: number): Promise<void>;
}

export interface PoolRepository {
  createPool(year: number, members: PoolMemberResult[]): Promise<{ poolId: string; year: number; members: PoolMemberResult[] }>;
}
