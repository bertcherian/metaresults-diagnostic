export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { fetchSheetRows } = await import('../../lib/sheet.js');
    const { processRow } = await import('../../lib/pipeline.js');
    const rows = await fetchSheetRows();
    const latest = rows[rows.length - 1];
    if (!latest) return res.status(404).json({ error: 'No rows found' });
    const result = await processRow(latest, true);
    return res.status(200).json({ ok: true, result });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
