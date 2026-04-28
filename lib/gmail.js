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

export async function sendReportEmail(participant, scores, pdfBuffer, isDryRun = false, sections = {}) {
  const gmail = getGmailClient();
  const { name, email } = participant;
  const { composite } = scores;

  const to      = isDryRun ? BCC_EMAIL : email;
  const subject = isDryRun
    ? `[DRY RUN] Executive Communication Diagnostic — ${name}`
    : `Your Executive Communication Diagnostic Report — ${name}`;

  const headline = sections['HEADLINE'] || '';
  const snapshot = sections['SNAPSHOT'] || '';
  const hidden   = sections['THE HIDDEN GAP'] || '';
  const cost     = sections['COST OF INACTION'] || '';
  const changes  = sections['WHAT NEEDS TO CHANGE'] || '';

  const html = `<div style="font-family:Georgia,serif;max-width:620px;margin:0 auto;">
<div style="background:#0D1B2A;padding:20px 32px;border-bottom:3px solid #D4A017;">
  <div style="color:#D4A017;font-size:18px;font-weight:bold;letter-spacing:3px;font-family:Arial;">META RESULTS</div>
  <div style="color:#8899AA;font-size:11px;margin-top:4px;">Think-On-Your-Feet Executive Communication Diagnostic</div>
</div>
<div style="background:#f8f4ec;padding:32px;">
  ${isDryRun ? '<div style="background:#fff3cd;border-left:4px solid #D4A017;padding:12px;margin-bottom:20px;font-size:13px;color:#7a5c00;font-family:Arial;"><strong>DRY RUN</strong> — Sent to bert@metaresults.com only.</div>' : ''}
  <p style="font-size:16px;margin-top:0;">Dear ${name},</p>
  <p style="font-size:14px;color:#333;">Composite score: <strong>${composite}/100</strong></p>

  <div style="border-left:3px solid #C0392B;padding:14px 18px;background:#fff;margin-bottom:16px;">
    <div style="color:#C0392B;font-size:10px;font-family:Arial;letter-spacing:2px;margin-bottom:8px;">HEADLINE</div>
    <div style="font-size:17px;font-weight:bold;color:#0D1B2A;">${headline}</div>
  </div>

  <div style="border-left:3px solid #2980B9;padding:14px 18px;background:#fff;margin-bottom:16px;">
    <div style="color:#2980B9;font-size:10px;font-family:Arial;letter-spacing:2px;margin-bottom:8px;">SNAPSHOT</div>
    <div style="font-size:13px;color:#333;line-height:1.8;">${snapshot.replace(/\n/g,'<br>')}</div>
  </div>

  <div style="border-left:3px solid #D4A017;padding:14px 18px;background:#fff;margin-bottom:16px;">
    <div style="color:#D4A017;font-size:10px;font-family:Arial;letter-spacing:2px;margin-bottom:8px;">THE HIDDEN GAP</div>
    <div style="font-size:13px;color:#333;line-height:1.8;">${hidden.replace(/\n/g,'<br>')}</div>
  </div>

  <div style="border-left:3px solid #C0392B;padding:14px 18px;background:#fff;margin-bottom:16px;">
    <div style="color:#C0392B;font-size:10px;font-family:Arial;letter-spacing:2px;margin-bottom:8px;">COST OF INACTION</div>
    <div style="font-size:13px;color:#333;line-height:1.8;">${cost.replace(/\n/g,'<br>')}</div>
  </div>

  <div style="border-left:3px solid #27AE60;padding:14px 18px;background:#fff;margin-bottom:24px;">
    <div style="color:#27AE60;font-size:10px;font-family:Arial;letter-spacing:2px;margin-bottom:8px;">WHAT NEEDS TO CHANGE</div>
    <div style="font-size:13px;color:#333;line-height:2;">${changes.replace(/\n/g,'<br>')}</div>
  </div>

  <div style="text-align:center;margin:28px 0;">
    <a href="${BOOK_URL}" style="background:#D4A017;color:#0D1B2A;font-weight:bold;font-size:14px;padding:14px 36px;border-radius:6px;text-decoration:none;display:inline-block;font-family:Arial;">Book Your Strategic Debrief</a>
    <div style="color:#999;font-size:11px;margin-top:8px;font-family:Arial;">30 minutes. No obligation. Just clarity.</div>
  </div>
</div>
<div style="background:#0D1B2A;padding:14px 32px;text-align:center;">
  <div style="color:#D4A017;font-size:10px;font-family:Arial;letter-spacing:2px;">META RESULTS   www.metaresults.com</div>
</div>
</div>`;

  const mimeMsg = [
    `To: ${to}`,
    isDryRun ? '' : `Bcc: ${BCC_EMAIL}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    '',
    html,
  ].filter(l => l !== null).join('\r\n');

  const encoded = Buffer.from(mimeMsg).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const result = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encoded },
  });

  return result.data;
}
