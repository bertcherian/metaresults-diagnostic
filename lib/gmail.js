import { google } from 'googleapis';

const BCC_EMAIL = 'bert@metaresults.com';
const BOOK_URL  = 'https://tidycal.com/metaresults/debrief';

function getGmailClient() {
  const auth = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
  );
  auth.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
  return google.gmail({ version: 'v1', auth });
}

export async function sendReportEmail(participant, scores, pdfBuffer, isDryRun = false) {
  const gmail = getGmailClient();
  const { name, email } = participant;
  const { composite } = scores;

  const to      = isDryRun ? BCC_EMAIL : email;
  const bccLine = isDryRun ? '' : `Bcc: ${BCC_EMAIL}\r\n`;
  const subject = isDryRun
    ? `[DRY RUN] Executive Communication Diagnostic — ${name}`
    : `Your Executive Communication Diagnostic Report — ${name}`;

  const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');

  const html = `<div style="font-family:Georgia,serif;max-width:620px;margin:0 auto;">
<div style="background:#0D1B2A;padding:20px 32px;border-bottom:3px solid #D4A017;">
  <div style="color:#D4A017;font-size:18px;font-weight:bold;letter-spacing:3px;font-family:Arial;">META RESULTS</div>
  <div style="color:#8899AA;font-size:11px;margin-top:4px;font-family:Arial;">Think-On-Your-Feet Executive Communication Diagnostic</div>
</div>
<div style="background:#f8f4ec;padding:32px;">
  ${isDryRun ? '<div style="background:#fff3cd;border-left:4px solid #D4A017;padding:12px;margin-bottom:20px;font-size:13px;color:#7a5c00;font-family:Arial;"><strong>DRY RUN</strong> — Production sends to participant + BCC bert@metaresults.com</div>' : ''}
  <p style="font-size:16px;margin-top:0;">Dear ${name},</p>
  <p style="font-size:14px;line-height:1.8;color:#333;">Your <strong>Executive Communication Diagnostic Report</strong> is ready. Composite score: <strong>${composite}/100</strong>.</p>
  <p style="font-size:14px;line-height:1.8;color:#333;">The full 5-page report is attached. Read it with honest eyes — the gap is specific and the upside is real.</p>
  <div style="text-align:center;margin:28px 0;">
    <a href="${BOOK_URL}" style="background:#D4A017;color:#0D1B2A;font-weight:bold;font-size:14px;padding:14px 32px;border-radius:6px;text-decoration:none;display:inline-block;font-family:Arial;">Book Your Strategic Debrief</a>
    <div style="color:#888;font-size:11px;margin-top:8px;font-family:Arial;">30 minutes. No obligation. Just clarity.</div>
  </div>
  <p style="font-size:13px;color:#666;">Regards,<br><strong>The Meta Results Team</strong><br><a href="https://metaresults.com" style="color:#D4A017;">metaresults.com</a></p>
</div>
<div style="background:#0D1B2A;padding:14px 32px;text-align:center;">
  <div style="color:#D4A017;font-size:10px;font-family:Arial;letter-spacing:2px;">META RESULTS  |  www.metaresults.com</div>
</div>
</div>`;

  const boundary = `MR_${Date.now()}`;
  const mimeMsg = [
    `To: ${to}`,
    bccLine.trim(),
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    '',
    html,
    '',
    `--${boundary}`,
    'Content-Type: application/pdf',
    'Content-Transfer-Encoding: base64',
    `Content-Disposition: attachment; filename="${name.replace(/\s+/g,'_')}_MetaResults_Diagnostic.pdf"`,
    '',
    pdfBase64,
    '',
    `--${boundary}--`,
  ].filter(l => l !== null).join('\r\n');

  const encoded = Buffer.from(mimeMsg).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const result = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encoded },
  });

  return result.data;
}
