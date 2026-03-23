// ============================================================
// Sportfolio — Database Types
// ============================================================

export const SPORT_TYPES = [
  "running",
  "cycling",
  "triathlon",
  "golf",
  "pickleball",
  "bjj",
  "crossfit",
  "swimming",
  "volleyball",
  "basketball",
  "other",
] as const;

export type SportType = (typeof SPORT_TYPES)[number];

export const EXPENSE_CATEGORIES = [
  { value: "entry_fee", label: "Entry Fee" },
  { value: "travel", label: "Travel" },
  { value: "lodging", label: "Lodging" },
  { value: "gear", label: "Gear" },
  { value: "training", label: "Training" },
  { value: "nutrition", label: "Nutrition" },
  { value: "other", label: "Other" },
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]["value"];

// ---------- Row types ----------

export type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
};

export type Sport = {
  id: string;
  user_id: string;
  name: string;
  sport_type: SportType;
  is_active: boolean;
  created_at: string;
};

export type Event = {
  id: string;
  user_id: string;
  sport_id: string;
  name: string;
  event_date: string | null;
  location: string | null;
  created_at: string;
};

export type Expense = {
  id: string;
  user_id: string;
  sport_id: string;
  event_id: string | null;
  amount: number;
  category: ExpenseCategory;
  description: string | null;
  expense_date: string;
  created_at: string;
};

// ---------- Insert types ----------

export type UserProfileInsert = {
  id: string;
  email: string;
  full_name?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type SportInsert = {
  id?: string;
  user_id: string;
  name: string;
  sport_type: SportType;
  is_active?: boolean;
  created_at?: string;
};

export type EventInsert = {
  id?: string;
  user_id: string;
  sport_id: string;
  name: string;
  event_date?: string | null;
  location?: string | null;
  created_at?: string;
};

export type ExpenseInsert = {
  id?: string;
  user_id: string;
  sport_id: string;
  event_id?: string | null;
  amount: number;
  category: ExpenseCategory;
  description?: string | null;
  expense_date?: string;
  created_at?: string;
};

// ---------- Database type (Supabase-compatible) ----------

export type Database = {
  public: {
    Tables: {
      users_profiles: {
        Row: UserProfile;
        Insert: UserProfileInsert;
        Update: Partial<UserProfileInsert>;
        Relationships: [];
      };
      sports: {
        Row: Sport;
        Insert: SportInsert;
        Update: Partial<SportInsert>;
        Relationships: [];
      };
      events: {
        Row: Event;
        Insert: EventInsert;
        Update: Partial<EventInsert>;
        Relationships: [];
      };
      expenses: {
        Row: Expense;
        Insert: ExpenseInsert;
        Update: Partial<ExpenseInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
