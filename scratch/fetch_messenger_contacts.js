const fs = require('fs');

const token = process.env.PAGE_ACCESS_TOKEN || 'EAA90ZAx4L4OgBSIGSmY2TxYi9llXRuriOzUA2VCyov4iyg74GApApvGTiOfrZBgCX7WPtblDgn2n95Npswo6pMKBZA2kyehSfPo1ej8ewqQTGKtLj3blBWZBUfWeoXODWip0FFukoUxJZAWqY7AqInDwasvZA3onsXAZCcaYBQeBHYZCbx0ZBcszw5vEZAIJcZB3ISTTzzoUZBkWagZDZD';

async function fetchAllConversations() {
  let url = `https://graph.facebook.com/v19.0/me/conversations?fields=participants,messages.limit(20){message,from,created_time}&limit=25&access_token=${token}`;
  let allConversations = [];

  while (url) {
    console.log('Fetching:', url);
    const res = await fetch(url);
    const data = await res.json();
    if (data.data) {
      allConversations = allConversations.concat(data.data);
    }
    url = data.paging?.next || null;
  }

  console.log(`Total conversations fetched: ${allConversations.length}`);
  fs.writeFileSync('scratch/all_messenger_conversations.json', JSON.stringify(allConversations, null, 2));

  const targetNames = [
    'Raj Raj',
    'Barun Panigrahi',
    'Kishan Patel',
    'Ramya',
    'Rajesh Madasamy',
    'Avj Architecture',
    'Surya',
    'Tyagi Nikhil',
    'Ravi Khede'
  ];

  allConversations.forEach(c => {
    const participants = c.participants?.data || [];
    const messages = c.messages?.data || [];
    const client = participants.find(p => p.name !== 'Deepika Builtech Engineering ');

    if (client) {
      console.log(`\n==========================================`);
      console.log(`Client: ${client.name} (ID: ${client.id})`);
      console.log(`Messages:`);
      messages.forEach(m => {
        console.log(`  [${m.created_time}] ${m.from.name}: ${m.message}`);
      });
    }
  });
}

fetchAllConversations().catch(console.error);
