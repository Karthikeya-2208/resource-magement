import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://uhifcxmbgfbjmkhyvvai.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaWZjeG1iZ2Ziam1raHl2dmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyODc1NjAsImV4cCI6MjEwNzg2MzU2MH0.8p2n6ZbGJxdVFUATAbDTzjYSMOm_9a02fBrl9hclKKM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
