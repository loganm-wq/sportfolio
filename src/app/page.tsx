import Link from 'next/link';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />
      <Hero />
      <SportPills />
      <Features />
      <CTABanner />
      <Footer />
    </div>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_40%,rgba(163,230,53,0.05)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 pt-20 pb-28 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div>
          <div className="inline-flex items-center gap-2 bg-[#111] border border-[#222] rounded-full px-4 py-1.5 text-sm text-[#888] mb-8">
            <span>🏃</span>
            <span>Built for athletes</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-white leading-[1.05] tracking-tight mb-6">
            Your sport.
            <br />
            <span className="text-lime-400">Finally priced.</span>
          </h1>

          <p className="text-lg md:text-xl text-[#888] leading-relaxed mb-10 max-w-lg">
            Stop guessing what your hobby costs. Sportfolio tracks every dollar across every sport
            — gear, races, travel, training — and shows you the real number.
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-8">
            <Link
              href="/signup"
              className="bg-lime-400 text-black font-semibold px-6 py-3 rounded-lg hover:bg-lime-300 transition-colors text-sm"
            >
              Start tracking free
            </Link>
            <a
              href="#features"
              className="border border-[#333] text-white font-semibold px-6 py-3 rounded-lg hover:border-[#555] hover:bg-white/5 transition-colors text-sm"
            >
              See how it works
            </a>
          </div>

          <p className="text-sm text-[#444]">Join athletes already tracking their spend</p>
        </div>

        {/* Right — Dashboard mock */}
        <div className="relative">
          <div className="absolute -inset-4 bg-lime-400/5 rounded-3xl blur-2xl" />
          <DashboardMock />
        </div>
      </div>
    </section>
  );
}

function DashboardMock() {
  const sports = [
    { name: 'Running', amount: 1748, pct: 45, color: 'bg-lime-400', dot: 'bg-lime-400' },
    { name: 'Pickleball', amount: 1205, pct: 31, color: 'bg-blue-400', dot: 'bg-blue-400' },
    { name: 'Golf', amount: 894, pct: 23, color: 'bg-yellow-400', dot: 'bg-yellow-400' },
  ];

  return (
    <div className="relative bg-[#111] border border-[#222] rounded-2xl p-6 shadow-[0_0_80px_rgba(163,230,53,0.07)]">
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-[#555] text-xs uppercase tracking-wider mb-1">
            Your 2025 athletic spend
          </p>
          <div className="text-4xl font-black text-white">$3,847</div>
          <p className="text-[#444] text-sm mt-1">across 3 sports this year</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-lime-400/10 border border-lime-400/20 flex items-center justify-center text-lime-400 flex-shrink-0">
          <ChartIcon />
        </div>
      </div>

      <div className="border-t border-[#1a1a1a] mb-5" />

      <div className="space-y-4">
        {sports.map((sport) => (
          <div key={sport.name}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2.5">
                <div className={`w-2 h-2 rounded-full ${sport.dot}`} />
                <span className="text-white text-sm">{sport.name}</span>
              </div>
              <span className="text-white text-sm font-semibold tabular-nums">
                ${sport.amount.toLocaleString()}
              </span>
            </div>
            <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div
                className={`h-full ${sport.color} rounded-full opacity-80`}
                style={{ width: `${sport.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-[#1a1a1a] mt-5 pt-4 flex items-center justify-between">
        <p className="text-[#444] text-xs">↑ 23% vs last year</p>
        <span className="text-[#333] text-xs">Updated just now</span>
      </div>
    </div>
  );
}

// ─── Sport pills ───────────────────────────────────────────────────────────────

function SportPills() {
  const pills = [
    { emoji: '🏃', name: 'Running', cls: 'border-lime-400/25 hover:border-lime-400/50', rot: 'rotate-1' },
    { emoji: '🎾', name: 'Pickleball', cls: 'border-blue-400/25 hover:border-blue-400/50', rot: '-rotate-1' },
    { emoji: '⛳', name: 'Golf', cls: 'border-yellow-400/25 hover:border-yellow-400/50', rot: 'rotate-2' },
    { emoji: '🚴', name: 'Cycling', cls: 'border-orange-400/25 hover:border-orange-400/50', rot: '-rotate-2' },
    { emoji: '🥊', name: 'BJJ', cls: 'border-red-400/25 hover:border-red-400/50', rot: 'rotate-1' },
    { emoji: '🏊', name: 'Triathlon', cls: 'border-purple-400/25 hover:border-purple-400/50', rot: '-rotate-1' },
  ];

  return (
    <section className="py-24 border-t border-[#111]">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-[#555] text-xs text-center uppercase tracking-widest mb-4">
          Track every sport
        </p>
        <h2 className="text-center text-3xl md:text-4xl font-bold text-white mb-14">
          Every sport. Every dollar.
        </h2>

        <div className="flex flex-wrap justify-center gap-4">
          {pills.map((pill) => (
            <div
              key={pill.name}
              className={`flex items-center gap-2.5 bg-[#111] border ${pill.cls} ${pill.rot} rounded-full px-5 py-2.5 text-white text-sm font-medium transition-all cursor-default select-none`}
            >
              <span className="text-base">{pill.emoji}</span>
              <span>{pill.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ──────────────────────────────────────────────────────────────────

function Features() {
  const cards = [
    {
      icon: <DollarIcon />,
      title: 'See the real number',
      body: 'The average runner spends $1,748/year. Most guess half that. Sportfolio shows you what your sport actually costs — down to the dollar.',
    },
    {
      icon: <TagIcon />,
      title: 'Every category tracked',
      body: 'Entry fees, travel, gear, coaching, nutrition — logged in seconds, organized automatically by sport and season.',
    },
    {
      icon: <CalendarIcon />,
      title: 'Season forecaster',
      body: 'Add your race calendar. We estimate what your season will cost before you spend a dollar.',
    },
  ];

  return (
    <section id="features" className="py-24 border-t border-[#111]">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-[#555] text-xs text-center uppercase tracking-widest mb-4">
          What you get
        </p>
        <h2 className="text-center text-3xl md:text-4xl font-bold text-white mb-14">
          Everything you need to know your number
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cards.map((card) => (
            <div
              key={card.title}
              className="group bg-[#111] border border-[#1e1e1e] rounded-2xl p-6 hover:border-[#2a2a2a] hover:bg-[#131313] transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] border border-[#222] flex items-center justify-center text-lime-400 mb-5">
                {card.icon}
              </div>
              <h3 className="text-white font-semibold text-lg mb-3">{card.title}</h3>
              <p className="text-[#666] text-sm leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Banner ────────────────────────────────────────────────────────────────

function CTABanner() {
  return (
    <section className="py-24 border-t border-[#111]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative bg-[#111] border border-[#222] rounded-3xl px-8 py-20 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,rgba(163,230,53,0.08)_0%,transparent_70%)] pointer-events-none" />

          <h2 className="relative text-4xl md:text-5xl font-black text-white mb-4">
            Ready to see your real number?
          </h2>
          <p className="relative text-[#666] text-lg mb-10">
            Free to start. No credit card required.
          </p>
          <Link
            href="/signup"
            className="relative inline-block bg-lime-400 text-black font-bold px-8 py-4 rounded-xl text-base hover:bg-lime-300 transition-colors shadow-[0_0_40px_rgba(163,230,53,0.2)]"
          >
            Get started free →
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Icons ─────────────────────────────────────────────────────────────────────

function ChartIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function DollarIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
