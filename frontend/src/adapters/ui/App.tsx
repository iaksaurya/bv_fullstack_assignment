import { useMemo, useState } from 'react';
import { HttpDashboardApi } from '../infrastructure/http-dashboard-api';
import { DashboardService } from '../../core/application/dashboard-service';
import { RoutesTab } from './tabs/RoutesTab';
import { CompareTab } from './tabs/CompareTab';
import { BankingTab } from './tabs/BankingTab';
import { PoolingTab } from './tabs/PoolingTab';

const tabs = ['Routes', 'Compare', 'Banking', 'Pooling'] as const;
type Tab = typeof tabs[number];

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>('Routes');
  const service = useMemo(() => new DashboardService(new HttpDashboardApi()), []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-semibold">FuelEU Compliance Dashboard</h1>
            <p className="text-sm text-slate-600">Routes, comparison, banking, and pooling</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-6 flex gap-2 rounded-2xl bg-white p-2 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`rounded-xl px-4 py-2 text-sm font-medium ${activeTab === tab ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Routes' && <RoutesTab service={service} />}
        {activeTab === 'Compare' && <CompareTab service={service} />}
        {activeTab === 'Banking' && <BankingTab service={service} />}
        {activeTab === 'Pooling' && <PoolingTab service={service} />}
      </main>
    </div>
  );
}
