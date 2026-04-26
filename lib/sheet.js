/**
 * Fetches all rows from the public Google Sheet via the GViz API.
 * Sheet must be "Anyone with the link can view".
 */
const SHEET_ID = process.env.SHEET_ID || '1yPSRv3-VKiOqtJjDSN20oMZ28gEiREhrV7vLNLNQcrE';

export async function fetchSheetRows() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&t=${Date.now()}`;
  const res  = await fetch(url);
  const text = await res.text();
  const json = JSON.parse(text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);/)[1]);
  const cols = json.table.cols.map(c => c.label);
  return json.table.rows
    .map(r => Object.fromEntries(cols.map((c, i) => [c, r.c[i]?.v ?? ''])))
    .filter(r => r['Email Address'] && (r['Name'] || r['Participant Name']));
}
