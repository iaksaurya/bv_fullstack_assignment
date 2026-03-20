import type { BankRepository } from '../../../core/ports/repositories.js';
import type { BankEntry } from '../../../core/domain/compliance.js';
import { pool } from './db.js';

export class PostgresBankRepository implements BankRepository {
  async list(shipId: string, year: number): Promise<BankEntry[]> {
    const result = await pool.query(
      'SELECT id, ship_id, year, amount_gco2eq FROM bank_entries WHERE ship_id = $1 AND year = $2 ORDER BY id',
      [shipId, year]
    );
    return result.rows.map((row) => ({
      id: String(row.id),
      shipId: row.ship_id,
      year: row.year,
      amountGco2eq: Number(row.amount_gco2eq)
    }));
  }

  async create(entry: Omit<BankEntry, 'id'>): Promise<BankEntry> {
    const result = await pool.query(
      'INSERT INTO bank_entries (ship_id, year, amount_gco2eq) VALUES ($1, $2, $3) RETURNING id, ship_id, year, amount_gco2eq',
      [entry.shipId, entry.year, entry.amountGco2eq]
    );
    const row = result.rows[0];
    return { id: String(row.id), shipId: row.ship_id, year: row.year, amountGco2eq: Number(row.amount_gco2eq) };
  }

  async getAvailable(shipId: string, year: number): Promise<number> {
    const result = await pool.query(
      'SELECT COALESCE(SUM(amount_gco2eq), 0) AS total FROM bank_entries WHERE ship_id = $1 AND year = $2',
      [shipId, year]
    );
    return Number(result.rows[0]?.total ?? 0);
  }

  async apply(shipId: string, year: number, amount: number): Promise<void> {
    await pool.query(
      'INSERT INTO bank_entries (ship_id, year, amount_gco2eq) VALUES ($1, $2, $3)',
      [shipId, year, -amount]
    );
  }
}
