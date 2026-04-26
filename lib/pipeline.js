import { calcScores, getParticipant } from './scores.js';
import { generateReport, parseSections } from './claude.js';
import { buildPDF } from './pdf.js';
import { sendReportEmail } from './gmail.js';
import { getLogoBase64 } from './logo.js';

export async function processRow(row, isDryRun = false) {
  const participant = getParticipant(row);
  const scores      = calcScores(row);

  // 1. Generate report text via Claude
  const reportText = await generateReport(participant, scores);
  const sections   = parseSections(reportText);

  // 2. Build PDF
  const logoBase64 = getLogoBase64();
  const pdfBuffer  = await buildPDF(participant, scores, sections, logoBase64);

  // 3. Send email with PDF attachment
  await sendReportEmail(participant, scores, pdfBuffer, isDryRun);

  return {
    name:      participant.name,
    email:     participant.email,
    composite: scores.composite,
    headline:  sections['HEADLINE'],
  };
}
