import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type User = {
  id: string;
  name: string;
  email?: string;
  created_at: string;
};

export type Collection = {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
};

export type Moment = {
  id: string;
  collection_id: string;
  title: string;
  started_at: string;
  completed_at?: string;
  content?: string;
  country?: string;
  city?: string;
  category?: string;
  media_url?: string;
};
