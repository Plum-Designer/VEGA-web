'use client';
import { useState, useEffect, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { useVoice } from '../contexts/VoiceContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Dashboard({ onNavigate }) {
  const { tasks, getTodaysEvents, getCompletionRate, getPendingCount, getOverdueTasks, preferences } = useData();
  const { speak, isListening, isSpeaking, startListening, stopListening, transcript } = useVoice();
  const { theme } = useTheme();
  const [time, setTime] = useState(new Date());
  const r1 = useRef(null), r2 = useRef(null), r3 = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const h = time.getHours();
  const greeting = h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
  const todaysEvents = getTodaysEvents();
  const overdue = getOverdueTasks();
  const pending = getPendingCount();
  const rate = getCompletionRate();
  const name = preferences.userName && preferences.userName !== 'there' ? preferences.userName : null;

  const handleVega = () => {
    if (isSpeaking) { window.speechSynthesis?.cancel(); return; }
    if (isListening) { stopListening(); return; }

    const briefing = `${greeting}${name ? `, ${name}` : ''}. Vega here. You have ${pending} task${pending !== 1 ? 's' : ''} pending and ${todaysEvents.length} event${todaysEvents.length !== 1 ? 's' : ''} today.${overdue.length > 0 ? ` ${overdue.length} item${overdue.length !== 1 ? 's are' : ' is'} overdue.` : ''} ${todaysEvents[0] ? `Your next event is ${todaysEvents[0].title}${todaysEvents[0].time ? ` at ${todaysEvents[0].time}` : ''}.` : 'You have no events scheduled today.'}`;

    speak(briefing);
  };

  const micColor = isListening ? '#ef4444' : isSpeaking ? '#22c55e' : theme.accent;
  const micLabel = isListening ? 'Listening...' : isSpeaking ? 'Speaking' : 'Brief me';

  return (
    <div className="screen" style={{ paddingTop: 0, position: 'relative', minHeight: '100%', overflow: 'hidden' }}>

      {/* Rotating background rects */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 0 }}>
        {[20, 30, 40].map((dur, i) => (
          <div key={i} className="bg-rect" style={{ position: 'absolute', animation: `rotateRect ${dur}s linear infinite`, transformOrigin: `32px ${200 + i * 60}px` }} />
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 1, padding: '20px 24px 0' }}>
        {/* Date/time */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 12, color: 'var(--text-secondary)' }}>
          <span>{time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          <span>{time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
        </div>

        {/* VEGA title */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 48, fontWeight: 100, letterSpacing: '0.75rem', color: 'var(--accent)', lineHeight: 1.1 }}>V.E.G.A</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}>{greeting}{name ? `, ${name}` : ''}</div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 20 }}>
          {[
            { n: pending, l: 'Pending' },
            { n: `${rate}%`, l: 'Done' },
            { n: overdue.length, l: 'Overdue', color: overdue.length > 0 ? '#ef4444' : undefined },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: '12px 8px', textAlign: 'center', margin: 0 }}>
              <div style={{ fontSize: 26, fontWeight: 200, color: s.color || 'var(--accent)' }}>{s.n}</div>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Mic button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20, gap: 8 }}>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{micLabel}</div>
          <button onClick={handleVega} style={{ width: 64, height: 64, borderRadius: 32, border: `1.5px solid ${micColor}`, background: `${micColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 24, transition: 'all 0.2s' }}>
            <div style={{ width: 48, height: 48, borderRadius: 24, background: micColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
              {isSpeaking ? '⏹' : isListening ? '●' : '🎤'}
            </div>
          </button>
          {(isListening && transcript) && <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic', maxWidth: 280, textAlign: 'center' }}>{transcript}</div>}
        </div>

        {/* Today */}
        <div className="card" style={{ marginLeft: 0, marginRight: 0 }}>
          <div className="card-title">Today</div>
          {todaysEvents.length === 0
            ? <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic' }}>No events scheduled</p>
            : todaysEvents.slice(0, 3).map(e => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 14, fontWeight: 300 }}>{e.title}</span>
                {e.time && <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{e.time}</span>}
              </div>
            ))
          }
        </div>

        {/* Tasks preview */}
        <div className="card" style={{ marginLeft: 0, marginRight: 0, marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="card-title" style={{ margin: 0 }}>Tasks</div>
            <button onClick={() => onNavigate('tasks')} style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>See all</button>
          </div>
          {tasks.filter(t => !t.completed).length === 0
            ? <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic' }}>All caught up!</p>
            : tasks.filter(t => !t.completed).slice(0, 4).map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 14, fontWeight: 300 }}>{t.title}</span>
              </div>
            ))
          }
        </div>

        <div className="privacy-badge">
          <span style={{ color: '#22c55e', fontSize: 12 }}>●</span>
          <span className="privacy-text">All data stored on your device only</span>
        </div>
      </div>
    </div>
  );
}
