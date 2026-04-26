/**
 * POST /api/dry-run
 * Processes the latest sheet entry and sends report to bert@metaresults.com only.
 */
import { fetchSheetRows } from '../../lib/sheet.js';
import { processRow } from '../../lib/pipeline.js';

export const config = { maxDuration: 120 };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const rows   = await fetchSheetRows();
    const latest = rows[rows.length - 1];
    if (!latest) return res.status(404).json({ error: 'No rows found' });

    const result = await processRow(latest, true); // isDryRun = true
    return res.status(200).json({ ok: true, result });

  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
