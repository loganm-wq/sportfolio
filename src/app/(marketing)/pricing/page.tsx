'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

type Billing = 'monthly' | 'annual';

// ─── Data ──────────────────────────────────────────────────────────────────────

type Plan = {
  name: string;
  subtitle: string;
  monthlyDisplay: string;
  annualMonthlyDisplay: string;
  annualTotal: number | null;
  features: string[];
  cta: string;
  ctaHref: string;
  ctaVariant: 'primary' | 'ghost';
  featured: boolean;
};

const plans: Plan[] = [
  {
    name: 'Free',
    subtitle: 'Get started, no card needed',
    monthlyDisplay: '$0',
    annualMonthlyDisplay: '$0',
    annualTotal: null,
    features: [
      '1 sport',
      '3 months of history',
      'Basic annual total',
      'Manual expense logging',
    ],
    cta: 'Get started free',
    ctaHref: '/signup',
    ctaVariant: 'ghost',
    featured: false,
  },
  {
    name: 'Core',
    subtitle: 'For the serious recreational athlete',
    monthlyDisplay: '$9',
    annualMonthlyDisplay: '$6.58',
    annualTotal: 79,
    features: [
      'Up to 3 sports',
      'Full expense history',
      'AI weekly insights',
      'Season cost forecaster',
      'Per-event cost breakdown',
      'Category breakdown by sport',
    ],
    cta: 'Start free trial',
    ctaHref: '/signup',
    ctaVariant: 'primary',
    featured: true,
  },
  {
    name: 'Competitor',
    subtitle: 'For multi-sport athletes who compete seriously',
    monthlyDisplay: '$15',
    annualMonthlyDisplay: '$10.75',
    annualTotal: 129,
    features: [
      'Up to 5 sports',
      'Everything in Core',
      'Partner seat',
      'Annual PDF report',
      'Gear ROI scoring',
      'Priority support',
    ],
    cta: 'Start free trial',
    ctaHref: '/signup',
    ctaVariant: 'ghost',
    featured: false,
  },
];

const faqs = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel anytime from your account settings. No questions asked.',
  },
  {
    q: 'What counts as a sport?',
    a: 'Anything you spend money on — running, golf, pickleball, BJJ, cycling, triathlon, crossfit, swimming. You pick the name.',
  },
  {
    q: 'Is my data private?',
    a: 'Completely. Your expense data is never shared or sold. Ever.',
  },
  {
    q: 'Do you offer refunds?',
    a: "Yes — if you upgrade and aren't happy within 7 days we'll refund you fully.",
  },
];

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>('annual');

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />

      <main>
        {/* Header */}
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-14 text-center">
          <p className="text-[#555] text-xs uppercase tracking-widest mb-4">Pricing</p>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Simple, Transparent pricing
          </h1>
          <p className="text-[#666] text-lg max-w-md mx-auto mb-12">
            Start free. Upgrade when you&apos;re ready.
          </p>

          <BillingToggle billing={billing} onChange={setBilling} />
        </section>

        {/* Cards */}
        <section className="max-w-5xl mx-auto px-6 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            {plans.map((plan) => (
              <PlanCard key={plan.name} plan={plan} billing={billing} />
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-2xl mx-auto px-6 pb-28">
          <h2 className="text-2xl font-bold text-white text-center mb-12">
            Frequently asked questions
          </h2>
          <div className="space-y-0">
            {faqs.map((faq, i) => (
              <div
                key={faq.q}
                className={`py-6 ${i < faqs.length - 1 ? 'border-b border-[#111]' : ''}`}
              >
                <h3 className="text-white font-semibold mb-2 text-[15px]">{faq.q}</h3>
                <p className="text-[#666] text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// ─── Billing toggle ────────────────────────────────────────────────────────────

function BillingToggle({
  billing,
  onChange,
}: {
  billing: Billing;
  onChange: (b: Billing) => void;
}) {
  return (
    <div className="inline-flex items-center gap-3">
      <button
        onClick={() => onChange('monthly')}
        className={`text-sm font-medium transition-colors ${
          billing === 'monthly' ? 'text-white' : 'text-[#555] hover:text-[#888]'
        }`}
      >
        Monthly
      </button>

      {/* Switch */}
      <button
        onClick={() => onChange(billing === 'monthly' ? 'annual' : 'monthly')}
        className="relative w-12 h-6 bg-[#1a1a1a] border border-[#333] rounded-full focus:outline-none"
        aria-label="Toggle billing period"
      >
        <div
          className={`absolute top-[3px] w-[18px] h-[18px] bg-lime-400 rounded-full transition-transform duration-200 ${
            billing === 'annual' ? 'translate-x-[27px]' : 'translate-x-[3px]'
          }`}
        />
      </button>

      <button
        onClick={() => onChange('annual')}
        className={`text-sm font-medium transition-colors flex items-center gap-2 ${
          billing === 'annual' ? 'text-white' : 'text-[#555] hover:text-[#888]'
        }`}
      >
        Annual
        <span className="bg-lime-400 text-black text-[11px] font-bold px-2 py-0.5 rounded-full leading-none">
          Save 20%
        </span>
      </button>
    </div>
  );
}

// ─── Plan card ─────────────────────────────────────────────────────────────────

function PlanCard({ plan, billing }: { plan: Plan; billing: Billing }) {
  const price = billing === 'monthly' ? plan.monthlyDisplay : plan.annualMonthlyDisplay;
  const showAnnualNote = billing === 'annual' && plan.annualTotal !== null;
  const isFree = plan.annualTotal === null;

  return (
    <div
      className={`relative flex flex-col rounded-2xl p-6 border transition-all ${
        plan.featured
          ? 'bg-[#111] border-lime-400/40 shadow-[0_0_40px_rgba(163,230,53,0.07)] md:px-8 md:py-8'
          : 'bg-[#111] border-[#222]'
      }`}
    >
      {/* Most popular badge */}
      {plan.featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-lime-400 text-black text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
          Most popular
        </div>
      )}

      {/* Plan name + subtitle */}
      <div className="mb-6 mt-2">
        <h2 className="text-white font-bold text-xl mb-1">{plan.name}</h2>
        <p className="text-[#555] text-sm leading-snug">{plan.subtitle}</p>
      </div>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-end gap-1 mb-1">
          <span className="text-4xl font-black text-white tabular-nums">{price}</span>
          {!isFree && (
            <span className="text-[#555] text-sm mb-1.5">/mo</span>
          )}
        </div>
        {isFree && <p className="text-[#444] text-sm">forever free</p>}
        {!isFree && showAnnualNote && (
          <p className="text-[#444] text-sm">billed ${plan.annualTotal}/yr</p>
        )}
        {!isFree && !showAnnualNote && (
          <p className="text-[#444] text-sm">per month</p>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-[#1a1a1a] mb-5" />

      {/* Features */}
      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <span
              className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                plan.featured
                  ? 'bg-lime-400/15 text-lime-400'
                  : 'bg-[#1a1a1a] text-[#555]'
              }`}
            >
              <CheckIcon />
            </span>
            <span className="text-[#888] text-sm leading-snug">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href={plan.ctaHref}
        className={`block w-full text-center py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors ${
          plan.ctaVariant === 'primary'
            ? 'bg-lime-400 text-black hover:bg-lime-300'
            : 'border border-[#333] text-white hover:border-[#444] hover:bg-white/5'
        }`}
      >
        {plan.cta}
      </Link>
    </div>
  );
}

// ─── Icons ─────────────────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg
      width="9"
      height="9"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="2 6 5 9 10 3" />
    </svg>
  );
}
