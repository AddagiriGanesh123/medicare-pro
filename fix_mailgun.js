const fs = require('fs');
const newEmail = `const formData = require('form-data');
const Mailgun = require('mailgun.js');
require('dotenv').config();

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
});

async function sendEmail(to, subject, html) {
  if (!to) return { success: false, error: 'No email address' };
  try {
    await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: 'MediCare Pro <mailgun@' + process.env.MAILGUN_DOMAIN + '>',
      to: [to],
      subject,
      html,
    });
    console.log('Email sent to:', to);
    return { success: true };
  } catch (err) {
    console.error('Email error:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { sendEmail };
`;
fs.writeFileSync('backend/config/email.js', newEmail, 'utf8');
console.log('done');
