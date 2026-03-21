import { useState } from 'react';
import type { DashboardService } from '../../../core/application/dashboard-service';
import { useAsync } from '../hooks';
import { Card, ErrorBanner } from '../components';

export function RoutesTab({ service }: { service: DashboardService }) {
  const [filters, setFilters] = useState<{ vesselType: string; fuelType: string; year: string }>({ vesselType: '', fuelType: '', year: '' });
  const { data, error, loading } = useAsync(
    () => service.getRoutes({ vesselType: filters.vesselType || undefined, fuelType: filters.fuelType || undefined, year: filters.year ? Number(filters.year) : undefined }),
    [filters.vesselType, filters.fuelType, filters.year]
  );

  async function handleBaseline(routeId: string) {
    await service.setBaseline(routeId);
    window.location.reload();
  }

  return (
    <div className="space-y-4">
      <Card title="Routes">
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <input className="rounded-xl border p-2" placeholder="Filter by vessel type" value={filters.vesselType} onChange={(e) => setFilters((s) => ({ ...s, vesselType: e.target.value }))} />
          <input className="rounded-xl border p-2" placeholder="Filter by fuel type" value={filters.fuelType} onChange={(e) => setFilters((s) => ({ ...s, fuelType: e.target.value }))} />
          <input className="rounded-xl border p-2" placeholder="Year" value={filters.year} onChange={(e) => setFilters((s) => ({ ...s, year: e.target.value }))} />
        </div>
        {error && <ErrorBanner message={error} />}
        {loading ? <p>Loading…</p> : (
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 text-left">
                <tr>
                  {['routeId','vesselType','fuelType','year','ghgIntensity','fuelConsumption','distance','totalEmissions','baseline'].map((h) => <th className="px-3 py-2" key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {data?.map((route) => (
                  <tr key={route.routeId} className="border-b">
                    <td className="px-3 py-2">{route.routeId}</td>
                    <td className="px-3 py-2">{route.vesselType}</td>
                    <td className="px-3 py-2">{route.fuelType}</td>
                    <td className="px-3 py-2">{route.year}</td>
                    <td className="px-3 py-2">{route.ghgIntensity}</td>
                    <td className="px-3 py-2">{route.fuelConsumption}</td>
                    <td className="px-3 py-2">{route.distance}</td>
                    <td className="px-3 py-2">{route.totalEmissions}</td>
                    <td className="px-3 py-2">
                      <button className="rounded-lg bg-slate-900 px-3 py-2 text-white disabled:opacity-50" disabled={route.isBaseline} onClick={() => handleBaseline(route.routeId)}>
                        {route.isBaseline ? 'Baseline' : 'Set Baseline'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
