import type { DashboardApi } from '../../core/ports/api';
import type { AdjustedCb, BankEntry, ComparisonRow, ComplianceSnapshot, PoolResult, Route } from '../../core/domain/models';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(body.message ?? 'Request failed');
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export class HttpDashboardApi implements DashboardApi {
  async getRoutes(filters?: Partial<{ vesselType: string; fuelType: string; year: number }>): Promise<Route[]> {
    const params = new URLSearchParams();
    if (filters?.vesselType) params.set('vesselType', filters.vesselType);
    if (filters?.fuelType) params.set('fuelType', filters.fuelType);
    if (filters?.year) params.set('year', String(filters.year));
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<Route[]>(`/routes${query}`);
  }
  async setBaseline(routeId: string): Promise<void> {
    await request<void>(`/routes/${routeId}/baseline`, { method: 'POST' });
  }
  async getComparisons(): Promise<ComparisonRow[]> {
    return request<ComparisonRow[]>('/routes/comparison');
  }
  async getCb(shipId: string, year: number): Promise<ComplianceSnapshot> {
    return request<ComplianceSnapshot>(`/compliance/cb?shipId=${shipId}&year=${year}`);
  }
  async getAdjustedCb(year: number): Promise<AdjustedCb[]> {
    return request<AdjustedCb[]>(`/compliance/adjusted-cb?year=${year}`);
  }
  async getBankRecords(shipId: string, year: number): Promise<BankEntry[]> {
    return request<BankEntry[]>(`/banking/records?shipId=${shipId}&year=${year}`);
  }
  async bank(input: { shipId: string; year: number; amount?: number }): Promise<BankEntry> {
    return request<BankEntry>('/banking/bank', { method: 'POST', body: JSON.stringify(input) });
  }
  async applyBank(input: { shipId: string; year: number; amount: number }): Promise<{ cb_before: number; applied: number; cb_after: number }> {
    return request('/banking/apply', { method: 'POST', body: JSON.stringify(input) });
  }
  async createPool(input: { year: number; members: Array<{ shipId: string; cbBefore: number }> }): Promise<PoolResult> {
    return request<PoolResult>('/pools', { method: 'POST', body: JSON.stringify(input) });
  }
}
