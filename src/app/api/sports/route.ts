import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SPORT_TYPES } from '@/types/database';
import type { SportType } from '@/types/database';

export async function GET() {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('sports')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch sports' }, { status: 500 });
  }

  return NextResponse.json({ sports: data ?? [] });
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

  let body: { name?: string; sport_type?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { name, sport_type } = body;

  if (!name || !sport_type) {
    return NextResponse.json(
      { error: 'Missing required fields: name, sport_type' },
      { status: 400 }
    );
  }

  if (!(SPORT_TYPES as readonly string[]).includes(sport_type)) {
    return NextResponse.json(
      { error: `Invalid sport_type. Must be one of: ${SPORT_TYPES.join(', ')}` },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('sports')
    .insert({ user_id: user.id, name, sport_type: sport_type as SportType })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to create sport' }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
