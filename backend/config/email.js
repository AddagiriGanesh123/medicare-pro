const { google } = require('googleapis');
require('dotenv').config();

async function sendEmail(to, subject, html) {
  if (!to) return { success: false, error: 'No email address' };
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const message = [
      `From: ${process.env.EMAIL_FROM}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      html
    ].join('\n');

    const encoded = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encoded }
    });

    console.log('Email sent to:', to);
    return { success: true };
  } catch (err) {
    console.error('Email error:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { sendEmail };
