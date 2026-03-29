'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Activity, DollarSign } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type ProfileData = {
  profile: {
    full_name: string | null;
    email: string;
    created_at: string;
  };
  stats: {
    expense_count: number;
    sport_count: number;
    total_spent: number;
  };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string | null, email: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }
  return email[0].toUpperCase();
}

function fmtMemberSince(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

function fmtUsd(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Delete confirmation modal ────────────────────────────────────────────────

function DeleteModal({
  onCancel,
  onConfirm,
  deleting,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  deleting: boolean;
}) {
  const [input, setInput] = useState('');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111] border border-[#222] rounded-2xl w-full max-w-md p-8">
        <h2 className="text-lg font-bold text-white mb-2">Delete account?</h2>
        <p className="text-[#555] text-sm mb-6 leading-relaxed">
          This will permanently delete your account and all your data — sports, events,
          and expenses. This cannot be undone.
        </p>
        <div className="mb-6">
          <label className="block text-[#555] text-xs font-medium uppercase tracking-wider mb-1.5">
            Type <span className="text-red-400 font-bold">DELETE</span> to confirm
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="DELETE"
            autoFocus
            className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[#222] text-white rounded-lg text-sm placeholder-[#333] focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/10 transition-colors"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium text-[#888] border border-[#222] hover:border-[#333] hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={input !== 'DELETE' || deleting}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-red-400 border border-red-500/40 hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {deleting ? 'Deleting…' : 'Delete account'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-[#111] border border-[#222] rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[#555] text-xs font-medium uppercase tracking-wider">{label}</p>
        <div className="text-[#333]">{icon}</div>
      </div>
      <p className="text-2xl font-bold text-white truncate">{value}</p>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-[#1a1a1a] rounded-xl ${className}`} />;
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [nameInput, setNameInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((d: ProfileData) => {
        setData(d);
        setNameInput(d.profile.full_name ?? '');
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (!data) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: nameInput }),
      });
      if (!res.ok) throw new Error('Save failed');
      setData((d) => d ? { ...d, profile: { ...d.profile, full_name: nameInput.trim() || null } } : d);
      setSaveMsg('Saved');
      setTimeout(() => setSaveMsg(null), 2000);
    } catch {
      setSaveMsg('Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await fetch('/api/account', { method: 'DELETE' });
      window.location.href = '/';
    } catch {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Skeleton className="h-7 w-32 mb-8" />
        <Skeleton className="h-40 max-w-lg mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-32 max-w-lg" />
      </main>
    );
  }

  if (!data) return null;

  const { profile, stats } = data;
  const initials = getInitials(profile.full_name, profile.email);
  const nameChanged = nameInput !== (profile.full_name ?? '');

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-white mb-8">Profile</h1>

      {/* User info card */}
      <section className="bg-[#111] border border-[#222] rounded-xl p-6 max-w-lg mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-[#a3e635]/10 border border-[#a3e635]/20 flex items-center justify-center flex-shrink-0">
            <span className="text-[#a3e635] text-xl font-bold">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold truncate">
              {profile.full_name ?? profile.email}
            </p>
            <p className="text-[#444] text-xs mt-0.5">
              Member since {fmtMemberSince(profile.created_at)}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[#555] text-xs font-medium uppercase tracking-wider mb-1.5">
              Full name
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Your name"
              className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[#222] text-white rounded-lg text-sm placeholder-[#333] focus:outline-none focus:border-[#a3e635]/50 focus:ring-1 focus:ring-[#a3e635]/10 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[#555] text-xs font-medium uppercase tracking-wider mb-1.5">
              Email
            </label>
            <div className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[#1a1a1a] text-[#555] rounded-lg text-sm select-none">
              {profile.email}
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !nameChanged}
            className="bg-[#a3e635] text-black font-semibold px-5 py-2 rounded-lg text-sm hover:bg-lime-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          {saveMsg && (
            <span className={`text-xs ${saveMsg === 'Saved' ? 'text-[#a3e635]' : 'text-red-400'}`}>
              {saveMsg}
            </span>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="mb-10">
        <h2 className="text-[#555] text-xs font-medium uppercase tracking-wider mb-4">Your stats</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Expenses logged"
            value={stats.expense_count.toLocaleString()}
            icon={<Activity size={16} />}
          />
          <StatCard
            label="Sports tracked"
            value={stats.sport_count.toLocaleString()}
            icon={<TrendingUp size={16} />}
          />
          <StatCard
            label="Total spent"
            value={`$${fmtUsd(stats.total_spent)}`}
            icon={<DollarSign size={16} />}
          />
        </div>
      </section>

      {/* Danger zone */}
      <section className="max-w-lg">
        <div className="border border-red-500/20 rounded-xl p-6">
          <h2 className="text-red-400 font-semibold text-sm mb-1">Danger Zone</h2>
          <p className="text-[#555] text-sm mb-5 leading-relaxed">
            Permanently delete your account and all your data. This cannot be undone.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="text-sm font-semibold text-red-400 border border-red-500/40 px-4 py-2 rounded-lg hover:bg-red-500/10 transition-colors"
          >
            Delete account
          </button>
        </div>
      </section>

      {showDeleteModal && (
        <DeleteModal
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </main>
  );
}
