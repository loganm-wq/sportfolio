'use client';

import { useEffect, useState, useCallback } from 'react';
import { ChevronDown, Dumbbell } from 'lucide-react';
import { SPORT_TYPES } from '@/types/database';
import type { SportType } from '@/types/database';

type Sport = {
  id: string;
  name: string;
  sport_type: SportType;
  is_active: boolean;
  created_at: string;
};

type SportSummary = {
  sport_id: string;
  total: number;
};

const SPORT_TYPE_BADGE: Record<string, string> = {
  running:    'bg-lime-400/10 border-lime-400/20 text-lime-400',
  cycling:    'bg-orange-400/10 border-orange-400/20 text-orange-400',
  triathlon:  'bg-purple-400/10 border-purple-400/20 text-purple-400',
  golf:       'bg-yellow-400/10 border-yellow-400/20 text-yellow-400',
  pickleball: 'bg-blue-400/10 border-blue-400/20 text-blue-400',
  bjj:        'bg-red-400/10 border-red-400/20 text-red-400',
  crossfit:   'bg-pink-400/10 border-pink-400/20 text-pink-400',
  swimming:   'bg-cyan-400/10 border-cyan-400/20 text-cyan-400',
  volleyball: 'bg-indigo-400/10 border-indigo-400/20 text-indigo-400',
  basketball: 'bg-amber-400/10 border-amber-400/20 text-amber-400',
  other:      'bg-[#1a1a1a] border-[#333] text-[#666]',
};

const inputCls =
  'w-full px-3 py-2.5 bg-[#0a0a0a] border border-[#222] text-white rounded-lg text-sm placeholder-[#333] focus:outline-none focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/10 transition-colors';
const labelCls = 'block text-[#555] text-xs font-medium uppercase tracking-wider mb-1.5';

const SPORT_TYPE_LABELS: Record<string, string> = {
  running: 'Running', cycling: 'Cycling', triathlon: 'Triathlon', golf: 'Golf',
  pickleball: 'Pickleball', bjj: 'BJJ', crossfit: 'CrossFit', swimming: 'Swimming',
  volleyball: 'Volleyball', basketball: 'Basketball', other: 'Other',
};

export default function SportsPage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [sportTotals, setSportTotals] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', sport_type: 'running' as SportType });

  const set = useCallback(<K extends keyof typeof form>(k: K, v: typeof form[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
  }, []);

  async function load() {
    try {
      const year = new Date().getFullYear();
      const [sptRes, sumRes] = await Promise.all([
        fetch('/api/sports'),
        fetch(`/api/expenses/summary?year=${year}`),
      ]);
      const [sptData, sumData] = await Promise.all([sptRes.json(), sumRes.json()]);
      setSports(sptData.sports ?? []);
      const totals: Record<string, number> = {};
      (sumData.by_sport ?? []).forEach((s: SportSummary) => {
        totals[s.sport_id] = s.total;
      });
      setSportTotals(totals);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAddSport(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!form.name.trim()) { setFormError('Sport name is required.'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/sports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), sport_type: form.sport_type }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? 'Failed to add sport');
      }
      setForm({ name: '', sport_type: 'running' });
      setLoading(true);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-white mb-1">Sports</h1>
      <p className="text-[#444] text-sm mb-8">Manage the sports you track expenses for.</p>

      {/* Sport cards */}
      <section className="mb-10">
        <h2 className="text-[#555] text-xs font-medium uppercase tracking-wider mb-4">Your sports</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="animate-pulse bg-[#111] border border-[#222] rounded-xl h-32" />
            ))}
          </div>
        ) : sports.length === 0 ? (
          <div className="bg-[#111] border border-[#222] rounded-xl py-14 text-center">
            <Dumbbell size={28} className="text-[#333] mx-auto mb-3" />
            <p className="text-[#444] text-sm">No sports yet — add your first below.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sports.map((sport) => {
              const total = sportTotals[sport.id] ?? 0;
              const badge = SPORT_TYPE_BADGE[sport.sport_type] ?? SPORT_TYPE_BADGE.other;
              return (
                <div key={sport.id} className="bg-[#111] border border-[#222] rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-white font-semibold text-lg leading-tight">{sport.name}</h3>
                    <div className="w-2 h-2 rounded-full bg-lime-400 mt-1.5 flex-shrink-0" title="Active" />
                  </div>
                  <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full border font-medium mb-4 ${badge}`}>
                    {SPORT_TYPE_LABELS[sport.sport_type] ?? sport.sport_type}
                  </span>
                  <div>
                    <p className="text-[#444] text-xs mb-0.5">Total this year</p>
                    <p className={`text-xl font-bold ${total > 0 ? 'text-white' : 'text-[#333]'}`}>
                      ${total.toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Add sport form */}
      <section>
        <h2 className="text-[#555] text-xs font-medium uppercase tracking-wider mb-4">Add a sport</h2>
        <div className="bg-[#111] border border-[#222] rounded-xl p-6 max-w-lg">
          <form onSubmit={handleAddSport} className="space-y-4">
            <div>
              <label className={labelCls}>Sport name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. Saturday Runs"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Sport type</label>
              <div className="relative">
                <select
                  value={form.sport_type}
                  onChange={(e) => set('sport_type', e.target.value as SportType)}
                  className={`${inputCls} appearance-none pr-8 cursor-pointer`}
                >
                  {SPORT_TYPES.map((t) => (
                    <option key={t} value={t}>{SPORT_TYPE_LABELS[t] ?? t}</option>
                  ))}
                </select>
                <ChevronDown
                  size={13}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] pointer-events-none"
                />
              </div>
            </div>
            {formError && <p className="text-red-400 text-sm">{formError}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-lime-400 text-black font-semibold py-2.5 rounded-lg text-sm hover:bg-lime-300 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Adding…' : 'Add sport'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
