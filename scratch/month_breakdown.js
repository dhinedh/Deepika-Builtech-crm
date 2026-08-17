import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('backend/db.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const enquiries = data.enquiries || [];

const now = new Date('2026-08-17T12:00:00.000Z');
const currentYear = now.getFullYear();
const currentMonth = now.getMonth(); // 7 for August (0-indexed)

let thisMonthCount = 0;
let lastMonthCount = 0;
let olderCount = 0;

enquiries.forEach(e => {
  const dateStr = e.createdAt || e.created_at;
  if (dateStr) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        thisMonthCount++;
      } else if (d.getFullYear() === currentYear && d.getMonth() === currentMonth - 1) {
        lastMonthCount++;
      } else {
        olderCount++;
      }
    }
  }
});

console.log(`=== ENQUIRIES BREAKDOWN ===`);
console.log(`Total Enquiries: ${enquiries.length}`);
console.log(`This Month (August 2026): ${thisMonthCount}`);
console.log(`Last Month (July 2026): ${lastMonthCount}`);
console.log(`Older: ${olderCount}`);
