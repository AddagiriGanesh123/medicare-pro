const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.elasticemail.com',
  port: 2525,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendEmail({ to, subject, html }) {
  try {
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html
    });
    console.log('Email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
}

module.exports = sendEmail;
