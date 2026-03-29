import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function DELETE() {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = user.id;

  // Delete in FK-safe order: expenses (refs events + sports) → events (refs sports) → sports → profile
  await supabase.from('expenses').delete().eq('user_id', userId);
  await supabase.from('events').delete().eq('user_id', userId);
  await supabase.from('sports').delete().eq('user_id', userId);
  await supabase.from('users_profiles').delete().eq('id', userId);

  // Delete auth user (requires SUPABASE_SERVICE_ROLE_KEY in .env.local)
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = createAdminClient();
    await admin.auth.admin.deleteUser(userId);
  }

  // Clear session cookies
  await supabase.auth.signOut();

  return NextResponse.json({ ok: true });
}
