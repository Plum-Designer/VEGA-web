'use client';
import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import { useVoice } from '../contexts/VoiceContext';

const VOICES = [
  { id: 'executive', name: 'Executive', desc: 'Authoritative and clear. The default Vega voice.' },
  { id: 'aria', name: 'Aria', desc: 'Warm and composed. Professional but approachable.' },
  { id: 'nova', name: 'Nova', desc: 'Calm and measured. Unhurried and deliberate.' },
  { id: 'sterling', name: 'Sterling', desc: 'Deep and direct. No-nonsense delivery.' },
];

export default function Settings() {
  const { theme, currentTheme, switchTheme, availableThemes } = useTheme();
  const { preferences, updatePreferences, exportData } = useData();
  const { voiceId, setVoiceId, speak } = useVoice();
  const [name, setName] = useState(preferences.userName || '');
  const [saved, setSaved] = useState(false);

  const handleSaveName = () => {
    updatePreferences({ userName: name });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `vega-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (confirm('This will permanently delete all your data. This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const Row = ({ label, children }) => (
    <div style={{ paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid var(--border)' }}>
      <p style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>{label}</p>
      {children}
    </div>
  );

  return (
    <div className="screen">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      <div style={{ padding: '0 16px' }}>

        <div className="card">
          <Row label="Your Name">
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input" placeholder="Preferred name" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSaveName()} style={{ flex: 1 }} />
              <button onClick={handleSaveName} className="btn-primary" style={{ width: 'auto', padding: '0 20px' }}>{saved ? '✓' : 'Save'}</button>
            </div>
          </Row>

          <Row label="Color Theme">
            {Object.entries(availableThemes).map(([key, t]) => (
              <div key={key} onClick={() => switchTheme(key)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 12px', borderRadius: 10, border: `1px solid ${currentTheme === key ? 'var(--accent)' : 'transparent'}`, cursor: 'pointer', marginBottom: 4 }}>
                <div style={{ width: 28, height: 28, borderRadius: 14, background: t.bg, border: `2px solid ${t.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 5, background: t.accent }} />
                </div>
                <span style={{ flex: 1, fontSize: 15, color: currentTheme === key ? 'var(--accent)' : 'var(--text)' }}>{t.name}</span>
                {currentTheme === key && <span style={{ color: 'var(--accent)' }}>✓</span>}
              </div>
            ))}
          </Row>

          <div style={{ paddingBottom: 0 }}>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Vega's Voice</p>
            {VOICES.map(v => (
              <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', borderRadius: 12, border: `${voiceId === v.id ? 2 : 1}px solid ${voiceId === v.id ? 'var(--accent)' : 'var(--border)'}`, background: 'var(--card)', marginBottom: 8, cursor: 'pointer' }} onClick={() => setVoiceId(v.id)}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500, marginBottom: 2 }}>{v.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{v.desc}</div>
                </div>
                <button onClick={e => { e.stopPropagation(); setVoiceId(v.id); setTimeout(() => speak('Good morning. You have three tasks pending today.'), 100); }} style={{ padding: '5px 10px', borderRadius: 14, border: '1px solid var(--border)', background: 'transparent', color: 'var(--accent)', fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap' }}>▶ Preview</button>
                {voiceId === v.id && <span style={{ color: 'var(--accent)', fontSize: 16 }}>✓</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <span style={{ fontSize: 24, color: '#22c55e' }}>●</span>
            <div>
              <p style={{ fontSize: 15, color: 'var(--text)', fontWeight: 600, marginBottom: 6 }}>100% On-Device</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>All your data lives only on this device. No accounts, no cloud, no tracking. Your tasks and schedule never leave your browser.</p>
            </div>
          </div>
        </div>

        <div className="card">
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Data</p>
          <button onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0', background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: 15, width: '100%', borderBottom: '1px solid var(--border)', marginBottom: 12 }}>
            ⬇ Export all data
          </button>
          <button onClick={handleClearData} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 15, width: '100%' }}>
            🗑 Delete all data
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-secondary)', padding: '8px 0 32px' }}>V.E.G.A v2.0 — Web</p>
      </div>
    </div>
  );
}
