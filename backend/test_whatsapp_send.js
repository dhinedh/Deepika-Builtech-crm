import { sendWhatsAppMessage } from './whatsappService.js';
import dotenv from 'dotenv';
dotenv.config();

async function testSend() {
  const adminPhone = process.env.ADMIN_PHONE || '919025840345';
  console.log(`Testing WhatsApp send to ${adminPhone}...`);
  
  // Try sending a simple template
  const result = await sendWhatsAppMessage(
    adminPhone, 
    'hello_world', // Default Meta test template
    []
  );
  
  if (result.success) {
    console.log('SUCCESS:', JSON.stringify(result.data, null, 2));
  } else {
    console.log('FAILED:', result.error);
  }
}

testSend();
