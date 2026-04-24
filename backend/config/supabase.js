import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://lwacdwackjnifrjgkrom.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3YWNkd2Fja2puaWZyamdrcm9tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njk1MzA4NiwiZXhwIjoyMDkyNTI5MDg2fQ.xeri6TvyfMfTz171-o4AzREzCIBAPeuT2lfrqh8fBrM';

export const supabase = createClient(supabaseUrl, supabaseKey);
