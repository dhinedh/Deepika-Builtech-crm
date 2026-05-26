import { supabase } from './config/supabase.js';

async function checkLeads() {
  console.log('Checking for new leads in Supabase...');
  try {
    const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(5);
    if (error) {
      console.log('ERROR:', error.message);
    } else {
      console.log(`Found ${data.length} recent leads:`);
      data.forEach(lead => {
        console.log(`- ${lead.contactName} (${lead.phone}) at ${lead.created_at}`);
      });
    }
  } catch (err) {
    console.log('THREW:', err.message);
  }
}

checkLeads();
