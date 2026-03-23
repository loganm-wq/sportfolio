import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Expense, ExpenseCategory } from '@/types/database';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

type ExpenseWithSport = Expense & { sports: { name: string } | null };

export async function GET(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const sport_id = searchParams.get('sport_id');
  const rawLimit = parseInt(searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10);
  const limit = Number.isNaN(rawLimit) ? DEFAULT_LIMIT : Math.min(rawLimit, MAX_LIMIT);
  const rawOffset = parseInt(searchParams.get('offset') ?? '0', 10);
  const offset = Number.isNaN(rawOffset) ? 0 : rawOffset;

  const baseQuery = supabase
    .from('expenses')
    .select('*, sports(name)')
    .eq('user_id', user.id)
    .order('expense_date', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error } = await (sport_id ? baseQuery.eq('sport_id', sport_id) : baseQuery);

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }

  const expenses = (data as unknown as ExpenseWithSport[]).map(
    ({ sports, ...expense }) => ({
      ...expense,
      sport_name: sports?.name ?? null,
    })
  );

  return NextResponse.json({ expenses, limit, offset });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    sport_id?: string;
    amount?: number;
    category?: ExpenseCategory;
    description?: string;
    expense_date?: string;
    event_id?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { sport_id, amount, category, description, expense_date, event_id } = body;

  if (!sport_id || amount == null || !category) {
    return NextResponse.json(
      { error: 'Missing required fields: sport_id, amount, category' },
      { status: 400 }
    );
  }

  const { data: sport, error: sportError } = await supabase
    .from('sports')
    .select('id')
    .eq('id', sport_id)
    .eq('user_id', user.id)
    .single();

  if (sportError || !sport) {
    return NextResponse.json({ error: 'Sport not found or access denied' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('expenses')
    .insert({
      user_id: user.id,
      sport_id,
      amount,
      category,
      description: description ?? null,
      expense_date: expense_date ?? new Date().toISOString().split('T')[0],
      event_id: event_id ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
