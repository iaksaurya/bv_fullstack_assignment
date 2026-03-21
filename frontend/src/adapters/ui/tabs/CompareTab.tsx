import type { DashboardService } from '../../../core/application/dashboard-service';
import { Card, ErrorBanner } from '../components';
import { useAsync } from '../hooks';

const TARGET = 89.3368;

export function CompareTab({ service }: { service: DashboardService }) {
  const { data, error, loading } = useAsync(() => service.getComparisons(), []);

  const values = data?.map((row) => row.comparison.ghgIntensity) ?? [];
  const max = Math.max(TARGET, ...(values.length ? values : [0]));

  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr,0.7fr]">
      <Card title="Baseline vs comparison">
        {error && <ErrorBanner message={error} />}
        {loading ? <p>Loading…</p> : (
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 text-left">
                <tr>
                  <th className="px-3 py-2">Baseline</th>
                  <th className="px-3 py-2">Comparison</th>
                  <th className="px-3 py-2">GHG Intensity</th>
                  <th className="px-3 py-2">% Difference</th>
                  <th className="px-3 py-2">Compliant</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((row) => (
                  <tr className="border-b" key={row.comparison.routeId}>
                    <td className="px-3 py-2">{row.baseline.routeId}</td>
                    <td className="px-3 py-2">{row.comparison.routeId}</td>
                    <td className="px-3 py-2">{row.comparison.ghgIntensity}</td>
                    <td className="px-3 py-2">{row.percentDiff.toFixed(2)}%</td>
                    <td className="px-3 py-2">{row.compliant ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Intensity chart">
        <svg viewBox="0 0 320 220" className="h-[220px] w-full">
          <line x1="30" y1="190" x2="300" y2="190" stroke="currentColor" />
          <line x1="30" y1="20" x2="30" y2="190" stroke="currentColor" />
          <line x1="30" y1={190 - (TARGET / max) * 160} x2="300" y2={190 - (TARGET / max) * 160} strokeDasharray="4 4" stroke="currentColor" />
          {data?.map((row, index) => {
            const barHeight = (row.comparison.ghgIntensity / max) * 160;
            const x = 50 + index * 50;
            return (
              <g key={row.comparison.routeId}>
                <rect x={x} y={190 - barHeight} width="28" height={barHeight} rx="6" className="fill-slate-700" />
                <text x={x + 14} y={205} textAnchor="middle" className="fill-slate-700 text-[10px]">{row.comparison.routeId}</text>
              </g>
            );
          })}
          <text x="290" y={185 - (TARGET / max) * 160} textAnchor="end" className="fill-slate-500 text-[10px]">Target {TARGET}</text>
        </svg>
      </Card>
    </div>
  );
}
