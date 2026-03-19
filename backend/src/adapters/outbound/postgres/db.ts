import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

//pool benefits
// Reuses connections (faster)
//  Manages multiple queries simultaneously
// Automatically handles connection cleanup
//  Simple way to interact with PostgreSQL from  Node.js backend
