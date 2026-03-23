'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, Activity, Clock, Plus } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type SportSummary = {
  sport_id: string;
  sport_name: string;
  total: number;
  by_category: Record<string, number>;
};

type SummaryData = {
  year: number;
  total_annual: number;
  by_sport: SportSummary[];
};

type Expense = {
  id: string;
  sport_id: string;
  event_id: string | null;
  amount: number;
  category: string;
  description: string | null;
  expense_date: string;
  sport_name: string | null;
};

type Sport = {
  id: string;
  name: string;
  sport_type: string;
  is_active: boolean;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_META: Record<string, { label: string; hex: string; badge: string }> = {
  entry_fee: { label: 'Entry Fee', hex: '#60a5fa', badge: 'bg-blue-400/10 border-blue-400/20 text-blue-400' },
  travel:    { label: 'Travel',    hex: '#f59e0b', badge: 'bg-amber-400/10 border-amber-400/20 text-amber-400' },
  lodging:   { label: 'Lodging',   hex: '#a78bfa', badge: 'bg-violet-400/10 border-violet-400/20 text-violet-400' },
  gear:      { label: 'Gear',      hex: '#fb923c', badge: 'bg-orange-400/10 border-orange-400/20 text-orange-400' },
  training:  { label: 'Training',  hex: '#a3e635', badge: 'bg-lime-400/10 border-lime-400/20 text-lime-400' },
  nutrition: { label: 'Nutrition', hex: '#34d399', badge: 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400' },
  other:     { label: 'Other',     hex: '#6b7280', badge: 'bg-[#1a1a1a] border-[#333] text-[#666]' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function fmtUsd(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: string }) {
  const meta = CATEGORY_META[category] ?? CATEGORY_META.other;
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full border font-medium ${meta.badge}`}>
      {meta.label}
    </span>
  );
}

function StatCard({
  label, value, sub, valueClass, icon,
}: {
  label: string; value: string; sub?: string; valueClass?: string; icon: React.ReactNode;
}) {
  return (
    <div className="bg-[#111] border border-[#222] rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[#555] text-xs font-medium uppercase tracking-wider">{label}</p>
        <div className="text-[#333]">{icon}</div>
      </div>
      <p className={`text-2xl font-bold truncate ${valueClass ?? 'text-white'}`}>{value}</p>
      {sub && <p className="text-[#444] text-xs mt-1">{sub}</p>}
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-[#1a1a1a] rounded-xl ${className}`} />;
}

function EmptyChart({ message, cta }: { message: string; cta?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-[220px] text-center px-4">
      <p className="text-[#333] text-sm mb-4">{message}</p>
      {cta && (
        <Link
          href="/dashboard/log"
          className="text-xs text-lime-400 hover:text-lime-300 border border-lime-400/30 px-3 py-1.5 rounded-lg transition-colors"
        >
          Log an expense
        </Link>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const year = new Date().getFullYear();

  useEffect(() => {
    setMounted(true);
    async function load() {
      try {
        const [sumRes, expRes, sptRes] = await Promise.all([
          fetch(`/api/expenses/summary?year=${year}`),
          fetch('/api/expenses?limit=10'),
          fetch('/api/sports'),
        ]);
        if (!sumRes.ok || !expRes.ok || !sptRes.ok) throw new Error('Failed to load');
        const [sumData, expData, sptData] = await Promise.all([
          sumRes.json(), expRes.json(), sptRes.json(),
        ]);
        setSummary(sumData);
        setExpenses(expData.expenses ?? []);
        setSports(sptData.sports ?? []);
      } catch {
        setError('Failed to load dashboard data. Please refresh.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [year]);

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-[#111] border border-[#222] rounded-xl p-8 text-center">
          <p className="text-[#666] text-sm">{error}</p>
        </div>
      </main>
    );
  }

  // Derived chart data
  const sportBarData = (summary?.by_sport ?? []).map((s) => ({
    name: s.sport_name,
    amount: s.total,
  }));

  const categoryTotals = (summary?.by_sport ?? []).reduce<Record<string, number>>(
    (acc, sport) => {
      Object.entries(sport.by_category).forEach(([k, v]) => {
        acc[k] = (acc[k] ?? 0) + v;
      });
      return acc;
    },
    {}
  );
  const categoryPieData = Object.entries(categoryTotals)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({ key, value, name: CATEGORY_META[key]?.label ?? key }));

  const lastExpense = expenses[0];
  const totalAnnual = summary?.total_annual ?? 0;

  const tooltipStyle = {
    contentStyle: {
      background: '#111', border: '1px solid #222', borderRadius: '8px',
      color: '#fff', fontSize: 12, padding: '8px 12px',
    },
    cursor: { fill: 'rgba(255,255,255,0.03)' },
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Your athletic spend</h1>
        <p className="text-[#444] text-sm mt-1">{year}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Total this year"
          value={`$${Math.round(totalAnnual).toLocaleString()}`}
          valueClass="text-lime-400"
          icon={<TrendingUp size={16} />}
        />
        <StatCard
          label="Sports tracked"
          value={String(sports.length)}
          sub={sports.length === 0 ? 'Add your first sport' : undefined}
          icon={<Activity size={16} />}
        />
        <StatCard
          label="Last expense"
          value={lastExpense ? fmtDate(lastExpense.expense_date) : 'None yet'}
          sub={lastExpense ? `$${fmtUsd(Number(lastExpense.amount))}` : undefined}
          icon={<Clock size={16} />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4 mb-6">
        {/* Bar chart */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-6">
          <h2 className="text-white font-semibold text-sm mb-0.5">Spend by sport</h2>
          <p className="text-[#444] text-xs mb-5">Year to date</p>
          {sportBarData.length > 0 && mounted ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={sportBarData} margin={{ top: 28, right: 8, bottom: 0, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#666', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `$${v}`}
                  tick={{ fill: '#555', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={58}
                />
                <Tooltip
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Spent']}
                  {...tooltipStyle}
                />
                <Bar dataKey="amount" fill="#a3e635" radius={[4, 4, 0, 0]} maxBarSize={72}>
                  <LabelList
                    dataKey="amount"
                    position="top"
                    formatter={(v: unknown) => `$${Number(v).toLocaleString()}`}
                    style={{ fill: '#666', fontSize: 11 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart
              message="Add your first expense to see your sport breakdown"
              cta={sportBarData.length === 0}
            />
          )}
        </div>

        {/* Donut chart */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-6">
          <h2 className="text-white font-semibold text-sm mb-0.5">By category</h2>
          <p className="text-[#444] text-xs mb-4">All sports combined</p>
          {categoryPieData.length > 0 && mounted ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={82}
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {categoryPieData.map((entry) => (
                      <Cell
                        key={entry.key}
                        fill={CATEGORY_META[entry.key]?.hex ?? '#6b7280'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `$${Number(value).toLocaleString()}`}
                    contentStyle={tooltipStyle.contentStyle}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {categoryPieData.map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: CATEGORY_META[item.key]?.hex ?? '#6b7280' }}
                      />
                      <span className="text-[#666] text-xs">{item.name}</span>
                    </div>
                    <span className="text-white text-xs font-medium tabular-nums">
                      ${item.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyChart message="No category data yet" />
          )}
        </div>
      </div>

      {/* Recent expenses */}
      <div className="bg-[#111] border border-[#222] rounded-xl">
        <div className="px-6 py-4 border-b border-[#1a1a1a] flex items-center justify-between">
          <h2 className="text-white font-semibold text-sm">Recent expenses</h2>
          <Link
            href="/dashboard/log"
            className="flex items-center gap-1 text-xs text-lime-400 hover:text-lime-300 transition-colors"
          >
            <Plus size={12} /> Log expense
          </Link>
        </div>

        {expenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1a1a1a]">
                  {['Date', 'Sport', 'Category', 'Description', 'Amount'].map((h, i) => (
                    <th
                      key={h}
                      className={`text-[#444] text-xs font-medium px-6 py-3 ${i === 4 ? 'text-right' : 'text-left'}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expenses.map((e, i) => (
                  <tr
                    key={e.id}
                    className={`hover:bg-[#131313] transition-colors ${i < expenses.length - 1 ? 'border-b border-[#111]' : ''}`}
                  >
                    <td className="px-6 py-3 text-[#888] text-sm whitespace-nowrap">{fmtDate(e.expense_date)}</td>
                    <td className="px-6 py-3 text-white text-sm">{e.sport_name ?? '—'}</td>
                    <td className="px-6 py-3"><CategoryBadge category={e.category} /></td>
                    <td className="px-6 py-3 text-[#555] text-sm max-w-[200px] truncate">{e.description ?? '—'}</td>
                    <td className="px-6 py-3 text-white text-sm font-semibold text-right tabular-nums">
                      ${fmtUsd(Number(e.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="text-[#333] text-sm mb-4">No expenses logged yet</p>
            <Link
              href="/dashboard/log"
              className="text-sm text-lime-400 hover:text-lime-300 border border-lime-400/30 px-4 py-2 rounded-lg transition-colors"
            >
              Log your first expense
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

function LoadingSkeleton() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <Skeleton className="h-7 w-52 mb-2" />
      <Skeleton className="h-4 w-16 mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-24" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4 mb-6">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
      <Skeleton className="h-64" />
    </main>
  );
}
