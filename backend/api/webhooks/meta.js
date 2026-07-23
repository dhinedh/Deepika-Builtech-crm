import { supabase } from '../../config/supabase.js';
import axios from 'axios';

// In-memory conversation state store for Meta Messenger & Instagram DM
const userSessions = new Map();

function getUserSession(id) {
  if (!userSessions.has(id)) {
    userSessions.set(id, {
      quote_step: 0,
      selected_service: 'PEB / General Enquiry',
      area_required: '',
      site_location: '',
      project_timeline: '',
      budget_range: '',
      is_paused: false
    });
  }
  return userSessions.get(id);
}

/**
 * Extract project type from free-text message.
 * Returns a ProjectType string or null if not detected.
 */
function extractProjectType(text) {
  const t = text.toLowerCase();
  if (t.includes('cold storage') || t.includes('cold room') || t.includes('freezer')) return 'Cold Storage';
  if (t.includes('mezzanine') || t.includes('mezanine') || t.includes('mezzaine')) return 'Mezzanine Floor';
  if (t.includes('eot') || t.includes('crane') || t.includes('overhead crane')) return 'EOT Crane';
  if (t.includes('factory') || t.includes('shed') || t.includes('industrial shed') || t.includes('fabrication shed')) return 'Factory/Shed';
  if (t.includes('civil') || t.includes('concrete') || t.includes('rcc') || t.includes('foundation')) return 'Civil Construction';
  if (t.includes('godown') || t.includes('warehouse') || t.includes('storage') || t.includes('peb') || t.includes('pre-engineered') || t.includes('pre engineered')) return 'PEB Warehouse';
  return null;
}

/**
 * Extract company name from free-text message.
 * Returns a string or null if not detected.
 */
function extractCompanyName(text) {
  // Patterns: "from XYZ", "company: XYZ", "our company XYZ", "we are XYZ", "I am from XYZ"
  const patterns = [
    /(?:from|company[:\s]+|our company[:\s]+|we are[:\s]+|i am from[:\s]+|i'm from[:\s]+|i work (?:at|for)[:\s]+|representing[:\s]+)([A-Z][A-Za-z0-9 &.,'-]{2,40})/i,
    /(?:company name[:\s]+|firm[:\s]+|organisation[:\s]+|organization[:\s]+)([A-Z][A-Za-z0-9 &.,'-]{2,40})/i,
  ];
  for (const pat of patterns) {
    const match = text.match(pat);
    if (match && match[1]) return match[1].trim();
  }
  return null;
}

/**
 * Upsert a lead and enquiry record in the CRM DB when a chat message arrives.
 * Extracts any available info (project type, company name) from the message.
 */
async function syncCRMFromChat({ phoneIdentifier, customerName, platform, messageText, sessionData = {} }) {
  try {
    const detectedProjectType = extractProjectType(messageText);
    const detectedCompany     = extractCompanyName(messageText);
    const source = platform === 'facebook' ? 'Facebook Messenger' : 'Instagram DM';
    const now    = new Date().toISOString();

    // ---- LEADS table ----
    const { data: existingLeads } = await supabase
      .from('leads')
      .select('id,projectType,companyName')
      .eq('phone', phoneIdentifier);

    const lead = existingLeads && existingLeads.length > 0 ? existingLeads[0] : null;

    if (lead) {
      // Only update fields that were previously unknown
      const updates = { updated_at: now, lastMessage: messageText };
      if (detectedProjectType && (!lead.projectType || lead.projectType === 'Not Mentioned')) {
        updates.projectType = detectedProjectType;
      }
      if (detectedCompany && !lead.companyName) {
        updates.companyName = detectedCompany;
      }
      // Update from chatbot quiz answers
      if (sessionData.site_location)     updates.location  = sessionData.site_location;
      if (sessionData.area_required)     updates.landArea  = sessionData.area_required;
      if (sessionData.project_timeline)  updates.timeline  = sessionData.project_timeline;
      if (sessionData.selected_service && sessionData.selected_service !== 'PEB / General Enquiry') {
        updates.projectType = sessionData.selected_service;
      }

      await supabase.from('leads').update(updates).eq('phone', phoneIdentifier);
      console.log(`[CRM Sync] Updated lead for ${customerName} (${phoneIdentifier})`);
    } else {
      // Create new lead record
      await supabase.from('leads').insert([{
        id:          `lead-${platform.slice(0,2)}-${Date.now()}`,
        contactName: customerName,
        phone:       phoneIdentifier,
        companyName: detectedCompany || '',
        projectType: detectedProjectType || 'Not Mentioned',
        source,
        status:      'New',
        leadScore:   40,
        location:    sessionData.site_location || '',
        landArea:    sessionData.area_required || '',
        timeline:    sessionData.project_timeline || 'To be confirmed',
        notes:       `Captured via ${source}. First message: "${messageText.substring(0, 200)}"`,
        created_at:  now,
        updated_at:  now
      }]);
      console.log(`[CRM Sync] Created new lead for ${customerName} (${phoneIdentifier})`);
    }

    // ---- ENQUIRIES table ----
    const { data: existingEnq } = await supabase
      .from('enquiries')
      .select('id')
      .eq('phone', phoneIdentifier);

    if (existingEnq && existingEnq.length > 0) {
      await supabase.from('enquiries').update({
        lastMessage: messageText.substring(0, 500),
        updated_at:  now
      }).eq('phone', phoneIdentifier);
    } else {
      await supabase.from('enquiries').insert([{
        id:          `enq-${platform.slice(0,2)}-${Date.now()}`,
        contactName: customerName,
        phone:       phoneIdentifier,
        lastMessage: messageText.substring(0, 500),
        source,
        status:      'New',
        created_at:  now,
        updated_at:  now
      }]);
    }

    // ---- CONTACTS table ----
    const { data: existingContacts } = await supabase
      .from('contacts')
      .select('id')
      .eq('phone', phoneIdentifier);

    if (!existingContacts || existingContacts.length === 0) {
      await supabase.from('contacts').insert([{
        id:             `con-${platform.slice(0,2)}-${Date.now()}`,
        fullName:       customerName,
        phone:          phoneIdentifier,
        designation:    'Client / Enquirer',
        isDecisionMaker: true,
        type:           'Client Active',
        industry:       'Construction / PEB',
        created_at:     now
      }]);
    }

  } catch (err) {
    console.error('[CRM Sync Error]:', err.message);
  }
}

function calculateLeadScore(session) {
  let score = 0;
  const budget = session.budget_range;
  if (budget === "Above ₹1 Crore" || budget === "₹50L–₹1Cr") score += 40;
  else if (budget === "₹20–50 Lakhs") score += 25;
  else if (budget === "Under ₹20 Lakhs") score += 10;

  const timeline = session.project_timeline;
  if (timeline === "Immediately") score += 30;
  else if (timeline === "1–3 months") score += 20;
  else if (timeline === "3–6 months") score += 10;
  else if (timeline === "Just planning") score += 5;

  const service = session.selected_service || '';
  if (service.includes("Godown") || service.includes("Cold") || service.includes("PEB")) score += 15;

  if (session.site_location && (session.site_location.toLowerCase().includes("tamil nadu") || session.site_location.toLowerCase().includes("chennai"))) score += 10;
  return score;
}

/**
 * Internal helper to send the 'follow_up_lead' template
 */
async function sendFollowUpLead(phone, customerName) {
  const TOKEN    = process.env.WHATSAPP_ACCESS_TOKEN;
  const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!TOKEN || !PHONE_ID) {
    console.warn('⚠️ Missing WhatsApp credentials');
    return;
  }

  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to:   phone,
        type: "template",
        template: {
          name:     "follow_up_lead",
          language: { code: "en" },
          components: [{
            type: "body",
            parameters: [{
              type:           "text",
              parameter_name: "customer_name",
              text:           customerName
            }]
          }]
        }
      },
      {
        headers: {
          Authorization:  `Bearer ${TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );
    console.log(`✅ Follow-up sent to ${customerName} (${phone})`);
  } catch (err) {
    console.error('❌ WhatsApp Send Error:', err.response?.data || err.message);
  }
}

/**
 * Helper to fetch Facebook/Instagram user profile name using Page/IG access token
 */
async function getMetaUserProfile(senderId, platform) {
  const token = process.env.PAGE_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;
  if (!token) {
    console.warn('⚠️ Missing Meta Access Token for profile lookup');
    return null;
  }
  
  try {
    if (platform === 'facebook') {
      const res = await axios.get(`https://graph.facebook.com/v18.0/${senderId}`, {
        params: {
          fields: 'first_name,last_name',
          access_token: token
        }
      });
      if (res.data && (res.data.first_name || res.data.last_name)) {
        return `${res.data.first_name || ''} ${res.data.last_name || ''}`.trim();
      }
    } else if (platform === 'instagram') {
      const res = await axios.get(`https://graph.facebook.com/v18.0/${senderId}`, {
        params: {
          fields: 'username,name',
          access_token: token
        }
      });
      if (res.data) {
        return res.data.name || res.data.username || null;
      }
    }
  } catch (err) {
    console.warn(`[Meta Profile Fetch Failed] senderId: ${senderId}, platform: ${platform}, error: ${err.message}`);
  }
  return null;
}

/**
 * Helper to send messages (with optional quick replies) to Facebook Messenger or Instagram DM
 */
async function sendMetaChatMessage(senderId, recipientId, platform, text, quickRepliesArray = null) {
  const token = process.env.PAGE_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;
  if (!token) {
    console.warn('⚠️ Missing Meta/Page Access Token for sending chat message');
    return;
  }

  const targetUrl = recipientId ? `https://graph.facebook.com/v18.0/${recipientId}/messages` : `https://graph.facebook.com/v18.0/me/messages`;

  const payload = {
    recipient: { id: senderId },
    message: { text }
  };

  if (quickRepliesArray && quickRepliesArray.length > 0) {
    payload.message.quick_replies = quickRepliesArray.map(btn => ({
      content_type: 'text',
      title: btn.title.substring(0, 20),
      payload: btn.id
    }));
  }

  // Attempt 1: Send with quick replies
  try {
    await axios({
      method: 'POST',
      url: targetUrl,
      params: { access_token: token },
      headers: { 'Content-Type': 'application/json' },
      data: payload
    });
    console.log(`✅ [${platform.toUpperCase()} Chat Response Sent] to senderId ${senderId}`);
    return;
  } catch (err) {
    console.warn(`[${platform.toUpperCase()} Quick-Reply Failed, retrying plain text]:`, err.response?.data || err.message);
  }

  // Attempt 2: Fallback to plain text if Quick Replies unsupported or fail
  try {
    await axios({
      method: 'POST',
      url: targetUrl,
      params: { access_token: token },
      headers: { 'Content-Type': 'application/json' },
      data: {
        recipient: { id: senderId },
        message: { text }
      }
    });
    console.log(`✅ [${platform.toUpperCase()} Plain Text Response Sent] to senderId ${senderId}`);
  } catch (fallbackErr) {
    console.error(`❌ [${platform.toUpperCase()} Chat Send Final Error]:`, fallbackErr.response?.data || fallbackErr.message);
  }
}

/**
 * Complete Interactive Chatbot State Machine for Meta (Messenger & Instagram)
 */
async function handleMetaChatbot(senderId, recipientId, platform, messageText, customerName) {
  const phoneIdentifier = platform === 'facebook' ? `fb:${senderId}` : `ig:${senderId}`;
  const session = getUserSession(phoneIdentifier);
  
  if (session.is_paused) return; // Human takeover active

  const msg = messageText.trim();
  const msgLower = msg.toLowerCase();

  // Human Takeover check
  if (msgLower === "5" || msgLower === "btn_human" || msgLower.includes("human") || msgLower.includes("agent") || msgLower.includes("talk to someone")) {
    session.is_paused = true;
    await sendMetaChatMessage(senderId, recipientId, platform, `👋 *Connecting you to our team!*\n\nOur team member will respond to you shortly. In the meantime, you can also reach us directly:\n\n📞 *Call/WhatsApp:* +91 96000 67611\n\n_Average response time: under 30 minutes during working hours (9 AM – 6 PM)_`);
    return;
  }

  // --- QUOTE COLLECTION QUESTIONNAIRE FLOW ---
  if (session.quote_step === 1) {
    session.area_required = msg;
    session.quote_step = 2;
    await sendMetaChatMessage(senderId, recipientId, platform, `✅ Thank you!\n\n━━━━━━━━━━━━━━━━━\n❓ *Question 2 of 4*\n\n*Where is your project site located?*\n\n_Please type your answer_\n_(City, district or address — Example: Chennai · Hosur · Kanchipuram)_`);
    return;
  }

  if (session.quote_step === 2) {
    session.site_location = msg;
    session.quote_step = 3;
    await sendMetaChatMessage(senderId, recipientId, platform, `📍 Perfect!\n\n━━━━━━━━━━━━━━━━━\n❓ *Question 3 of 4*\n\n*When do you plan to start the project?*\n\n1️⃣ ⚡ Immediately — within 1 month\n2️⃣ 📅 In 1 to 3 months\n3️⃣ 🗓️ In 3 to 6 months\n4️⃣ 💭 Just planning — no fixed date\n\n_Reply with a number or select below_`, [
      { id: "1", title: "1 - Immediately" },
      { id: "2", title: "2 - In 1-3 months" },
      { id: "3", title: "3 - In 3-6 months" },
      { id: "4", title: "4 - Just planning" }
    ]);
    return;
  }

  if (session.quote_step === 3) {
    if (msgLower === "1" || msgLower.includes("immediately")) session.project_timeline = "Immediately";
    else if (msgLower === "2" || msgLower.includes("1-3")) session.project_timeline = "1–3 months";
    else if (msgLower === "3" || msgLower.includes("3-6")) session.project_timeline = "3–6 months";
    else if (msgLower === "4" || msgLower.includes("planning")) session.project_timeline = "Just planning";
    else session.project_timeline = msg;

    session.quote_step = 4;
    await sendMetaChatMessage(senderId, recipientId, platform, `🗓️ Noted!\n\n━━━━━━━━━━━━━━━━━\n❓ *Question 4 of 4*\n\n*What is your approximate project budget?*\n\n1️⃣ Under ₹20 Lakhs\n2️⃣ ₹20 Lakhs – ₹50 Lakhs\n3️⃣ ₹50 Lakhs – ₹1 Crore\n4️⃣ Above ₹1 Crore\n5️⃣ Not sure yet\n\n_Reply with a number or select below_`, [
      { id: "1", title: "1 - Under 20L" },
      { id: "2", title: "2 - 20L to 50L" },
      { id: "3", title: "3 - 50L to 1Cr" },
      { id: "4", title: "4 - Above 1Cr" },
      { id: "5", title: "5 - Not sure" }
    ]);
    return;
  }

  if (session.quote_step === 4) {
    if (msgLower === "1") session.budget_range = "Under ₹20 Lakhs";
    else if (msgLower === "2") session.budget_range = "₹20–50 Lakhs";
    else if (msgLower === "3") session.budget_range = "₹50L–₹1Cr";
    else if (msgLower === "4") session.budget_range = "Above ₹1 Crore";
    else if (msgLower === "5") session.budget_range = "Not confirmed yet";
    else session.budget_range = msg;

    session.quote_step = 0;
    const score = calculateLeadScore(session);

    // Save completed lead into Supabase
    try {
      const { data: existingLeads } = await supabase.from('leads').select('id').eq('phone', phoneIdentifier);
      if (existingLeads && existingLeads.length > 0) {
        await supabase.from('leads').update({
          contactName: customerName,
          projectType: session.selected_service,
          location: session.site_location,
          landArea: session.area_required,
          timeline: session.project_timeline,
          leadScore: score,
          status: 'New',
          notes: `Completed Quote Flow via ${platform.toUpperCase()}.\nBudget: ${session.budget_range}`,
          updated_at: new Date().toISOString()
        }).eq('phone', phoneIdentifier);
      } else {
        await supabase.from('leads').insert([{
          contactName: customerName,
          phone: phoneIdentifier,
          projectType: session.selected_service,
          location: session.site_location,
          landArea: session.area_required,
          timeline: session.project_timeline,
          source: platform === 'facebook' ? 'Facebook Messenger' : 'Instagram DM',
          status: 'New',
          leadScore: score,
          notes: `Captured via ${platform.toUpperCase()} Chatbot Quote Flow.\nBudget: ${session.budget_range}`
        }]);
      }
    } catch (dbErr) {
      console.error('[Supabase Lead Save Error]:', dbErr.message);
    }

    const summary = `🎉 *Thank you for your patience!*\n\nWe have received all your details.\nHere is a summary of your requirement:\n\n━━━━━━━━━━━━━━━━━\n🔧 *Service:* ${session.selected_service}\n📐 *Area Required:* ${session.area_required}\n📍 *Site Location:* ${session.site_location}\n📅 *Timeline:* ${session.project_timeline}\n💰 *Budget:* ${session.budget_range}\n━━━━━━━━━━━━━━━━━\n\n✅ Your information has been updated to our project team.\n\n📞 You will receive a *personal call back within 2 hours* from our team.\n\nThank you for choosing *Deepika Builtech Engineering!* 🏗️\n\n_📞 +91 96000 67611_\n_🌐 deepikabuiltech.com_`;
    
    await sendMetaChatMessage(senderId, recipientId, platform, summary);
    return;
  }

  // --- MAIN MENU FLOW ---
  const isWelcome = msgLower.includes("hi") || msgLower.includes("hello") || msgLower.includes("hey") || msgLower.includes("start") || msgLower.includes("vanakkam") || msgLower === "btn_menu";

  if (isWelcome) {
    await sendMetaChatMessage(senderId, recipientId, platform, `🏗️ *Welcome to Deepika Builtech Engineering!*\n\nTamil Nadu's most trusted Pre-Engineered Building specialists — based in Chennai.\n\n🏆 Excellence Award 2025\n✅ 10+ Years of Experience\n✅ 150+ Projects Delivered\n✅ 3 Manufacturing Units in Tamil Nadu\n\nPlease select an option:\n\n1️⃣ About Us\n2️⃣ Our Services\n3️⃣ Get a Free Quote\n4️⃣ Contact & Locations\n5️⃣ 💬 Talk to Human`, [
      { id: "btn_about", title: "1 - About Us" },
      { id: "btn_services", title: "2 - Services" },
      { id: "btn_quote", title: "3 - Free Quote" }
    ]);
    return;
  }

  if (msgLower === "btn_about" || msgLower === "1" || msgLower.includes("about")) {
    await sendMetaChatMessage(senderId, recipientId, platform, `🏢 *About Deepika Builtech Engineering*\n\nWe are a leading Pre-Engineered Building (PEB) construction company headquartered in Ambattur, Chennai — with 10+ years of trusted service across Tamil Nadu.\n\n🏭 *What We Build:*\nWe design, fabricate and erect high-quality PEB structures, warehouses, cold storages, mezzanine floors, industrial sheds and godowns.\n\n📍 *Our 3 Locations:*\n- Head Office — Ambattur, Chennai\n- Unit I — Kanchipuram District\n- Unit II — Thirumullaivoyal, Thiruvallur\n\n🏆 *Why Clients Choose Us:*\n✅ In-house manufacturing\n✅ On-time delivery\n✅ Transparent pricing\n\nWhat would you like to do next?`, [
      { id: "btn_services", title: "2 - View Services" },
      { id: "btn_quote", title: "3 - Free Quote" },
      { id: "btn_menu", title: "Main Menu" }
    ]);
    return;
  }

  if (msgLower === "btn_services" || msgLower === "2" || msgLower.includes("service")) {
    await sendMetaChatMessage(senderId, recipientId, platform, `🔧 *Our Construction Services*\n\n1️⃣ PEB Structure (Pre-Engineered Buildings)\n2️⃣ Mezzanine Floor (Space Expansion)\n3️⃣ Cold Storage (Insulated Facilities)\n4️⃣ Industrial Shed Fabrication\n5️⃣ Godown Construction\n6️⃣ Civil Foundation & RC Works\n\nSelect *Free Quote* to get an instant estimate for any service!`, [
      { id: "btn_quote", title: "3 - Free Quote" },
      { id: "btn_menu", title: "Main Menu" }
    ]);
    return;
  }

  if (msgLower === "4" || msgLower.includes("contact") || msgLower.includes("location") || msgLower.includes("address")) {
    await sendMetaChatMessage(senderId, recipientId, platform, `📞 *Contact Deepika Builtech Engineering*\n\n📱 *Call / WhatsApp:* +91 96000 67611 / +91 98844 87938\n📧 *Email:* dbtechengg@gmail.com\n🌐 *Website:* deepikabuiltech.com\n\n📍 *Head Office:* SIDCO Industrial Estate, Ambattur, Chennai — 600098\n\n🕐 *Working Hours:* Monday – Saturday: 9 AM – 6 PM`, [
      { id: "btn_quote", title: "3 - Free Quote" },
      { id: "btn_menu", title: "Main Menu" }
    ]);
    return;
  }

  if (msgLower === "btn_quote" || msgLower === "3" || msgLower.includes("quote")) {
    session.quote_step = 1;
    await sendMetaChatMessage(senderId, recipientId, platform, `📋 *Let's get your FREE project estimate!*\n\nThis will take less than 2 minutes. 🕐\n\n━━━━━━━━━━━━━━━━━\n❓ *Question 1 of 4*\n\n*What is the total area you need for your project?*\n\n_Please type your answer_\n_(Example: 5,000 sq ft · 10,000 sq ft · 1 acre)_`);
    return;
  }

  // Fallback
  await sendMetaChatMessage(senderId, recipientId, platform, `😊 *Thank you for your message!*\n\nPlease choose an option below:\n\n1️⃣ About Us\n2️⃣ Our Services\n3️⃣ Get a Free Quote\n4️⃣ Contact & Locations\n5️⃣ 💬 Talk to Human`, [
    { id: "btn_menu", title: "Main Menu" },
    { id: "btn_quote", title: "3 - Free Quote" },
    { id: "btn_human", title: "5 - Talk to Human" }
  ]);
}

export default async function handler(req, res) {
  // ✅ Handle GET (Verification)
  if (req.method === 'GET') {
    const mode      = req.query['hub.mode'];
    const token     = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  }

  // ✅ Handle POST (Messages)
  if (req.method === 'POST') {
    try {
      const body = req.body;
      if (body.object !== 'whatsapp_business_account' && body.object !== 'page' && body.object !== 'instagram') {
        return res.status(404).send('Not Found');
      }

      // 1. Handle WhatsApp Messages
      if (body.object === 'whatsapp_business_account') {
        const changes = body.entry?.[0]?.changes?.[0]?.value;
        if (changes?.messages) {
          const msg          = changes.messages[0];
          const contact      = changes.contacts?.[0];
          const phone        = msg.from;
          const messageText  = msg.text?.body?.toLowerCase() || '';
          const customerName = contact?.profile?.name || 'Customer';

          // Check Duplicates
          const { data: existingLeads } = await supabase.from('leads').select('id').eq('phone', phone);
          const { data: existingContacts } = await supabase.from('contacts').select('id').eq('phone', phone);
          const isExisting = (existingLeads?.length > 0) || (existingContacts?.length > 0);

          if (!isExisting) {
            const keywords = ['hi', 'hello', 'interested', 'price', 'cost', 'quote', 'details', 'buy', 'service', 'help', 'inquiry'];
            const isLeadIntent = keywords.some(kw => messageText.includes(kw)) || messageText === '';

            if (isLeadIntent) {
              const { error } = await supabase.from('leads').insert([{
                contactName:  customerName,
                phone:        phone,
                source:       'WhatsApp',
                status:       'New',
                notes:        `Inquiry: ${msg.text?.body || 'Media'}`
              }]);

              if (!error) {
                await sendFollowUpLead(phone, customerName);
              }
            }
          }
        }
      }

      // 2. Handle Facebook Messenger & Instagram DM
      if (body.object === 'page' || body.object === 'instagram') {
        const entry = body.entry?.[0];
        if (entry && entry.messaging) {
          const messaging = entry.messaging[0];
          // Filter out echoes sent by the page itself
          if (messaging && messaging.message && !messaging.message.is_echo) {
            const senderId    = messaging.sender?.id;
            const recipientId = messaging.recipient?.id;
            const messageText = messaging.message.text || messaging.message.quick_reply?.payload || '';
            const platform    = body.object === 'page' ? 'facebook' : 'instagram';
            const phoneIdentifier = platform === 'facebook' ? `fb:${senderId}` : `ig:${senderId}`;

            const customerName = await getMetaUserProfile(senderId, platform) || (platform === 'facebook' ? 'Facebook Customer' : 'Instagram Customer');

            // ✅ Sync CRM on every message — creates or updates lead/enquiry/contact
            const session = getUserSession(phoneIdentifier);
            await syncCRMFromChat({
              phoneIdentifier,
              customerName,
              platform,
              messageText,
              sessionData: session
            });

            // Trigger full interactive chatbot (state machine)
            await handleMetaChatbot(senderId, recipientId, platform, messageText, customerName);
          }
        }
      }

      return res.status(200).send('EVENT_RECEIVED');
    } catch (err) {
      console.error('❌ Webhook Error:', err.message);
      return res.status(200).send('EVENT_RECEIVED');
    }
  }
  return res.status(405).send('Method Not Allowed');
}
