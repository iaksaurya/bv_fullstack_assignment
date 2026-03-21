import { useEffect, useState } from 'react';
import type { DashboardService } from '../../../core/application/dashboard-service';
import { Card, ErrorBanner, StatCard } from '../components';

export function BankingTab({ service }: { service: DashboardService }) {
  const [shipId, setShipId] = useState('R003');
  const [year, setYear] = useState(2024);
  const [cb, setCb] = useState<number | null>(null);
  const [result, setResult] = useState<{ cb_before: number; applied: number; cb_after: number } | null>(null);
  const [banked, setBanked] = useState(0);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  async function load() {
    try {
      setError('');
      const snapshot = await service.getCb(shipId, year);
      const records = await service.getBankRecords(shipId, year);
      setCb(snapshot.cb);
      setBanked(records.reduce((sum, item) => sum + item.amountGco2eq, 0));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  useEffect(() => { void load(); }, [shipId, year]);

  async function handleBank() {
    try {
      setError('');
      await service.bank({ shipId, year });
      await load();
    } catch (err) { setError((err as Error).message); }
  }

  async function handleApply() {
    try {
      setError('');
      const applied = await service.applyBank({ shipId, year, amount: Number(amount) });
      setResult(applied);
      await load();
    } catch (err) { setError((err as Error).message); }
  }

  return (
    <div className="space-y-4">
      <Card title="Banking controls">
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <input className="rounded-xl border p-2" value={shipId} onChange={(e) => setShipId(e.target.value)} />
          <input className="rounded-xl border p-2" type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
          <input className="rounded-xl border p-2" type="number" placeholder="Apply amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        {error && <ErrorBanner message={error} />}
        <div className="flex gap-3">
          <button className="rounded-lg bg-emerald-700 px-4 py-2 text-white disabled:opacity-50" disabled={(cb ?? 0) <= 0} onClick={handleBank}>
            Bank positive CB
          </button>
          <button className="rounded-lg bg-slate-900 px-4 py-2 text-white disabled:opacity-50" disabled={(cb ?? 0) >= 0 || !amount || banked <= 0} onClick={handleApply}>
            Apply banked surplus
          </button>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="CB" value={cb === null ? '—' : cb.toFixed(2)} />
        <StatCard label="Banked available" value={banked.toFixed(2)} />
        <StatCard label="Applied" value={result ? result.applied.toFixed(2) : '—'} />
        <StatCard label="CB after" value={result ? result.cb_after.toFixed(2) : '—'} />
      </div>
    </div>
  );
}
