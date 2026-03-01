const fs = require('fs');
let email = fs.readFileSync('backend/config/email.js', 'utf8');

const newEmail = `const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

async function sendEmail(to, subject, html) {
  if (!to) return { success: false, error: 'No email address' };
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
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
