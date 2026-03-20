//These are the domain objects for compliance math, banked surplus, and pooling.
//computed CB data for a ship and year
export interface ComplianceSnapshot {
  shipId: string;
  year: number;
  targetIntensity: number;
  actualIntensity: number;
  energyInScopeMJ: number;
  cb: number;
}
//one bank transaction, positive or negative
export interface BankEntry {
  id: string;
  shipId: string;
  year: number;
  amountGco2eq: number;
}
//member status before and after pooling
export interface PoolMemberInput {
  shipId: string;
  cbBefore: number;
}

export interface PoolMemberResult {
  shipId: string;
  cbBefore: number;
  cbAfter: number;
}
