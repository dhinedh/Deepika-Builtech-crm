const fs = require('fs');
const path = require('path');

const token = process.env.PAGE_ACCESS_TOKEN || 'EAA90ZAx4L4OgBSIGSmY2TxYi9llXRuriOzUA2VCyov4iyg74GApApvGTiOfrZBgCX7WPtblDgn2n95Npswo6pMKBZA2kyehSfPo1ej8ewqQTGKtLj3blBWZBUfWeoXODWip0FFukoUxJZAWqY7AqInDwasvZA3onsXAZCcaYBQeBHYZCbx0ZBcszw5vEZAIJcZB3ISTTzzoUZBkWagZDZD';

const conversations = JSON.parse(fs.readFileSync('scratch/all_messenger_conversations.json', 'utf8'));

async function sendFollowUpMessage(recipientId, text) {
  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text }
      })
    });
    const data = await res.json();
    console.log(`[FB Messenger Follow-Up] Recipient: ${recipientId} | Response:`, JSON.stringify(data));
    return data;
  } catch (err) {
    console.error(`[FB Messenger Send Error] Recipient: ${recipientId} | Error:`, err.message);
    return null;
  }
}

async function processAllFollowUps() {
  console.log('🚀 Sending follow-up messages to Facebook Messenger contacts...');

  const dbPath = path.resolve('backend/db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  const followUpMessageText = `🏗️ Greetings from Deepika Builtech Engineering!

Thank you for reaching out regarding your building and structural requirements.

Our engineering team is reviewing your inquiry. Please let us know a convenient time to discuss your project specifications or arrange a free site consultation:

📞 Call/WhatsApp: +91 96000 67611
🌐 Website: deepikabuiltech.com

How can we assist you today? 😊`;

  // Track followups created in db
  const newFollowups = [];

  for (const conv of conversations) {
    const participants = conv.participants?.data || [];
    const client = participants.find(p => p.name !== 'Deepika Builtech Engineering ');
    if (client) {
      console.log(`\n-----------------------------------`);
      console.log(`Sending follow-up to: ${client.name} (PSID: ${client.id})`);
      
      const result = await sendFollowUpMessage(client.id, followUpMessageText);

      newFollowups.push({
        id: `F-FB-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        contactId: client.id,
        contactName: client.name,
        linkedToType: 'Lead',
        linkedToId: client.id,
        type: 'Facebook Message',
        scheduledDate: new Date().toISOString(),
        assignedTo: 'u1',
        reminder: '1 hour before',
        status: result?.message_id ? 'Done' : 'Pending',
        notes: `Follow-up message sent via FB Messenger Graph API. API Response: ${JSON.stringify(result || {})}`,
        outcome: result?.message_id ? 'Sent successfully via Messenger' : 'Recorded in CRM database',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  }

  // Update followups table in db.json
  db.followups = [...(db.followups || []), ...newFollowups];
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

  console.log(`\n✅ Created ${newFollowups.length} follow-up tasks and updated backend/db.json!`);
}

processAllFollowUps().catch(console.error);
