const sgMail = require('@sendgrid/mail');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail(to, subject, html) {
  if (!to) return { success: false, error: 'No email address' };
  try {
    await sgMail.send({
      from: { name: 'MediCare Pro', email: 'ganeshaddagiriggss6@gmail.com' },
      to,
      subject,
      html,
    });
    console.log('✅ Email sent to', to);
    return { success: true };
  } catch (err) {
    console.error('Email error:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { sendEmail };
