import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('backend/db.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const enquiries = data.enquiries || [];
console.log(`Total enquiries in db.json: ${enquiries.length}`);

const now = new Date('2026-08-17T12:00:00.000Z');
const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

let last30 = 0;
let older = 0;
let noDate = 0;

enquiries.forEach((e, idx) => {
  const dateStr = e.createdAt || e.created_at;
  if (!dateStr) {
    noDate++;
    console.log(`[${idx+1}] ${e.contactName} - NO DATE`);
  } else {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      noDate++;
      console.log(`[${idx+1}] ${e.contactName} - INVALID DATE: ${dateStr}`);
    } else if (d >= thirtyDaysAgo) {
      last30++;
      console.log(`[${idx+1}] ${e.contactName} - LAST 30 DAYS: ${d.toISOString()}`);
    } else {
      older++;
      console.log(`[${idx+1}] ${e.contactName} - OLDER: ${d.toISOString()}`);
    }
  }
});

console.log(`\nSummary: Total = ${enquiries.length}, Last 30 Days = ${last30}, Older = ${older}, No Date = ${noDate}`);
