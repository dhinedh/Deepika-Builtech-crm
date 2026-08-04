import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve('../backend/.env') });

import { sendSalesAlertTemplate } from '../backend/whatsappService.js';

const phone = '918508599029';

async function testDelivery() {
  console.log(`🚀 Testing APPROVED Utility Template 'sales_lead_alert' dispatch to +${phone}...`);
  const now = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });
  const result = await sendSalesAlertTemplate(
    phone,
    'Babhu Sabhapathi (Test)',
    '+919884487938',
    'PEB Warehouse Enquiry - 5000 sq.ft',
    now
  );

  console.log('Result:', JSON.stringify(result, null, 2));
}

testDelivery();
