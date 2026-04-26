/**
 * Maps a Google Sheet row (object) to dimension scores.
 * The sheet columns after Timestamp, Email, Name are the 20 Q scores.
 */
export function calcScores(row) {
  // Get all keys except metadata fields
  const metaKeys = ['Timestamp', 'Email Address', 'Name'];
  const qKeys = Object.keys(row).filter(k => !metaKeys.includes(k));
  const q = qKeys.slice(0, 20).map(k => Math.min(5, Math.max(1, parseInt(row[k]) || 3)));
  while (q.length < 20) q.push(3);

  // Dimension mapping
  const thinking   = Math.round(((q[0]+q[1]+q[2]+q[3])   / 20) * 25);
  const fluency    = Math.round(((q[5]+q[6]+q[7]+q[8]+q[9]) / 25) * 25);
  const confidence = Math.round(((q[4]+q[10]+q[11]+q[12]+q[13]) / 25) * 25);
  const presence   = Math.round(((q[14]+q[15]+q[16]+q[17]+q[18]+q[19]) / 30) * 25);
  const composite  = thinking + fluency + confidence + presence;

  return { q, thinking, fluency, confidence, presence, composite };
}

export function getParticipant(row) {
  return {
    name:      row['Name'] || row['Participant Name'] || 'Participant',
    email:     row['Email Address'] || row['Email'] || '',
    timestamp: row['Timestamp'] || '',
  };
}
