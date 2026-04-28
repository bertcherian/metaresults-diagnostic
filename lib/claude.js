const BOOK_URL = 'https://tidycal.com/metaresults/debrief';

export async function generateReport(participant, scores) {
  const { name, email } = participant;
  const { q, thinking, fluency, confidence, presence, composite } = scores;

  const prompt = `You are an elite executive coach working with Senior Managers, AVPs, VPs, and SVPs in GCCs.
Your job is NOT to create a feel-good report. Your job is to create a report that drives ACTION.

PARTICIPANT: ${name} | EMAIL: ${email}
COMPOSITE: ${composite}/100 | Thinking: ${thinking}/25 | Fluency: ${fluency}/25 | Confidence: ${confidence}/25 | Presence: ${presence}/25

RAW Q SCORES (1-5): ${q.join(', ')}

Return ONLY these 8 plain-text sections. No markdown, no asterisks, no bullets:

HEADLINE
[One sharp confronting line]

SNAPSHOT
[3-4 crisp lines: what works, what does not, why this matters NOW]

THE HIDDEN GAP
You believe [X].
But what is actually happening is [Y].
This is why [Z] is not working.

COST OF INACTION
[Real career consequences. Business-grounded. Not soft.]

MOMENTS THAT MATTER
[Specific high-stakes situations where this shows up]

POINT OF NO RETURN
[Why delay is dangerous at their level. 12-18 month window.]

WHAT NEEDS TO CHANGE
From: [X]
To: [Y]

From: [X]
To: [Y]

From: [X]
To: [Y]

INVITATION
Based on your profile, this is worth a deeper conversation. I am opening a few 30-minute Strategic Debrief sessions where we: break down exactly where your communication is breaking in real situations, identify the specific shift needed for your next level, and map a clear path forward. Reserve your slot at: ${BOOK_URL}

TONE: Direct, sharp, slightly provocative. This is an intervention.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 1800,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Claude API error');
  return data.content.filter(b => b.type === 'text').map(b => b.text).join('\n');
}

export function parseSections(text) {
  const keys = [
    'HEADLINE', 'SNAPSHOT', 'THE HIDDEN GAP', 'COST OF INACTION',
    'MOMENTS THAT MATTER', 'POINT OF NO RETURN', 'WHAT NEEDS TO CHANGE', 'INVITATION'
  ];
  const out = {};
  keys.forEach((k, i) => {
    const next = keys[i + 1];
    const rx = new RegExp(`${k}\\n([\\s\\S]*?)${next ? `(?=\\n${next})` : '$'}`, 'i');
    const m = text.match(rx);
    out[k] = m ? m[1].trim() : '';
  });
  return out;
}
