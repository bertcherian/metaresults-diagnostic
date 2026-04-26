/**
 * Vercel Cron Job — runs every 30 minutes (see vercel.json).
 * Fetches the Google Sheet, finds new entries, processes each one.
 */
import { fetchSheetRows } from '../../lib/sheet.js';
import { isProcessed, markProcessed, getRowKey } from '../../lib/processed.js';
import { processRow } from '../../lib/pipeline.js';

export const config = { maxDuration: 300 };  // 5 min timeout

export default async function handler(req, res) {
  // Verify Vercel cron secret to prevent unauthorized calls
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const results = { processed: [], skipped: 0, errors: [] };

  try {
    const rows = await fetchSheetRows();

    for (const row of rows) {
      const key = getRowKey(row);
      if (isProcessed(key)) { results.skipped++; continue; }

      try {
        const result = await processRow(row, false);
        markProcessed(key);
        results.processed.push(result);
        console.log(`✓ Processed: ${result.name} (${result.composite}/100)`);
      } catch (err) {
        results.errors.push({ row: key, error: err.message });
        console.error(`✗ Failed: ${key} — ${err.message}`);
      }
    }

    return res.status(200).json({
      ok: true,
      timestamp: new Date().toISOString(),
      ...results,
    });

  } catch (err) {
    console.error('Cron job failed:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
