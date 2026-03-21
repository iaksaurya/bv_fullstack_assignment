export interface Route {
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number;
  fuelConsumption: number;
  distance: number;
  totalEmissions: number;
  isBaseline?: boolean;
}

export interface ComparisonRow {
  baseline: { routeId: string; ghgIntensity: number };
  comparison: { routeId: string; ghgIntensity: number };
  percentDiff: number;
  compliant: boolean;
}

export interface ComplianceSnapshot {
  shipId: string;
  year: number;
  cb: number;
  actualIntensity: number;
  targetIntensity: number;
  energyInScopeMJ: number;
}

export interface AdjustedCb {
  shipId: string;
  year: number;
  cb: number;
  bankedAvailable: number;
  adjustedCb: number;
}

export interface BankEntry {
  id: string;
  shipId: string;
  year: number;
  amountGco2eq: number;
}

export interface PoolResult {
  poolId: string;
  year: number;
  members: Array<{ shipId: string; cbBefore: number; cbAfter: number }>;
}
