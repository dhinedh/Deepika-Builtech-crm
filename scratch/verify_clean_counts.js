import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('backend/db.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const enquiries = data.enquiries || [];

const now = new Date('2026-08-17T12:00:00.000Z');
const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

let last30 = 0;
let older = 0;

enquiries.forEach(e => {
  const dateStr = e.createdAt || e.created_at;
  if (!dateStr) {
    last30++;
  } else {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime()) && d >= thirtyDaysAgo) {
      last30++;
    } else {
      older++;
    }
  }
});

console.log(`Clean db.json Enquiries: Total = ${enquiries.length}, Last 30 Days = ${last30}, Older = ${older}`);
