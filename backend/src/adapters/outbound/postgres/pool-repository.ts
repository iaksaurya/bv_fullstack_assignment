import type { PoolRepository } from '../../../core/ports/repositories.js';
import type { PoolMemberResult } from '../../../core/domain/compliance.js';
import { pool } from './db.js';

export class PostgresPoolRepository implements PoolRepository {
  async createPool(year: number, members: PoolMemberResult[]) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const poolInsert = await client.query(
        'INSERT INTO pools (year, created_at) VALUES ($1, NOW()) RETURNING id, year',
        [year]
      );
      const poolId = String(poolInsert.rows[0].id);

      for (const member of members) {
        await client.query(
          `INSERT INTO pool_members (pool_id, ship_id, cb_before, cb_after)
           VALUES ($1, $2, $3, $4)`,
          [poolId, member.shipId, member.cbBefore, member.cbAfter]
        );
      }
      await client.query('COMMIT');
      return { poolId, year, members };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
