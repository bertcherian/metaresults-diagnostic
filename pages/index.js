import { useState } from 'react';

const NAVY = '#0D1B2A', GOLD = '#D4A017', IVORY = '#F5F0E8', NAVY_MID = '#1E3A5F';

export default function Dashboard() {
  const [apiKey, setApiKey]   = useState('');
  const [status, setStatus]   = useState(null);
  const [log, setLog]         = useState([]);
  const [loading, setLoading] = useState('');

  const addLog = (msg, type='info') =>
    setLog(p => [{ ts: new Date().toLocaleTimeString(), msg, type }, ...p].slice(0, 30));

  async function fetchStatus() {
    setLoading('status');
    try {
      const r = await fetch('/api/status', { headers: { 'x-api-key': apiKey } });
      const d = await r.json();
      setStatus(d);
      addLog(`Status loaded — ${d.total} total, ${d.processed} processed, ${d.pending} pending`, 'success');
    } catch (e) { addLog(`Error: ${e.message}`, 'error'); }
    setLoading('');
  }

  async function runDryRun() {
    setLoading('dry');
    addLog('Starting dry run on latest entry…');
    try {
      const r = await fetch('/api/dry-run', { method: 'POST', headers: { 'x-api-key': apiKey } });
      const d = await r.json();
      if (d.ok) addLog(`✓ Dry run complete — ${d.result.name} (${d.result.composite}/100) → bert@metaresults.com`, 'success');
      else addLog(`✗ Failed: ${d.error}`, 'error');
    } catch (e) { addLog(`Error: ${e.message}`, 'error'); }
    setLoading('');
  }

  const s = {
    page:  { fontFamily: 'Georgia, serif', background: NAVY, minHeight: '100vh', margin: 0, padding: 0 },
    hdr:   { background: NAVY_MID, borderBottom: `2px solid ${GOLD}`, padding: '18px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    body:  { maxWidth: 860, margin: '0 auto', padding: '28px 24px' },
    card:  { background: NAVY_MID, border: `1px solid #1E3A5F`, borderRadius: 10, padding: '20px 24px', marginBottom: 16 },
    label: { color: GOLD, fontSize: 10, letterSpacing: 2, fontFamily: 'Arial', fontWeight: 'bold', marginBottom: 6, display: 'block' },
    input: { background: '#080F18', color: IVORY, border: `1px solid #1E3A5F`, borderRadius: 6, padding: '9px 12px', fontSize: 12, fontFamily: 'monospace', width: '100%', marginTop: 6, boxSizing: 'border-box' },
    btn:   (primary, danger) => ({ background: primary ? GOLD : 'transparent', color: primary ? NAVY : danger ? '#E74C3C' : GOLD, border: `1px solid ${danger ? '#E74C3C' : GOLD}`, borderRadius: 6, padding: '9px 20px', fontSize: 12, fontFamily: 'Arial', fontWeight: 'bold', cursor: 'pointer', marginRight: 8 }),
    row:   t => ({ padding: '4px 10px', fontSize: 11, fontFamily: 'monospace', borderLeft: `3px solid ${t==='error'?'#E74C3C':t==='success'?'#27AE60':'#2980B9'}`, marginBottom: 3, color: t==='error'?'#FF9090':t==='success'?'#90EE90':'#90C4F0', background: 'rgba(0,0,0,0.2)', borderRadius: '0 4px 4px 0' }),
  };

  return (
    <div style={s.page}>
      <div style={s.hdr}>
        <div>
          <div style={{ color: GOLD, fontWeight: 'bold', fontSize: 18, letterSpacing: 3, fontFamily: 'Arial' }}>META RESULTS</div>
          <div style={{ color: '#8899AA', fontSize: 10, letterSpacing: 1, marginTop: 2 }}>DIAGNOSTIC AUTOMATION DASHBOARD</div>
        </div>
        <div style={{ color: '#27AE60', fontSize: 11, fontFamily: 'Arial', fontWeight: 'bold' }}>
          ● VERCEL CRON ACTIVE — Every 30 Minutes
        </div>
      </div>

      <div style={s.body}>

        <div style={s.card}>
          <span style={s.label}>ADMIN API KEY</span>
          <input style={s.input} type="password" placeholder="Enter ADMIN_API_KEY from Vercel env vars…"
            value={apiKey} onChange={e => setApiKey(e.target.value)} />
        </div>

        <div style={s.card}>
          <span style={s.label}>CONTROLS</span>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            <button style={s.btn(false)} onClick={fetchStatus} disabled={!!loading}>
              {loading === 'status' ? 'Loading…' : 'Refresh Status'}
            </button>
            <button style={s.btn(true)} onClick={runDryRun} disabled={!!loading}>
              {loading === 'dry' ? 'Running…' : 'Run Dry Run → bert only'}
            </button>
          </div>
        </div>

        {status && (
          <div style={s.card}>
            <span style={s.label}>SHEET STATUS</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 8, marginBottom: 16 }}>
              {[['TOTAL RESPONSES', status.total, '#2980B9'], ['PROCESSED', status.processed, '#27AE60'], ['PENDING', status.pending, '#E67E22']].map(([l, v, c]) => (
                <div key={l} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: '12px 16px', textAlign: 'center' }}>
                  <div style={{ color: c, fontSize: 28, fontWeight: 'bold', fontFamily: 'Arial' }}>{v}</div>
                  <div style={{ color: '#8899AA', fontSize: 9, letterSpacing: 1 }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
              {status.entries?.map((e, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #1E3A5F', fontSize: 12 }}>
                  <span style={{ color: IVORY }}>{e.name}</span>
                  <span style={{ color: '#8899AA', fontSize: 11 }}>{e.email}</span>
                  <span style={{ color: e.processed ? '#27AE60' : '#E67E22', fontFamily: 'Arial', fontSize: 11 }}>
                    {e.processed ? '✓ sent' : '⏳ pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ ...s.card, borderColor: GOLD + '33' }}>
          <span style={s.label}>HOW IT WORKS</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
            {[
              ['Vercel Cron', 'Fires every 30 min automatically — no browser tab needed'],
              ['Sheet Check', 'Reads Google Sheet, skips already-processed rows'],
              ['Claude AI', 'Generates personalised 8-section intervention report'],
              ['PDF + Email', '5-page branded PDF sent as attachment to participant + BCC bert'],
            ].map(([t, d]) => (
              <div key={t} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: '10px 14px' }}>
                <div style={{ color: GOLD, fontSize: 10, fontFamily: 'Arial', fontWeight: 'bold', marginBottom: 4 }}>{t}</div>
                <div style={{ color: '#8899AA', fontSize: 11, fontFamily: 'Arial' }}>{d}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={s.card}>
          <span style={s.label}>ACTIVITY LOG</span>
          <div style={{ marginTop: 8, maxHeight: 220, overflowY: 'auto' }}>
            {!log.length
              ? <div style={{ color: '#334455', fontSize: 11, fontFamily: 'monospace' }}>No activity yet.</div>
              : log.map((l, i) => (
                <div key={i} style={s.row(l.type)}>
                  <span style={{ color: '#445566' }}>{l.ts}</span>{'  '}{l.msg}
                </div>
              ))
            }
          </div>
        </div>

      </div>
    </div>
  );
}
