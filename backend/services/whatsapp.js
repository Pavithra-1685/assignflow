const axios = require('axios');

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

/**
 * Sends a WhatsApp message via Cloud API
 */
async function sendMessage(to, text) {
  if (!WHATSAPP_TOKEN || !PHONE_ID) {
    console.warn('WhatsApp credentials not configured. Skipping notification.');
    return;
  }

  try {
    const url = `https://graph.facebook.com/v17.0/${PHONE_ID}/messages`;
    await axios.post(url, {
      messaging_product: 'whatsapp',
      to: to, // Phone number with country code
      type: 'text',
      text: { body: text }
    }, {
      headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` }
    });
  } catch (err) {
    console.error('WhatsApp sending error:', err.response?.data || err.message);
  }
}

/**
 * Specifically for Assignment notifications
 */
async function sendAssignmentNotification(to, assignment) {
  const text = `🚀 *New Assignment: ${assignment.title}*\n\n📚 Subject: ${assignment.subject}\n📅 Deadline: ${new Date(assignment.deadline).toLocaleDateString()}\n\n🔗 Link: ${process.env.FRONTEND_URL}/assignments/${assignment._id}`;
  await sendMessage(to, text);
}

module.exports = { sendMessage, sendAssignmentNotification };
