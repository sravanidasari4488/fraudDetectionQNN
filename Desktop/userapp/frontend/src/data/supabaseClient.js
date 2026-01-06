import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Support both NEXT_PUBLIC_ (from .env) and EXPO_PUBLIC_ (from app.config.js extra)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || Constants.expoConfig?.extra?.expoPublicSupabaseUrl;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || Constants.expoConfig?.extra?.expoPublicSupabaseAnonKey;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase env. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env file');
}

// Browser client: defaults to localStorage; no RN AsyncStorage
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

supabase.auth.onAuthStateChange((event, session) => {
});

export default supabase