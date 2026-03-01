const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(to, subject, html) {
  if (!to) return { success: false, error: 'No email address' };
  try {
    const { error } = await resend.emails.send({
      from: 'MediCare Pro <onboarding@resend.dev>',
      to,
      subject,
      html,
    });
    if (error) { console.error('Email error:', error); return { success: false, error }; }
    console.log('Email sent to:', to);
    return { success: true };
  } catch (err) {
    console.error('Email error:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { sendEmail };
