import { useState } from 'react';

export default function Dashboard() {
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState('');

  const addLog = (msg, type='info') =>
    setLog(p => [{ ts: new Date().toLocaleTimeString(), msg, type }, ...p].slice(0, 30));

  async function runDryRun() {
    setLoading('dry');
    addLog('Starting dry run on latest entry…');
    try {
      const r = await fetch('/api/dry-run', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      const d = await r.json();
      if (d.ok) addLog(`✓ Done — ${d.result.name} (${d.result.composite}/100)`, 'success');
      else addLog(`✗ Error: ${d.error}`, 'error');
    } catch (e) {
      addLog(`✗ ${e.message}`, 'error');
    }
    setLoading('');
  }

  return (
    <div style={{ fontFamily: 'Arial', background: '#0D1B2A', minHeight: '100vh', padding: '40px', color: '#fff' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ color: '#D4A017', letterSpacing: 3 }}>META RESULTS</h1>
        <h2 style={{ color: '#8899AA', fontSize: 14 }}>Diagnostic Automation Dashboard</h2>
        <button onClick={runDryRun} disabled={!!loading}
          style={{ background: '#D4A017', color: '#0D1B2A', border: 'none', padding: '14px 28px', fontSize: 14, fontWeight: 'bold', borderRadius: 6, cursor: 'pointer', marginTop: 24 }}>
          {loading ? 'Running…' : 'Run Dry Run → bert only'}
        </button>
        <div style={{ marginTop: 24 }}>
          {log.map((l, i) => (
            <div key={i} style={{ padding: '6px 10px', marginBottom: 4, borderRadius: 4, fontSize: 12, fontFamily: 'monospace', background: 'rgba(255,255,255,0.05)', color: l.type === 'success' ? '#90EE90' : l.type === 'error' ? '#FF9090' : '#90C4F0' }}>
              {l.ts} — {l.msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
