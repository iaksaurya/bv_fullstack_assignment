import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { App } from './App';

vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
  const url = String(input);
  const payload =
    url.includes('/routes/comparison') ? [] :
    url.includes('/routes') ? [] :
    url.includes('/compliance/adjusted-cb') ? [] :
    url.includes('/compliance/cb') ? { cb: 0, shipId: 'R001', year: 2024, actualIntensity: 0, targetIntensity: 0, energyInScopeMJ: 0 } :
    [];
  return new Response(JSON.stringify(payload), { status: 200, headers: { 'Content-Type': 'application/json' } });
}));

describe('App', () => {
  it('renders dashboard title and tabs', async () => {
    render(<App />);
    expect(screen.getByText(/FuelEU Compliance Dashboard/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Routes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Compare' })).toBeInTheDocument();
  });
});
