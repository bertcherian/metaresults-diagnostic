import { fetchSheetRows } from '../../lib/sheet.js';
import { isProcessed, getRowKey } from '../../lib/processed.js';

export default async function handler(req, res) {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const rows = await fetchSheetRows();
    const status = rows.map(row => ({
      name:      row['Name'] || row['Participant Name'] || '?',
      email:     row['Email Address'] || '',
      timestamp: row['Timestamp'] || '',
      processed: isProcessed(getRowKey(row)),
    }));

    return res.status(200).json({
      total:     rows.length,
      processed: status.filter(s => s.processed).length,
      pending:   status.filter(s => !s.processed).length,
      entries:   status,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
