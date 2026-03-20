import type { RoutesRepository } from '../../../core/ports/repositories.js';
import type { Route } from '../../../core/domain/route.js';
import { pool } from './db.js';

function mapRow(row: any): Route {
  return {
    id: String(row.id),
    routeId: row.route_id,
    vesselType: row.vessel_type,
    fuelType: row.fuel_type,
    year: row.year,
    ghgIntensity: Number(row.ghg_intensity),
    fuelConsumption: Number(row.fuel_consumption),
    distance: Number(row.distance),
    totalEmissions: Number(row.total_emissions),
    isBaseline: Boolean(row.is_baseline)
  };
}

export class PostgresRoutesRepository implements RoutesRepository {
  async list(filters?: { vesselType?: string; fuelType?: string; year?: number }): Promise<Route[]> {
    const clauses: string[] = [];
    const values: unknown[] = [];

    if (filters?.vesselType) {
      values.push(filters.vesselType);
      clauses.push(`vessel_type = $${values.length}`);
    }
    if (filters?.fuelType) {
      values.push(filters.fuelType);
      clauses.push(`fuel_type = $${values.length}`);
    }
    if (filters?.year) {
      values.push(filters.year);
      clauses.push(`year = $${values.length}`);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const result = await pool.query(`SELECT * FROM routes ${where} ORDER BY route_id`, values);
    return result.rows.map(mapRow);
  }

  async getByRouteId(routeId: string): Promise<Route | null> {
    const result = await pool.query('SELECT * FROM routes WHERE route_id = $1 LIMIT 1', [routeId]);
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async getBaseline(): Promise<Route | null> {
    const result = await pool.query('SELECT * FROM routes WHERE is_baseline = true LIMIT 1');
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async setBaseline(routeId: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('UPDATE routes SET is_baseline = false');
      await client.query('UPDATE routes SET is_baseline = true WHERE route_id = $1', [routeId]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
