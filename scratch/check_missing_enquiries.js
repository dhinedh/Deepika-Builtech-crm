import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('backend/db.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

console.log('=== DB.JSON ENQUIRIES ===');
console.log(`Total enquiries in db.json: ${data.enquiries?.length || 0}`);
data.enquiries?.forEach(e => {
  console.log(`- Name: ${e.contactName} | Source: ${e.source} | Msg: ${e.lastMessage?.slice(0, 30)}`);
});

console.log('\n=== DB.JSON LEADS ===');
console.log(`Total leads in db.json: ${data.leads?.length || 0}`);
data.leads?.forEach(l => {
  console.log(`- Name: ${l.contactName} | Source: ${l.source}`);
});
