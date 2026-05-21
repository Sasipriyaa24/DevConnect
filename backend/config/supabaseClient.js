import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load variables from .env file into process.env
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Check if keys are missing (so we don't crash mysteriously later)
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('YOUR_SUPABASE')) {
  console.warn("⚠️ WARNING: Supabase keys are missing or invalid in the .env file.");
}

// Create and export the database client
export const supabase = createClient(supabaseUrl || 'http://dummy.url', supabaseAnonKey || 'dummy_key');
