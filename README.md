
---

# 2. `README.md`

```markdown
# FuelEU Maritime Compliance Platform

## Overview

This project is a full-stack implementation of a FuelEU Maritime compliance system.

### Tech Stack
- Frontend: React + TypeScript + TailwindCSS
- Backend: Node.js + TypeScript + PostgreSQL
- Architecture: Hexagonal (Ports & Adapters)

---

## Features

- Route listing and filtering
- Compliance Balance (CB) calculation
- Banking system
- Pooling system
- Clean modular architecture

---

## Architecture (Hexagonal)

The system is divided into:

### 1. Domain Layer
- Business models
- Pure logic
- No external dependencies

### 2. Application Layer
- Use cases
- Services
- Business workflows

### 3. Inbound Adapters
- HTTP routes (Express)
- Controllers

### 4. Outbound Adapters
- PostgreSQL repositories
- Database interaction

---

## Folder Structure
- backend/
src/
core/
domain/
application/
ports/
adapters/
inbound/http/
outbound/postgres/
infrastructure/db/
index.ts
-------
- frontend/
src/
components/
pages/
services/
----------------


---

## Setup Instructions

### Prerequisites
- Node.js
- npm
- PostgreSQL

---

## Backend Setup

```bash
cd backend
npm install

- Create .env file:
PORT=3001
DATABASE_URL=postgresql://postgres:password@localhost:5432/fueleu

- Run database setup:
npm run db:init

- Start backend:
npm run dev
backend run at     http://localhost:3001

## Frontend Setup
cd frontend
npm install
npm run dev

- frontend run at    http://localhost:5173

## sample response
{
  "routeId": "R001",
  "year": 2024,
  "complianceBalance": -10
}