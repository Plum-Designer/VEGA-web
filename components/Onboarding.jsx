'use client';
import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';

const STEPS = ['welcome', 'privacy', 'theme', 'complete'];

const SAMPLE_TASKS = [
  { title: 'Review your schedule for the week', priority: 'high', category: 'personal', recurrence: { type: 'none' }, isSample: true },
  { title: 'Morning workout', priority: 'medium', category: 'health', recurrence: { type: 'weekdays', startDate: new Date().toISOString().split('T')[0] }, isSample: true },
  { title: 'Weekly team sync', priority: 'high', category: 'work', recurrence: { type: 'weekly', startDate: new Date().toISOString().split('T')[0] }, isSample: true },
];

const SAMPLE_EVENTS = [
  { title: 'Team standup', date: new Date().toISOString().split('T')[0], time: '9:30 AM', duration: '30 min', type: 'work', recurrence: { type: 'weekdays', startDate: new Date().toISOString().split('T')[0] }, isSample: true },
  { title: 'Lunch', date: new Date().toISOString().split('T')[0], time: '12:00 PM', duration: '1 hr', type: 'personal', recurrence: { type: 'weekdays', startDate: new Date().toISOString().split('T')[0] }, isSample: true },
];

export default function Onboarding({ onComplete }) {
  const { theme, currentTheme, switchTheme, availableThemes } = useTheme();
  const { addTask, addEvent } = useData();
  const [step, setStep] = useState(0);

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const finish = () => {
    SAMPLE_TASKS.forEach(t => addTask({ ...t, dueDate: null }));
    SAMPLE_EVENTS.forEach(e => addEvent(e));
    localStorage.setItem('vega_onboarding_complete', 'true');
    onComplete();
  };

  const s = { background: 'var(--bg)', minHeight: '100dvh', display: 'flex', flexDirection: 'column', padding: '60px 28px 48px', maxWidth: 480, margin: '0 auto' };
  const center = { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' };

  if (STEPS[step] === 'welcome') return (
    <div style={s}>
      <div style={center}>
        <div style={{ fontSize: 48, fontWeight: 100, letterSpacing: '0.75rem', color: 'var(--accent)', textAlign: 'center', marginBottom: 12 }}>V.E.G.A</div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 32, letterSpacing: 1 }}>Virtual Executive General Assistant</p>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--text)', textAlign: 'center', fontWeight: 300 }}>Your personal day manager. Built to help you stay on track, beat procrastination, and actually get things done — privately, in your browser.</p>
      </div>
      <button className="btn-primary" onClick={next}>Get Started</button>
    </div>
  );

  if (STEPS[step] === 'privacy') return (
    <div style={s}>
      <div style={center}>
        <h2 style={{ fontSize: 28, fontWeight: 300, letterSpacing: 2, color: 'var(--accent)', textAlign: 'center', marginBottom: 24 }}>Privacy First</h2>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--text)', textAlign: 'center', fontWeight: 300, marginBottom: 12 }}>V.E.G.A does not store your data on any server. Everything lives in your browser's local storage — on your device only.</p>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--text)', textAlign: 'center', fontWeight: 300 }}>No accounts. No cloud. No tracking. Ever.</p>
        <div style={{ marginTop: 28, padding: '10px 20px', borderRadius: 20, border: '1px solid #22c55e44', background: '#22c55e11', display: 'inline-block', alignSelf: 'center' }}>
          <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 500 }}>100% On-Device · No Accounts · No Cloud</span>
        </div>
      </div>
      <button className="btn-primary" onClick={next}>I Understand</button>
    </div>
  );

  if (STEPS[step] === 'theme') return (
    <div style={s}>
      <div style={center}>
        <h2 style={{ fontSize: 28, fontWeight: 300, letterSpacing: 2, color: 'var(--accent)', textAlign: 'center', marginBottom: 8 }}>Pick your look</h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 28 }}>You can change this anytime in Settings</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Object.entries(availableThemes).map(([key, t]) => (
            <div key={key} onClick={() => switchTheme(key)} style={{ borderRadius: 16, padding: 20, border: `${currentTheme === key ? 2 : 1}px solid ${currentTheme === key ? t.accent : t.border}`, background: t.bg, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18, fontWeight: 300, letterSpacing: 6, color: t.accent }}>{t.name}</span>
              <div style={{ width: 40, height: 2, borderRadius: 1, background: t.accent }} />
            </div>
          ))}
        </div>
      </div>
      <button className="btn-primary" onClick={next} style={{ marginTop: 24 }}>Continue</button>
    </div>
  );

  if (STEPS[step] === 'complete') return (
    <div style={s}>
      <div style={center}>
        <div style={{ fontSize: 56, textAlign: 'center', marginBottom: 16, color: '#22c55e' }}>✓</div>
        <h2 style={{ fontSize: 28, fontWeight: 300, letterSpacing: 2, color: 'var(--accent)', textAlign: 'center', marginBottom: 16 }}>You're all set.</h2>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)', textAlign: 'center', fontWeight: 300, marginBottom: 28 }}>Vega is ready. I've added a few sample items so you can see how everything works.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {['Tasks with priorities and recurrence', 'Daily and weekly schedule management', 'Voice briefings and reminders', 'Everything stays in your browser only'].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: '#22c55e', fontSize: 14 }}>✓</span>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{f}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24, padding: 16, borderRadius: 14, border: '1px solid var(--border)', background: 'var(--surface)' }}>
          <p style={{ fontSize: 11, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Quick tip</p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>Tap the microphone on the dashboard and say "Hey Vega, brief me" to get your daily summary.</p>
        </div>
      </div>
      <button className="btn-primary" onClick={finish}>Start using Vega</button>
    </div>
  );
}
