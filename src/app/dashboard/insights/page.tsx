import { TrendingUp, Plane, CalendarDays } from 'lucide-react';

const INSIGHTS = [
  {
    icon: TrendingUp,
    title: 'Spending pattern detected',
    body: 'Your gear spending is 40% higher this quarter than last. Most of it came from two purchases in January. Consider whether your current gear setup is complete before the season starts.',
  },
  {
    icon: Plane,
    title: 'Travel is your biggest cost driver',
    body: 'Travel and lodging account for 61% of your total athletic spend — significantly above the average of 43% for runners at your level. Running local races for one season could save you an estimated $800.',
  },
  {
    icon: CalendarDays,
    title: 'Season forecast',
    body: 'Based on your registered events and historical spending patterns, we estimate your Q2 athletic spend will be approximately $1,240. Your biggest upcoming cost is the Chicago Marathon trip in April.',
  },
];

export default function InsightsPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-white mb-1">Your athletic insights</h1>
        <p className="text-[#444] text-sm">Powered by AI — updated weekly</p>
      </div>

      {/* Insight cards */}
      <div className="space-y-4 max-w-2xl">
        {INSIGHTS.map((insight) => {
          const Icon = insight.icon;
          return (
            <div
              key={insight.title}
              className="bg-[#111] border border-[#222] border-l-4 border-l-lime-400 rounded-xl p-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-lime-400/10 flex items-center justify-center text-lime-400 flex-shrink-0">
                  <Icon size={17} />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2 text-[15px]">{insight.title}</h3>
                  <p className="text-[#666] text-sm leading-relaxed">{insight.body}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[#333] text-xs mt-10">Insights refresh every Sunday</p>
    </main>
  );
}
