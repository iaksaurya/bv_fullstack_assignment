//creates the HTTP API (REST endpoints) for your FuelEU compliance system:
import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import { ComputeComparison } from '../../../core/application/compute-comparison.js';
import { ComputeComplianceBalance } from '../../../core/application/compute-cb.js';
import { GetAdjustedComplianceBalance } from '../../../core/application/get-adjusted-cb.js';
import { BankSurplus } from '../../../core/application/bank-surplus.js';
import { ApplyBankedSurplus } from '../../../core/application/apply-banked.js';
import { CreatePool } from '../../../core/application/create-pool.js';
import type { BankRepository, ComplianceRepository, PoolRepository, RoutesRepository } from '../../../core/ports/repositories.js';

//function receives repository dependencies (database implementations)
export function createApp(deps: {
  routesRepository: RoutesRepository;
  complianceRepository: ComplianceRepository;
  bankRepository: BankRepository;
  poolRepository: PoolRepository;
}) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const computeComparison = new ComputeComparison(deps.routesRepository);
  const computeComplianceBalance = new ComputeComplianceBalance(deps.routesRepository, deps.complianceRepository);
  const getAdjustedComplianceBalance = new GetAdjustedComplianceBalance(
    deps.complianceRepository,
    deps.bankRepository,
    computeComplianceBalance
  );
  const bankSurplus = new BankSurplus(deps.bankRepository, deps.complianceRepository, computeComplianceBalance);
  const applyBankedSurplus = new ApplyBankedSurplus(deps.bankRepository, deps.complianceRepository, computeComplianceBalance);
  const createPool = new CreatePool(deps.poolRepository);

  app.get('/health', (_req, res) => res.json({ ok: true }));

  app.get('/routes', async (req, res) => {
    const year = req.query.year ? Number(req.query.year) : undefined;
    const routes = await deps.routesRepository.list({
      vesselType: req.query.vesselType?.toString(),
      fuelType: req.query.fuelType?.toString(),
      year
    });
    res.json(routes);
  });

  app.post('/routes/:id/baseline', async (req, res, next) => {
    try {
      await deps.routesRepository.setBaseline(req.params.id);
      res.status(204).send();
    } catch (error) { next(error); }
  });

  app.get('/routes/comparison', async (_req, res, next) => {
    try {
      res.json(await computeComparison.execute());
    } catch (error) { next(error); }
  });

  app.get('/compliance/cb', async (req, res, next) => {
    try {
      const schema = z.object({ shipId: z.string(), year: z.coerce.number() });
      const input = schema.parse(req.query);
      res.json(await computeComplianceBalance.execute(input));
    } catch (error) { next(error); }
  });

  app.get('/compliance/adjusted-cb', async (req, res, next) => {
    try {
      const shipIds = req.query.shipId ? [String(req.query.shipId)] : ['R001', 'R002', 'R003', 'R004', 'R005'];
      const year = Number(req.query.year);
      const result = await Promise.all(shipIds.map((shipId) => getAdjustedComplianceBalance.execute({ shipId, year })));
      res.json(req.query.shipId ? result[0] : result);
    } catch (error) { next(error); }
  });

  app.get('/banking/records', async (req, res, next) => {
    try {
      const schema = z.object({ shipId: z.string(), year: z.coerce.number() });
      const input = schema.parse(req.query);
      const records = await deps.bankRepository.list(input.shipId, input.year);
      res.json(records);
    } catch (error) { next(error); }
  });

  app.post('/banking/bank', async (req, res, next) => {
    try {
      const schema = z.object({ shipId: z.string(), year: z.number(), amount: z.number().optional() });
      res.status(201).json(await bankSurplus.execute(schema.parse(req.body)));
    } catch (error) { next(error); }
  });

  app.post('/banking/apply', async (req, res, next) => {
    try {
      const schema = z.object({ shipId: z.string(), year: z.number(), amount: z.number().positive() });
      res.json(await applyBankedSurplus.execute(schema.parse(req.body)));
    } catch (error) { next(error); }
  });

  app.post('/pools', async (req, res, next) => {
    try {
      const schema = z.object({
        year: z.number(),
        members: z.array(z.object({ shipId: z.string(), cbBefore: z.number() }))
      });
      res.status(201).json(await createPool.execute(schema.parse(req.body)));
    } catch (error) { next(error); }
  });

  app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(400).json({ message: error?.message ?? 'Unexpected error' });
  });

  return app;
}
