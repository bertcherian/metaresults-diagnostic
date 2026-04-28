import { calcScores, getParticipant } from './scores.js';
import { generateReport, parseSections } from './claude.js';
import { sendReportEmail } from './gmail.js';

export async function processRow(row, isDryRun = false) {
  const participant = getParticipant(row);
  const scores      = calcScores(row);

  // 1. Generate report text via Claude
  const reportText = await generateReport(participant, scores);
  const sections   = parseSections(reportText);

  // 2. Send email as HTML (PDF generation skipped for server compatibility)
  await sendReportEmail(participant, scores, null, isDryRun, sections);

  return {
    name:      participant.name,
    email:     participant.email,
    composite: scores.composite,
    headline:  sections['HEADLINE'],
  };
}
