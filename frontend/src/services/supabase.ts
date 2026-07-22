import { createClient } from '@supabase/supabase-js';

// Use environment variables or placeholders for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lwacdwackjnifrjgkrom.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3YWNkd2Fja2puaWZyamdrcm9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NTMwODYsImV4cCI6MjA5MjUyOTA4Nn0.tK6nf4ZTsBzQ-jZ1eJ1U_kxedYY6hZFCQxnMNi1YPjw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Custom non-blocking lock to prevent Web Lock 5000ms hangs & orphaned locks
    lock: async (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => {
      return await fn();
    },
    autoRefreshToken: false,
    persistSession: true,
    detectSessionInUrl: false
  }
});
