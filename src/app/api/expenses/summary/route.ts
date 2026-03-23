import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Expense, ExpenseCategory } from '@/types/database';

const CATEGORIES: ExpenseCategory[] = [
  'entry_fee',
  'travel',
  'lodging',
  'gear',
  'training',
  'nutrition',
  'other',
];

type ExpenseWithSport = Expense & { sports: { name: string } | null };

function zeroCategoryMap(): Record<ExpenseCategory, number> {
  return Object.fromEntries(CATEGORIES.map((c) => [c, 0])) as Record<ExpenseCategory, number>;
}

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
  const rawYear = searchParams.get('year');
  const year = rawYear ? parseInt(rawYear, 10) : new Date().getFullYear();

  if (Number.isNaN(year)) {
    return NextResponse.json({ error: 'Invalid year parameter' }, { status: 400 });
  }

  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  const { data, error } = await supabase
    .from('expenses')
    .select('*, sports(name)')
    .eq('user_id', user.id)
    .gte('expense_date', startDate)
    .lte('expense_date', endDate);

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }

  const expenses = data as unknown as ExpenseWithSport[];

  const sportMap = new Map<
    string,
    {
      sport_id: string;
      sport_name: string;
      total: number;
      by_category: Record<ExpenseCategory, number>;
    }
  >();

  let total_annual = 0;

  for (const expense of expenses) {
    const amount = Number(expense.amount);
    total_annual += amount;

    if (!sportMap.has(expense.sport_id)) {
      sportMap.set(expense.sport_id, {
        sport_id: expense.sport_id,
        sport_name: expense.sports?.name ?? 'Unknown',
        total: 0,
        by_category: zeroCategoryMap(),
      });
    }

    const entry = sportMap.get(expense.sport_id)!;
    entry.total += amount;
    entry.by_category[expense.category] += amount;
  }

  return NextResponse.json({
    year,
    total_annual,
    by_sport: Array.from(sportMap.values()),
  });
}
