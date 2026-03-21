import { useEffect, useMemo, useState } from 'react';
import type { DashboardService } from '../../../core/application/dashboard-service';
import { Card, ErrorBanner } from '../components';
import type { AdjustedCb } from '../../../core/domain/models';

export function PoolingTab({ service }: { service: DashboardService }) {
  const [year, setYear] = useState(2024);
  const [members, setMembers] = useState<AdjustedCb[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [result, setResult] = useState<null | { members: Array<{ shipId: string; cbBefore: number; cbAfter: number }> }>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    service.getAdjustedCb(year).then(setMembers).catch((err) => setError((err as Error).message));
  }, [year]);

  const selectedMembers = useMemo(
    () => members.filter((member) => selected[member.shipId]).map((member) => ({ shipId: member.shipId, cbBefore: member.adjustedCb })),
    [members, selected]
  );

  const sum = selectedMembers.reduce((acc, member) => acc + member.cbBefore, 0);
  const valid = selectedMembers.length > 0 && sum >= 0;

  async function handleCreate() {
    try {
      setError('');
      const pool = await service.createPool({ year, members: selectedMembers });
      setResult(pool);
    } catch (err) { setError((err as Error).message); }
  }

  return (
    <div className="space-y-4">
      <Card title="Pooling">
        <div className="mb-4 flex gap-3">
          <input className="rounded-xl border p-2" type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
          <div className={`rounded-xl px-4 py-2 text-sm font-medium ${sum >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
            Pool Sum: {sum.toFixed(2)}
          </div>
        </div>

        {error && <ErrorBanner message={error} />}

        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-3 py-2">Select</th>
              <th className="px-3 py-2">Ship</th>
              <th className="px-3 py-2">CB before</th>
              <th className="px-3 py-2">Banked</th>
              <th className="px-3 py-2">Adjusted CB</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.shipId} className="border-b">
                <td className="px-3 py-2"><input type="checkbox" checked={Boolean(selected[member.shipId])} onChange={(e) => setSelected((s) => ({ ...s, [member.shipId]: e.target.checked }))} /></td>
                <td className="px-3 py-2">{member.shipId}</td>
                <td className="px-3 py-2">{member.cb.toFixed(2)}</td>
                <td className="px-3 py-2">{member.bankedAvailable.toFixed(2)}</td>
                <td className="px-3 py-2">{member.adjustedCb.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <button className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-white disabled:opacity-50" disabled={!valid} onClick={handleCreate}>
          Create Pool
        </button>
      </Card>

      {result && (
        <Card title="Pool result">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-left">
              <tr>
                <th className="px-3 py-2">Ship</th>
                <th className="px-3 py-2">CB before</th>
                <th className="px-3 py-2">CB after</th>
              </tr>
            </thead>
            <tbody>
              {result.members.map((member) => (
                <tr key={member.shipId} className="border-b">
                  <td className="px-3 py-2">{member.shipId}</td>
                  <td className="px-3 py-2">{member.cbBefore.toFixed(2)}</td>
                  <td className="px-3 py-2">{member.cbAfter.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
