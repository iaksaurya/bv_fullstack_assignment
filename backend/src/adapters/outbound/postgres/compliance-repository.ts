import type { ComplianceRepository } from '../../../core/ports/repositories.js';
import type { ComplianceSnapshot } from '../../../core/domain/compliance.js';
import { pool } from './db.js';

export class PostgresComplianceRepository implements ComplianceRepository {
  async saveSnapshot(snapshot: ComplianceSnapshot): Promise<void> {
    await pool.query(
      `INSERT INTO ship_compliance (ship_id, year, cb_gco2eq, target_intensity, actual_intensity, energy_in_scope_mj)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (ship_id, year)
       DO UPDATE SET cb_gco2eq = EXCLUDED.cb_gco2eq,
                     target_intensity = EXCLUDED.target_intensity,
                     actual_intensity = EXCLUDED.actual_intensity,
                     energy_in_scope_mj = EXCLUDED.energy_in_scope_mj`,
      [
        snapshot.shipId,
        snapshot.year,
        snapshot.cb,
        snapshot.targetIntensity,
        snapshot.actualIntensity,
        snapshot.energyInScopeMJ
      ]
    );
  }

  async getSnapshot(shipId: string, year: number): Promise<ComplianceSnapshot | null> {
    const result = await pool.query(
      `SELECT ship_id, year, cb_gco2eq, target_intensity, actual_intensity, energy_in_scope_mj
       FROM ship_compliance WHERE ship_id = $1 AND year = $2 LIMIT 1`,
      [shipId, year]
    );
    const row = result.rows[0];
    if (!row) return null;
    return {
      shipId: row.ship_id,
      year: row.year,
      cb: Number(row.cb_gco2eq),
      targetIntensity: Number(row.target_intensity),
      actualIntensity: Number(row.actual_intensity),
      energyInScopeMJ: Number(row.energy_in_scope_mj)
    };
  }
}
