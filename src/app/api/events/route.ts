import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

  const baseQuery = supabase
    .from('events')
    .select('*')
    .eq('user_id', user.id)
    .order('event_date', { ascending: false, nullsFirst: false });

  const { data, error } = await (sport_id ? baseQuery.eq('sport_id', sport_id) : baseQuery);

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }

  return NextResponse.json({ events: data ?? [] });
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
    name?: string;
    event_date?: string;
    location?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { sport_id, name, event_date, location } = body;

  if (!sport_id || !name) {
    return NextResponse.json(
      { error: 'Missing required fields: sport_id, name' },
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
    .from('events')
    .insert({
      user_id: user.id,
      sport_id,
      name,
      event_date: event_date ?? null,
      location: location ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
