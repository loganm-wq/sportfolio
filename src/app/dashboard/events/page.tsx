'use client';

import { useEffect, useState, useCallback } from 'react';
import { ChevronDown, CalendarDays } from 'lucide-react';

type Sport = { id: string; name: string };
type Event = {
  id: string;
  sport_id: string;
  name: string;
  event_date: string | null;
  location: string | null;
  created_at: string;
};
type Expense = { id: string; event_id: string | null; amount: number };

const inputCls =
  'w-full px-3 py-2.5 bg-[#0a0a0a] border border-[#222] text-white rounded-lg text-sm placeholder-[#333] focus:outline-none focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/10 transition-colors';
const labelCls = 'block text-[#555] text-xs font-medium uppercase tracking-wider mb-1.5';

function fmtDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function today() {
  return new Date().toISOString().split('T')[0];
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [eventCosts, setEventCosts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    sport_id: '', name: '', event_date: today(), location: '',
  });

  const set = useCallback(<K extends keyof typeof form>(k: K, v: typeof form[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
  }, []);

  async function load() {
    try {
      const [evRes, sptRes, expRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/sports'),
        fetch('/api/expenses?limit=100'),
      ]);
      const [evData, sptData, expData] = await Promise.all([
        evRes.json(), sptRes.json(), expRes.json(),
      ]);
      const evList: Event[] = evData.events ?? [];
      const sptList: Sport[] = sptData.sports ?? [];
      const expList: Expense[] = expData.expenses ?? [];

      setEvents(evList);
      setSports(sptList);
      if (sptList.length > 0) setForm((f) => ({ ...f, sport_id: sptList[0].id }));

      // Aggregate costs per event
      const costs: Record<string, number> = {};
      expList.forEach((e) => {
        if (e.event_id) costs[e.event_id] = (costs[e.event_id] ?? 0) + Number(e.amount);
      });
      setEventCosts(costs);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAddEvent(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!form.sport_id) { setFormError('Please select a sport.'); return; }
    if (!form.name.trim()) { setFormError('Event name is required.'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sport_id: form.sport_id,
          name: form.name.trim(),
          event_date: form.event_date || undefined,
          location: form.location.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? 'Failed to add event');
      }
      setForm((f) => ({ ...f, name: '', event_date: today(), location: '' }));
      setLoading(true);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  const sportNameById = Object.fromEntries(sports.map((s) => [s.id, s.name]));

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-white mb-1">Events</h1>
      <p className="text-[#444] text-sm mb-8">Races, competitions, and tournaments you&apos;ve entered.</p>

      {/* Events list */}
      <section className="mb-10">
        <h2 className="text-[#555] text-xs font-medium uppercase tracking-wider mb-4">Your events</h2>
        <div className="bg-[#111] border border-[#222] rounded-xl">
          {loading ? (
            <div className="p-6 space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="animate-pulse bg-[#1a1a1a] rounded-lg h-14" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="py-16 text-center">
              <CalendarDays size={28} className="text-[#333] mx-auto mb-3" />
              <p className="text-[#444] text-sm">No events yet — add your first competition below.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1a1a1a]">
                    {['Event', 'Sport', 'Date', 'Location', 'Total cost'].map((h, i) => (
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
                  {events.map((ev, i) => {
                    const cost = eventCosts[ev.id] ?? 0;
                    const sportName = sportNameById[ev.sport_id] ?? '—';
                    return (
                      <tr
                        key={ev.id}
                        className={`hover:bg-[#131313] transition-colors ${i < events.length - 1 ? 'border-b border-[#111]' : ''}`}
                      >
                        <td className="px-6 py-3 text-white text-sm font-medium">{ev.name}</td>
                        <td className="px-6 py-3">
                          <span className="text-xs px-2.5 py-0.5 rounded-full border bg-[#1a1a1a] border-[#333] text-[#888] font-medium">
                            {sportName}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-[#666] text-sm whitespace-nowrap">
                          {ev.event_date ? fmtDate(ev.event_date) : '—'}
                        </td>
                        <td className="px-6 py-3 text-[#555] text-sm">{ev.location ?? '—'}</td>
                        <td className="px-6 py-3 text-right">
                          <span className={`text-sm font-semibold tabular-nums ${cost > 0 ? 'text-white' : 'text-[#333]'}`}>
                            {cost > 0 ? `$${cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Add event form */}
      <section>
        <h2 className="text-[#555] text-xs font-medium uppercase tracking-wider mb-4">Add an event</h2>
        <div className="bg-[#111] border border-[#222] rounded-xl p-6 max-w-lg">
          {sports.length === 0 && !loading ? (
            <div className="py-4 text-center">
              <p className="text-[#444] text-sm mb-3">Add a sport first before creating events.</p>
              <a
                href="/dashboard/sports"
                className="text-sm text-lime-400 hover:text-lime-300 border border-lime-400/30 px-4 py-2 rounded-lg transition-colors"
              >
                Add a sport
              </a>
            </div>
          ) : (
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className={labelCls}>Event name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="e.g. Chicago Marathon"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Sport</label>
                <div className="relative">
                  <select
                    value={form.sport_id}
                    onChange={(e) => set('sport_id', e.target.value)}
                    className={`${inputCls} appearance-none pr-8 cursor-pointer`}
                  >
                    {sports.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <ChevronDown
                    size={13}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] pointer-events-none"
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Date</label>
                <input
                  type="date"
                  value={form.event_date}
                  onChange={(e) => set('event_date', e.target.value)}
                  className={`${inputCls} [color-scheme:dark]`}
                />
              </div>
              <div>
                <label className={labelCls}>
                  Location <span className="normal-case text-[#333]">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => set('location', e.target.value)}
                  placeholder="e.g. Chicago, IL"
                  className={inputCls}
                />
              </div>
              {formError && <p className="text-red-400 text-sm">{formError}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-lime-400 text-black font-semibold py-2.5 rounded-lg text-sm hover:bg-lime-300 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Adding…' : 'Add event'}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
