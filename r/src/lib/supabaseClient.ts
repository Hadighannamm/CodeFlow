import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://oljjwbqhkqtmpaajxmph.supabase.co"
const supabaseKey = "sb_publishable_8wqRBNRGywWaJasqzvvNxg_rrwY3Tns"

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;