import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardNav from './DashboardNav';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users_profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single();

  const needsOnboarding = !profile?.onboarding_completed;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <DashboardNav userEmail={user.email} />
      {children}
      {needsOnboarding && <OnboardingFlow />}
    </div>
  );
}
