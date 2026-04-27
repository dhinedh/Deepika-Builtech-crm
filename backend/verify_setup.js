import { supabase } from './config/supabase.js';

async function probe() {
  console.log('Probing Supabase tables after setup...');
  
  const tables = ['leads', 'followups', 'contacts', 'tasks'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`Table '${table}': ERROR - ${error.message}`);
      } else {
        console.log(`Table '${table}': SUCCESS - Found ${data.length} records (probed 1)`);
      }
    } catch (err) {
      console.log(`Table '${table}': THREW - ${err.message}`);
    }
  }
}

probe();
