'use client';

import { useEffect, useState, useCallback } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { EXPENSE_CATEGORIES } from '@/types/database';
import type { ExpenseCategory } from '@/types/database';

type Sport = { id: string; name: string };
type Event = { id: string; name: string; event_date: string | null };

const CATEGORY_COLORS: Record<string, string> = {
  entry_fee: '#60a5fa', travel: '#f59e0b', lodging: '#a78bfa',
  gear: '#fb923c', training: '#a3e635', nutrition: '#34d399', other: '#6b7280',
};

function today() {
  return new Date().toISOString().split('T')[0];
}

const inputCls =
  'w-full px-3 py-2.5 bg-[#0a0a0a] border border-[#222] text-white rounded-lg text-sm placeholder-[#333] focus:outline-none focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/10 transition-colors';
const labelCls = 'block text-[#555] text-xs font-medium uppercase tracking-wider mb-1.5';

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown
        size={13}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] pointer-events-none"
      />
    </div>
  );
}

export default function LogExpensePage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingSports, setLoadingSports] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [form, setForm] = useState({
    sport_id: '',
    amount: '',
    category: 'entry_fee' as ExpenseCategory,
    expense_date: today(),
    description: '',
    event_id: '',
  });

  // Load sports once
  useEffect(() => {
    fetch('/api/sports')
      .then((r) => r.json())
      .then((d) => {
        const list: Sport[] = d.sports ?? [];
        setSports(list);
        if (list.length > 0) setForm((f) => ({ ...f, sport_id: list[0].id }));
      })
      .finally(() => setLoadingSports(false));
  }, []);

  // Load events when sport changes
  useEffect(() => {
    if (!form.sport_id) { setEvents([]); return; }
    fetch(`/api/events?sport_id=${form.sport_id}`)
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []));
  }, [form.sport_id]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  const set = useCallback(<K extends keyof typeof form>(key: K, value: typeof form[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!form.sport_id) { setFormError('Please select a sport.'); return; }
    if (!form.amount || isNaN(parseFloat(form.amount))) { setFormError('Enter a valid amount.'); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sport_id: form.sport_id,
          amount: parseFloat(form.amount),
          category: form.category,
          expense_date: form.expense_date,
          description: form.description || undefined,
          event_id: form.event_id || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to log expense');
      }
      // Reset form but keep sport_id
      setForm((f) => ({
        ...f,
        amount: '',
        category: 'entry_fee',
        expense_date: today(),
        description: '',
        event_id: '',
      }));
      showToast('Expense logged ✓');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="max-w-lg">
        <h1 className="text-2xl font-bold text-white mb-1">Log an expense</h1>
        <p className="text-[#444] text-sm mb-8">Track spending across all your sports.</p>

        <div className="bg-[#111] border border-[#222] rounded-xl p-6">
          {loadingSports ? (
            <div className="space-y-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-[#1a1a1a] rounded-lg h-10" />
              ))}
            </div>
          ) : sports.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-[#444] text-sm mb-4">You need a sport before logging expenses.</p>
              <a
                href="/dashboard/sports"
                className="text-sm text-lime-400 hover:text-lime-300 border border-lime-400/30 px-4 py-2 rounded-lg transition-colors"
              >
                Add a sport first
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Sport */}
              <div>
                <label className={labelCls}>Sport</label>
                <SelectWrapper>
                  <select
                    value={form.sport_id}
                    onChange={(e) => set('sport_id', e.target.value)}
                    className={`${inputCls} appearance-none pr-8 cursor-pointer`}
                  >
                    {sports.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </SelectWrapper>
              </div>

              {/* Amount */}
              <div>
                <label className={labelCls}>Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444] text-sm pointer-events-none">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.amount}
                    onChange={(e) => set('amount', e.target.value)}
                    placeholder="0.00"
                    required
                    className={`${inputCls} pl-7`}
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className={labelCls}>Category</label>
                <div className="relative flex items-center">
                  <div
                    className="absolute left-3 w-2 h-2 rounded-full pointer-events-none flex-shrink-0 z-10"
                    style={{ background: CATEGORY_COLORS[form.category] ?? '#6b7280' }}
                  />
                  <select
                    value={form.category}
                    onChange={(e) => set('category', e.target.value as ExpenseCategory)}
                    className={`${inputCls} appearance-none pl-8 pr-8 cursor-pointer`}
                  >
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  <ChevronDown
                    size={13}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] pointer-events-none"
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className={labelCls}>Date</label>
                <input
                  type="date"
                  value={form.expense_date}
                  onChange={(e) => set('expense_date', e.target.value)}
                  required
                  className={`${inputCls} [color-scheme:dark]`}
                />
              </div>

              {/* Description */}
              <div>
                <label className={labelCls}>
                  Description <span className="normal-case text-[#333]">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="e.g. Chicago Marathon entry fee"
                  className={inputCls}
                />
              </div>

              {/* Event */}
              {events.length > 0 && (
                <div>
                  <label className={labelCls}>
                    Event <span className="normal-case text-[#333]">(optional)</span>
                  </label>
                  <SelectWrapper>
                    <select
                      value={form.event_id}
                      onChange={(e) => set('event_id', e.target.value)}
                      className={`${inputCls} appearance-none pr-8 cursor-pointer`}
                    >
                      <option value="">No event</option>
                      {events.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.name}{ev.event_date ? ` — ${ev.event_date}` : ''}
                        </option>
                      ))}
                    </select>
                  </SelectWrapper>
                </div>
              )}

              {formError && (
                <p className="text-red-400 text-sm">{formError}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-lime-400 text-black font-semibold py-2.5 rounded-lg text-sm hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Logging…' : 'Log expense'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-lime-400 text-black font-semibold text-sm px-4 py-3 rounded-xl shadow-lg">
          <Check size={15} />
          {toast}
        </div>
      )}
    </main>
  );
}
