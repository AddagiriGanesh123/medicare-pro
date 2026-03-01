const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp.elasticemail.com',
  port: 2525,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
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
    return { success: true };
  } catch (err) {
    console.error('Email error:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { sendEmail };
