import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://smdsbsifotwkbszocvnm.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtZHNic2lmb3R3a2Jzem9jdm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMTU3NDMsImV4cCI6MjA4NTY5MTc0M30._B3J-dgHH1eGgn57Fsy_wUvK2GUBpXAh5-IJG3EzJvw';

export const supabase = createClient(supabaseUrl, supabaseKey);
