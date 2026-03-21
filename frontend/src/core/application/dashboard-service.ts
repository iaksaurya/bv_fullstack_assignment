

import type { DashboardApi } from '../ports/api';

export class DashboardService {
  constructor(private readonly api: DashboardApi) {
    // We bind them here to ensure 'this.api' is defined 
    // and 'this' context is preserved.
    this.getRoutes = this.api.getRoutes.bind(this.api);
    this.setBaseline = this.api.setBaseline.bind(this.api);
    this.getComparisons = this.api.getComparisons.bind(this.api);
    this.getCb = this.api.getCb.bind(this.api);
    this.getAdjustedCb = this.api.getAdjustedCb.bind(this.api);
    this.getBankRecords = this.api.getBankRecords.bind(this.api);
    this.bank = this.api.bank.bind(this.api);
    this.applyBank = this.api.applyBank.bind(this.api);
    this.createPool = this.api.createPool.bind(this.api);
  }

  // Define the types for the properties 
  getRoutes: DashboardApi['getRoutes'];
  setBaseline: DashboardApi['setBaseline'];
  getComparisons: DashboardApi['getComparisons'];
  getCb: DashboardApi['getCb'];
  getAdjustedCb: DashboardApi['getAdjustedCb'];
  getBankRecords: DashboardApi['getBankRecords'];
  bank: DashboardApi['bank'];
  applyBank: DashboardApi['applyBank'];
  createPool: DashboardApi['createPool'];
}