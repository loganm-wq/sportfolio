import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [profileRes, expensesRes, sportsRes] = await Promise.all([
    supabase
      .from('users_profiles')
      .select('full_name, created_at')
      .eq('id', user.id)
      .single(),
    supabase
      .from('expenses')
      .select('id, amount')
      .eq('user_id', user.id),
    supabase
      .from('sports')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true),
  ]);

  const expenses = expensesRes.data ?? [];
  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return NextResponse.json({
    profile: {
      full_name: profileRes.data?.full_name ?? null,
      email: user.email ?? '',
      created_at: user.created_at,
    },
    stats: {
      expense_count: expenses.length,
      sport_count: sportsRes.data?.length ?? 0,
      total_spent: totalSpent,
    },
  });
}

export async function PATCH(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { full_name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { full_name } = body;
  if (typeof full_name !== 'string') {
    return NextResponse.json({ error: 'full_name must be a string' }, { status: 400 });
  }

  const { error } = await supabase
    .from('users_profiles')
    .update({ full_name: full_name.trim() || null })
    .eq('id', user.id);

  if (error) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
