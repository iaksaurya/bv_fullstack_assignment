import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import {
  InMemoryBankRepository,
  InMemoryComplianceRepository,
  InMemoryPoolRepository,
  InMemoryRoutesRepository
} from '../../outbound/memory/in-memory-repositories.js';

function makeApp() {
  return createApp({
    routesRepository: new InMemoryRoutesRepository(),
    complianceRepository: new InMemoryComplianceRepository(),
    bankRepository: new InMemoryBankRepository(),
    poolRepository: new InMemoryPoolRepository()
  });
}

describe('http app', () => {
  it('lists routes', async () => {
    const response = await request(makeApp()).get('/routes');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(5);
  });

  it('returns comparisons', async () => {
    const response = await request(makeApp()).get('/routes/comparison');
    expect(response.status).toBe(200);
    expect(response.body[0]).toHaveProperty('percentDiff');
  });

  it('computes CB', async () => {
    const response = await request(makeApp()).get('/compliance/cb').query({ shipId: 'R002', year: 2024 });
    expect(response.status).toBe(200);
    expect(response.body.shipId).toBe('R002');
  });

  it('creates pool', async () => {
    const response = await request(makeApp()).post('/pools').send({
      year: 2024,
      members: [{ shipId: 'A', cbBefore: 100 }, { shipId: 'B', cbBefore: -100 }]
    });
    expect(response.status).toBe(201);
    expect(response.body.members).toHaveLength(2);
  });
});
