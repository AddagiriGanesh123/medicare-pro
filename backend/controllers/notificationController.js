const { sendPushNotification } = require('../config/firebase');
const { query } = require('../config/db');
const { sendEmail } = require('../config/email');
const templates = require('../../notifications/templates');

async function notify(patient, templateKey, ...args) {
  const tmpl = templates[templateKey](patient, ...args);
  let status = 'pending';

  // Push notification
  if (patient.fcm_token) {
    const result = await sendPushNotification(patient.fcm_token, tmpl.title, tmpl.body, { type: tmpl.type });
    status = result.success ? 'sent' : 'failed';
  }

  // Email notification
  if (patient.email) {
    const emailHtml = buildEmailHtml(tmpl.title, tmpl.body, patient.name);
    await sendEmail(patient.email, tmpl.title, emailHtml);
  }

  await query(
    'INSERT INTO notification_logs (patient_id, type, title, message, status) VALUES ($1,$2,$3,$4,$5)',
    [patient.id, tmpl.type, tmpl.title, tmpl.body, status]
  );
  return { ...tmpl, status };
}

function buildEmailHtml(title, body, patientName) {
  // pick icon & accent color based on title keyword
  const isPayment   = title.toLowerCase().includes('payment') || title.toLowerCase().includes('confirmed');
  const isAppt      = title.toLowerCase().includes('appointment');
  const isReport    = title.toLowerCase().includes('report');
  const isBill      = title.toLowerCase().includes('bill');
  const isWelcome   = title.toLowerCase().includes('welcome');
  const isCancelled = title.toLowerCase().includes('cancel');

  const icon  = isPayment ? '✅' : isAppt ? '📅' : isReport ? '📋' : isBill ? '💳' : isWelcome ? '🏥' : isCancelled ? '❌' : '🔔';
  const accent = isCancelled ? '#e05e6d' : '#00b4a6';
  const accentDark = isCancelled ? '#c0394a' : '#007a70';
  const accentBg   = isCancelled ? '#fff0f2' : '#f0faf9';
  const cleanTitle = title.replace(/^[\p{Emoji}\s]+/u, '').trim();
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${cleanTitle}</title>
</head>
<body style="margin:0;padding:0;background:#eaf3f1;font-family:Georgia,'Times New Roman',serif;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eaf3f1;padding:40px 16px;">
<tr><td align="center">

  <!-- Outer wrapper -->
  <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

    <!-- ── TOP LABEL ── -->
    <tr>
      <td align="center" style="padding-bottom:14px;">
        <span style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#5a8a84;font-weight:600;">MEDICARE PRO &nbsp;·&nbsp; PATIENT NOTIFICATION</span>
      </td>
    </tr>

    <!-- ── MAIN CARD ── -->
    <tr>
      <td style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(7,26,23,0.12);">

        <!-- HEADER BAND -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="background:#071a17;padding:0;">

              <!-- top teal line -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:${accent};height:4px;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>

              <!-- brand row -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:32px 40px 28px;">

                    <!-- logo row -->
                    <table cellpadding="0" cellspacing="0" border="0" align="center">
                      <tr>
                        <td align="center" style="width:52px;height:52px;background:rgba(0,180,166,0.15);border:1.5px solid rgba(0,180,166,0.4);border-radius:50%;">
                          <span style="font-size:24px;line-height:52px;">🏥</span>
                        </td>
                        <td style="width:16px;">&nbsp;</td>
                        <td>
                          <div style="font-family:Georgia,serif;font-size:26px;font-weight:400;color:#ffffff;letter-spacing:1px;">MediCare <span style="color:${accent}">Pro</span></div>
                          <div style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.35);margin-top:3px;">Hospital Management System</div>
                        </td>
                      </tr>
                    </table>

                    <!-- divider -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
                      <tr><td style="border-top:1px solid rgba(255,255,255,0.08);font-size:0;line-height:0;">&nbsp;</td></tr>
                    </table>

                    <!-- notification type chip -->
                    <table cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;">
                      <tr>
                        <td style="background:rgba(0,180,166,0.15);border:1px solid rgba(0,180,166,0.3);border-radius:20px;padding:5px 16px;">
                          <span style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${accent};font-weight:700;">${icon}&nbsp; ${cleanTitle}</span>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>

        <!-- BODY -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding:36px 40px 32px;">

              <!-- greeting -->
              <p style="font-family:Arial,sans-serif;font-size:15px;color:#5a7a74;margin:0 0 6px;font-weight:400;">Dear Patient,</p>
              <p style="font-family:Georgia,serif;font-size:22px;color:#071a17;margin:0 0 28px;font-weight:400;letter-spacing:0.3px;">${patientName}<span style="color:${accent}">.</span></p>

              <!-- message card -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:${accentBg};border-radius:12px;padding:24px 26px;border-left:4px solid ${accent};">

                    <!-- icon + title row -->
                    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;">
                      <tr>
                        <td style="width:42px;height:42px;background:${accent};border-radius:10px;text-align:center;vertical-align:middle;">
                          <span style="font-size:20px;line-height:42px;">${icon}</span>
                        </td>
                        <td style="width:14px;">&nbsp;</td>
                        <td>
                          <span style="font-family:Georgia,serif;font-size:18px;font-weight:400;color:${accentDark};letter-spacing:0.3px;">${cleanTitle}</span>
                        </td>
                      </tr>
                    </table>

                    <!-- divider -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;">
                      <tr><td style="border-top:1px solid rgba(0,180,166,0.2);font-size:0;line-height:0;">&nbsp;</td></tr>
                    </table>

                    <!-- body text -->
                    <p style="font-family:Arial,sans-serif;font-size:15px;color:#2a4a45;margin:0;line-height:1.75;font-weight:400;">${body}</p>

                  </td>
                </tr>
              </table>

              <!-- spacer -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 0;">
                <tr><td style="border-top:1px solid #e0eeec;font-size:0;line-height:0;">&nbsp;</td></tr>
              </table>

              <!-- portal link -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;" align="center">
                <tr>
                  <td style="background:#071a17;border-radius:10px;padding:14px 32px;text-align:center;">
                    <a href="https://medicare-pro-1zjo.onrender.com/portal" target="_blank" style="font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:${accent};letter-spacing:2px;text-transform:uppercase;text-decoration:none;">View in Patient Portal →</a>
                  </td>
                </tr>
              </table>

              <!-- support text -->
              <p style="font-family:Arial,sans-serif;font-size:13px;color:#8aa8a4;margin:24px 0 0;text-align:center;line-height:1.6;">
                Questions? Visit your nearest MediCare Pro centre<br>or reply to this email for support.
              </p>

            </td>
          </tr>
        </table>

        <!-- FOOTER -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="background:#071a17;padding:24px 40px;border-radius:0 0 20px 20px;">

              <!-- trust badges row -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding:0 10px;font-family:Arial,sans-serif;font-size:10px;color:rgba(0,180,166,0.6);letter-spacing:1px;text-transform:uppercase;">✓ HIPAA</td>
                        <td style="color:rgba(255,255,255,0.15);font-size:14px;">|</td>
                        <td style="padding:0 10px;font-family:Arial,sans-serif;font-size:10px;color:rgba(0,180,166,0.6);letter-spacing:1px;text-transform:uppercase;">✓ SSL</td>
                        <td style="color:rgba(255,255,255,0.15);font-size:14px;">|</td>
                        <td style="padding:0 10px;font-family:Arial,sans-serif;font-size:10px;color:rgba(0,180,166,0.6);letter-spacing:1px;text-transform:uppercase;">✓ Encrypted</td>
                        <td style="color:rgba(255,255,255,0.15);font-size:14px;">|</td>
                        <td style="padding:0 10px;font-family:Arial,sans-serif;font-size:10px;color:rgba(0,180,166,0.6);letter-spacing:1px;text-transform:uppercase;">✓ SOC 2</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="border-top:1px solid rgba(255,255,255,0.07);font-size:0;line-height:0;">&nbsp;</td></tr>
              </table>

              <p style="font-family:Arial,sans-serif;font-size:12px;color:rgba(255,255,255,0.25);margin:14px 0 0;text-align:center;letter-spacing:0.5px;">
                © ${year} MediCare Pro. All rights reserved.
              </p>
              <p style="font-family:Arial,sans-serif;font-size:11px;color:rgba(255,255,255,0.15);margin:4px 0 0;text-align:center;">
                This is an automated message. Please do not reply.
              </p>

            </td>
          </tr>
        </table>

      </td>
    </tr>

    <!-- bottom label -->
    <tr>
      <td align="center" style="padding-top:20px;">
        <span style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8aaa a4;">Your health journey starts here.</span>
      </td>
    </tr>

  </table>

</td></tr>
</table>

</body>
</html>`;
}

module.exports = {
  notifyRegistration:          (p)    => notify(p, 'PATIENT_REGISTERED'),
  notifyAppointmentScheduled:  (p, a) => notify(p, 'APPOINTMENT_SCHEDULED', a),
  notifyAppointmentCancelled:  (p, a) => notify(p, 'APPOINTMENT_CANCELLED', a),
  notifyReportReady:           (p, r) => notify(p, 'REPORT_READY', r),
  notifyBillGenerated:         (p, b) => notify(p, 'BILL_GENERATED', b),
  notifyPaymentReceived:       (p, b) => notify(p, 'PAYMENT_RECEIVED', b),
  saveFcmToken: async (req, res) => {
    try {
      const { patient_id, fcm_token } = req.body;
      await query('UPDATE patients SET fcm_token = $1 WHERE id = $2', [fcm_token, patient_id]);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  },
  getLogs: async (req, res) => {
    try {
      const { patient_id } = req.query;
      let sql = 'SELECT * FROM notification_logs ORDER BY created_at DESC LIMIT 100';
      let params = [];
      if (patient_id) {
        sql = 'SELECT * FROM notification_logs WHERE patient_id = $1 ORDER BY created_at DESC LIMIT 50';
        params = [patient_id];
      }
      const { rows } = await query(sql, params);
      res.json({ rows });
    } catch (err) { res.status(500).json({ error: err.message }); }
  },
};