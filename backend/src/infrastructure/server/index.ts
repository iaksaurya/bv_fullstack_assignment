// import express from "express";
// import dotenv from "dotenv";

// dotenv.config();

// const app = express();
// app.use(express.json());

// app.get("/", (req, res) => {
//   res.send("Backend running");
// });

// const port = Number(process.env.PORT ?? 3001);

// app.listen(port, () => {
//   console.log(`Backend listening on http://localhost:${port}`);
// });


import dotenv from 'dotenv';
import { createApp } from '../../adapters/inbound/http/app.js';
import { PostgresRoutesRepository } from '../../adapters/outbound/postgres/routes-repository.js';
import { PostgresComplianceRepository } from '../../adapters/outbound/postgres/compliance-repository.js';
import { PostgresBankRepository } from '../../adapters/outbound/postgres/bank-repository.js';
import { PostgresPoolRepository } from '../../adapters/outbound/postgres/pool-repository.js';

dotenv.config();

const app = createApp({
  routesRepository: new PostgresRoutesRepository(),
  complianceRepository: new PostgresComplianceRepository(),
  bankRepository: new PostgresBankRepository(),
  poolRepository: new PostgresPoolRepository()
});

const port = Number(process.env.PORT ?? 3001);

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
