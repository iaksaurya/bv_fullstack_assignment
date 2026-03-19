CREATE TABLE IF NOT EXISTS routes (
  id SERIAL PRIMARY KEY,
  route_id TEXT UNIQUE NOT NULL,
  vessel_type TEXT NOT NULL,
  fuel_type TEXT NOT NULL,
  year INTEGER NOT NULL,
  ghg_intensity NUMERIC NOT NULL,
  fuel_consumption NUMERIC NOT NULL,
  distance NUMERIC NOT NULL,
  total_emissions NUMERIC NOT NULL,
  is_baseline BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS ship_compliance (
  id SERIAL PRIMARY KEY,
  ship_id TEXT NOT NULL,
  year INTEGER NOT NULL,
  cb_gco2eq NUMERIC NOT NULL,
  target_intensity NUMERIC NOT NULL,
  actual_intensity NUMERIC NOT NULL,
  energy_in_scope_mj NUMERIC NOT NULL,
  UNIQUE(ship_id, year)
);

CREATE TABLE IF NOT EXISTS bank_entries (
  id SERIAL PRIMARY KEY,
  ship_id TEXT NOT NULL,
  year INTEGER NOT NULL,
  amount_gco2eq NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS pools (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pool_members (
  pool_id INTEGER NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  ship_id TEXT NOT NULL,
  cb_before NUMERIC NOT NULL,
  cb_after NUMERIC NOT NULL
);
