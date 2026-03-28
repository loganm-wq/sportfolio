'use client';

import { useState, useCallback } from 'react';
import { CheckCircle, ChevronDown } from 'lucide-react';
import { EXPENSE_CATEGORIES } from '@/types/database';
import type { ExpenseCategory } from '@/types/database';

// ─── Sport options ────────────────────────────────────────────────────────────

type SportOption = {
  emoji: string;
  label: string;
  sportType: string;
  isOther?: boolean;
};

const SPORT_OPTIONS: SportOption[] = [
  { emoji: '🏃', label: 'Running',    sportType: 'running'    },
  { emoji: '🚴', label: 'Cycling',    sportType: 'cycling'    },
  { emoji: '🏊', label: 'Triathlon',  sportType: 'triathlon'  },
  { emoji: '⛳', label: 'Golf',       sportType: 'golf'       },
  { emoji: '🎾', label: 'Pickleball', sportType: 'pickleball' },
  { emoji: '🥊', label: 'BJJ',        sportType: 'bjj'        },
  { emoji: '💪', label: 'CrossFit',   sportType: 'crossfit'   },
  { emoji: '🏀', label: 'Basketball', sportType: 'basketball' },
  { emoji: '🏐', label: 'Volleyball', sportType: 'volleyball' },
  { emoji: '🎽', label: 'Other',      sportType: 'other', isOther: true },
];

const OTHER_INDEX = SPORT_OPTIONS.findIndex((o) => o.isOther);

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputCls =
  'w-full px-3 py-2.5 bg-[#0a0a0a] border border-[#222] text-white rounded-lg text-sm placeholder-[#333] focus:outline-none focus:border-[#a3e635]/50 focus:ring-1 focus:ring-[#a3e635]/10 transition-colors';
const labelCls = 'block text-[#555] text-xs font-medium uppercase tracking-wider mb-1.5';
const greenBtn =
  'w-full bg-[#a3e635] text-black font-semibold py-3 rounded-lg text-sm hover:bg-lime-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors';
const skipBtn =
  'w-full text-[#444] text-sm hover:text-[#666] transition-colors py-1';

// ─── Types ────────────────────────────────────────────────────────────────────

type CreatedSport = { id: string; name: string };

type ExpenseForm = {
  sport_id: string;
  amount: string;
  category: ExpenseCategory;
  expense_date: string;
  description: string;
};

function today() {
  return new Date().toISOString().split('T')[0];
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function OnboardingFlow() {
  const [dismissed, setDismissed] = useState(false);
  const [step, setStep] = useState(1);
  const [fading, setFading] = useState(false);

  // Step 2 state
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [customName, setCustomName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Step 3 state
  const [createdSports, setCreatedSports] = useState<CreatedSport[]>([]);
  const [expenseForm, setExpenseForm] = useState<ExpenseForm>({
    sport_id: '',
    amount: '',
    category: 'entry_fee',
    expense_date: today(),
    description: '',
  });

  // Step 4 state
  const [expenseLogged, setExpenseLogged] = useState(false);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const setExp = useCallback(<K extends keyof ExpenseForm>(k: K, v: ExpenseForm[K]) => {
    setExpenseForm((f) => ({ ...f, [k]: v }));
  }, []);

  function advance(to: number) {
    setFading(true);
    setTimeout(() => {
      setStep(to);
      setFading(false);
    }, 200);
  }

  function toggleSport(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  // ── Step handlers ─────────────────────────────────────────────────────────

  async function handleSportsSubmit() {
    setSubmitting(true);
    try {
      const toCreate = Array.from(selected).map((i) => {
        const opt = SPORT_OPTIONS[i];
        return {
          name: opt.isOther ? (customName.trim() || 'Other') : opt.label,
          sport_type: opt.sportType,
        };
      });

      const results = await Promise.all(
        toCreate.map((s) =>
          fetch('/api/sports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(s),
          }).then((r) => r.json())
        )
      );

      const sports: CreatedSport[] = results
        .filter((r): r is { id: string; name: string } => typeof r?.id === 'string')
        .map((r) => ({ id: r.id, name: r.name }));

      setCreatedSports(sports);
      if (sports.length > 0) setExp('sport_id', sports[0].id);
      advance(3);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleExpenseSubmit() {
    setSubmitting(true);
    try {
      await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sport_id: expenseForm.sport_id,
          amount: parseFloat(expenseForm.amount),
          category: expenseForm.category,
          expense_date: expenseForm.expense_date,
          description: expenseForm.description || undefined,
        }),
      });
      setExpenseLogged(true);
      advance(4);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleComplete() {
    await fetch('/api/onboarding/complete', { method: 'POST' });
    setDismissed(true);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (dismissed) return null;

  const otherSelected = selected.has(OTHER_INDEX);

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111] border border-[#222] rounded-2xl w-full max-w-lg p-8 sm:p-10 max-h-[90vh] overflow-y-auto">

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                s <= step ? 'bg-[#a3e635]' : 'bg-[#333]'
              }`}
            />
          ))}
        </div>

        {/* Content with fade */}
        <div className={`transition-opacity duration-200 ${fading ? 'opacity-0' : 'opacity-100'}`}>

          {/* ── Step 1: Welcome ────────────────────────────────────────────── */}
          {step === 1 && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-3">
                Welcome to Sportfolio 👋
              </h1>
              <p className="text-[#555] text-sm leading-relaxed mb-8">
                You&apos;re about to find out what your sport actually costs you.
                It takes 2 minutes to get set up.
              </p>
              <button onClick={() => advance(2)} className={greenBtn}>
                Let&apos;s go →
              </button>
            </div>
          )}

          {/* ── Step 2: Sport selection ────────────────────────────────────── */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                What sports do you play?
              </h2>
              <p className="text-[#555] text-sm mb-6">
                Select all that apply — we&apos;ll set them up for you
              </p>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {SPORT_OPTIONS.map((opt, i) => {
                  const isSelected = selected.has(i);
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => toggleSport(i)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all duration-150 ${
                        isSelected
                          ? 'border-[#a3e635] bg-[#a3e635]/10 text-white'
                          : 'border-[#222] bg-[#0a0a0a] text-[#666] hover:border-[#333] hover:text-[#888]'
                      }`}
                    >
                      <span className="text-xl leading-none">{opt.emoji}</span>
                      <span className="text-xs font-medium">{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              {otherSelected && (
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="What sport? e.g. Tennis"
                  className={`${inputCls} mb-4`}
                  autoFocus
                />
              )}

              <button
                onClick={handleSportsSubmit}
                disabled={selected.size === 0 || submitting}
                className={`${greenBtn} mb-3`}
              >
                {submitting ? 'Adding sports…' : 'Continue →'}
              </button>
              <button onClick={() => advance(4)} className={skipBtn}>
                Skip for now
              </button>
            </div>
          )}

          {/* ── Step 3: Log first expense ──────────────────────────────────── */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                Log your first expense
              </h2>
              <p className="text-[#555] text-sm mb-6">
                What&apos;s the last thing you spent money on for your sport?
              </p>

              <div className="space-y-4 mb-6">
                {/* Sport */}
                <div>
                  <label className={labelCls}>Sport</label>
                  <div className="relative">
                    <select
                      value={expenseForm.sport_id}
                      onChange={(e) => setExp('sport_id', e.target.value)}
                      className={`${inputCls} appearance-none pr-8 cursor-pointer`}
                    >
                      {createdSports.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <ChevronDown
                      size={13}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] pointer-events-none"
                    />
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className={labelCls}>Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444] text-sm pointer-events-none">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={expenseForm.amount}
                      onChange={(e) => setExp('amount', e.target.value)}
                      placeholder="0.00"
                      className={`${inputCls} pl-7`}
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className={labelCls}>Category</label>
                  <div className="relative">
                    <select
                      value={expenseForm.category}
                      onChange={(e) => setExp('category', e.target.value as ExpenseCategory)}
                      className={`${inputCls} appearance-none pr-8 cursor-pointer`}
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
                    value={expenseForm.expense_date}
                    onChange={(e) => setExp('expense_date', e.target.value)}
                    className={`${inputCls} [color-scheme:dark]`}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className={labelCls}>
                    Description{' '}
                    <span className="normal-case text-[#333]">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={expenseForm.description}
                    onChange={(e) => setExp('description', e.target.value)}
                    placeholder="e.g. Race entry fee"
                    className={inputCls}
                  />
                </div>
              </div>

              <button
                onClick={handleExpenseSubmit}
                disabled={!expenseForm.amount || !expenseForm.sport_id || submitting}
                className={`${greenBtn} mb-3`}
              >
                {submitting ? 'Logging…' : 'Log it →'}
              </button>
              <button onClick={() => advance(4)} className={skipBtn}>
                Skip for now
              </button>
            </div>
          )}

          {/* ── Step 4: All set ────────────────────────────────────────────── */}
          {step === 4 && (
            <div className="text-center">
              <div className="flex justify-center mb-5">
                <CheckCircle size={52} className="text-[#a3e635]" strokeWidth={1.5} />
              </div>

              <h2 className="text-2xl font-bold text-white mb-5">
                You&apos;re all set!
              </h2>

              {(createdSports.length > 0 || expenseLogged) && (
                <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4 mb-6 text-left space-y-2.5">
                  {createdSports.length > 0 && (
                    <div className="flex items-center gap-2.5 text-sm">
                      <span className="text-[#a3e635] font-bold">✓</span>
                      <span className="text-[#888]">
                        {createdSports.length} sport{createdSports.length !== 1 ? 's' : ''} added
                      </span>
                    </div>
                  )}
                  {expenseLogged && (
                    <div className="flex items-center gap-2.5 text-sm">
                      <span className="text-[#a3e635] font-bold">✓</span>
                      <span className="text-[#888]">First expense logged</span>
                    </div>
                  )}
                </div>
              )}

              <p className="text-[#444] text-sm leading-relaxed mb-8">
                Sportfolio will now track every dollar across your athletic life.
                Check back after a few expenses to see your insights.
              </p>

              <button onClick={handleComplete} className={greenBtn}>
                Go to my dashboard →
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
