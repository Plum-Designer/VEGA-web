'use client';
import { useState } from 'react';
import { useData, RECURRENCE_TYPES } from '../contexts/DataContext';

const TYPE_COLORS = { personal: '#8b5cf6', work: '#3b82f6', health: '#22c55e', social: '#f59e0b', family: '#ef4444' };
const EVENT_TYPES = ['personal', 'work', 'health', 'social', 'family'];

export default function Schedule() {
  const { schedule, addEvent, deleteEvent, getEventsForDate } = useData();
  const [view, setView] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('');
  const [type, setType] = useState('personal');
  const [recurrenceType, setRecurrenceType] = useState('none');

  const fmt = d => d.toISOString().split('T')[0];
  const today = fmt(new Date());
  const events = getEventsForDate(fmt(selectedDate));

  const addDays = n => { const d = new Date(selectedDate); d.setDate(d.getDate() + n); setSelectedDate(d); };

  const handleAdd = () => {
    if (!title.trim()) return;
    addEvent({ title: title.trim(), date: fmt(selectedDate), time, duration, type, recurrence: { type: recurrenceType, startDate: fmt(selectedDate) } });
    setTitle(''); setTime(''); setDuration(''); setType('personal'); setRecurrenceType('none'); setShowAdd(false);
  };

  const getWeekDays = () => {
    const start = new Date(selectedDate);
    start.setDate(selectedDate.getDate() - selectedDate.getDay());
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  };

  const getMonthDays = () => {
    const year = selectedDate.getFullYear(), month = selectedDate.getMonth();
    const first = new Date(year, month, 1);
    const start = new Date(first);
    start.setDate(start.getDate() - first.getDay());
    return Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  };

  return (
    <div className="screen">
      <div className="page-header">
        <h1 className="page-title">Schedule</h1>
        <button onClick={() => setShowAdd(true)} style={{ width: 40, height: 40, borderRadius: 20, background: 'var(--accent)', border: 'none', fontSize: 22, color: 'var(--bg)', cursor: 'pointer' }}>+</button>
      </div>

      <div className="filter-tabs">
        {['daily', 'weekly', 'monthly'].map(v => (
          <button key={v} className={`filter-tab ${view === v ? 'active' : ''}`} onClick={() => setView(v)}>
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      {view === 'daily' && (
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <button onClick={() => addDays(-1)} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 20, cursor: 'pointer', padding: '0 8px' }}>‹</button>
            <div style={{ flex: 1, textAlign: 'center', fontSize: 14, color: 'var(--text)' }}>{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
            <button onClick={() => addDays(1)} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 20, cursor: 'pointer', padding: '0 8px' }}>›</button>
          </div>
          {events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📅</div>
              <p>No events this day</p>
              <button onClick={() => setShowAdd(true)} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 20, border: '1px solid var(--accent)', background: 'transparent', color: 'var(--accent)', cursor: 'pointer', fontSize: 13 }}>+ Add event</button>
            </div>
          ) : events.map(event => (
            <div key={event.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 14, marginBottom: 10 }}>
              <div style={{ width: 3, height: 44, borderRadius: 2, background: TYPE_COLORS[event.type] || 'var(--accent)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 300, marginBottom: 4 }}>{event.title}</div>
                <div style={{ display: 'flex', gap: 8, fontSize: 11 }}>
                  {event.time && <span style={{ color: 'var(--accent)', fontWeight: 500 }}>{event.time}</span>}
                  {event.duration && <span style={{ color: 'var(--text-secondary)' }}>{event.duration}</span>}
                  <span style={{ color: TYPE_COLORS[event.type], textTransform: 'uppercase', letterSpacing: '0.3px' }}>{event.type}</span>
                  {event.recurrence?.type !== 'none' && <span style={{ color: '#22c55e' }}>↻</span>}
                </div>
              </div>
              <button onClick={() => { if (confirm(`Delete "${event.title}"?`)) deleteEvent(event.id); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 16 }}>×</button>
            </div>
          ))}
        </div>
      )}

      {view === 'weekly' && (
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 16 }}>
            {getWeekDays().map((day, i) => {
              const dayEvents = getEventsForDate(fmt(day));
              const isToday = fmt(day) === today;
              const isSel = fmt(day) === fmt(selectedDate);
              return (
                <div key={i} onClick={() => { setSelectedDate(day); setView('daily'); }} style={{ background: 'var(--surface)', border: `${isSel ? 2 : 1}px solid ${isSel ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 10, padding: '8px 4px', textAlign: 'center', cursor: 'pointer' }}>
                  <div style={{ fontSize: 9, color: isToday ? 'var(--accent)' : 'var(--text-secondary)', marginBottom: 4 }}>{'SMTWTFS'[i]}</div>
                  <div style={{ fontSize: 15, color: isToday ? 'var(--accent)' : 'var(--text)', fontWeight: isToday ? 600 : 400 }}>{day.getDate()}</div>
                  <div style={{ display: 'flex', gap: 2, justifyContent: 'center', marginTop: 4 }}>
                    {dayEvents.slice(0, 3).map((e, j) => <div key={j} style={{ width: 4, height: 4, borderRadius: 2, background: TYPE_COLORS[e.type] || 'var(--accent)' }} />)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === 'monthly' && (
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
            <button onClick={() => { const d = new Date(selectedDate); d.setMonth(d.getMonth()-1); setSelectedDate(d); }} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 20, cursor: 'pointer' }}>‹</button>
            <div style={{ flex: 1, textAlign: 'center', fontSize: 14, color: 'var(--text)' }}>{selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
            <button onClick={() => { const d = new Date(selectedDate); d.setMonth(d.getMonth()+1); setSelectedDate(d); }} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 20, cursor: 'pointer' }}>›</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
            {'SMTWTFS'.split('').map((d, i) => <div key={i} style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-secondary)', padding: '4px 0' }}>{d}</div>)}
            {getMonthDays().map((day, i) => {
              const inMonth = day.getMonth() === selectedDate.getMonth();
              const isToday = fmt(day) === today;
              const isSel = fmt(day) === fmt(selectedDate);
              const hasEvents = getEventsForDate(fmt(day)).length > 0;
              return (
                <div key={i} onClick={() => { setSelectedDate(day); setView('daily'); }} style={{ aspectRatio: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: isSel ? 'var(--accent)' : 'transparent', cursor: 'pointer', opacity: inMonth ? 1 : 0.25 }}>
                  <span style={{ fontSize: 13, color: isSel ? 'var(--bg)' : isToday ? 'var(--accent)' : 'var(--text)', fontWeight: isToday ? 600 : 400 }}>{day.getDate()}</span>
                  {hasEvents && inMonth && !isSel && <div style={{ width: 4, height: 4, borderRadius: 2, background: 'var(--accent)', marginTop: 2 }} />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)', borderRadius: '24px 24px 0 0', padding: 24, paddingBottom: 'calc(24px + env(safe-area-inset-bottom))', width: '100%', maxWidth: 480, margin: '0 auto' }}>
            <h2 style={{ fontSize: 20, fontWeight: 200, letterSpacing: 3, color: 'var(--accent)', marginBottom: 4 }}>New Event</h2>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <input className="input" placeholder="Event title" value={title} onChange={e => setTitle(e.target.value)} autoFocus style={{ marginBottom: 12 }} onKeyDown={e => e.key === 'Enter' && handleAdd()} />
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input className="input" placeholder="Time (9:00 AM)" value={time} onChange={e => setTime(e.target.value)} style={{ flex: 1 }} />
              <input className="input" placeholder="Duration" value={duration} onChange={e => setDuration(e.target.value)} style={{ flex: 1 }} />
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
              {EVENT_TYPES.map(t => (
                <button key={t} onClick={() => setType(t)} style={{ padding: '6px 12px', borderRadius: 20, border: `1px solid ${type === t ? TYPE_COLORS[t] : 'var(--border)'}`, background: type === t ? `${TYPE_COLORS[t]}20` : 'var(--surface)', color: type === t ? TYPE_COLORS[t] : 'var(--text-secondary)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 3, background: TYPE_COLORS[t] }} />
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <select value={recurrenceType} onChange={e => setRecurrenceType(e.target.value)} className="input" style={{ marginBottom: 20 }}>
              <option value="none">Does not repeat</option>
              <option value="daily">Every day</option>
              <option value="weekdays">Weekdays only</option>
              <option value="weekly">Every week</option>
              <option value="monthly">Every month</option>
            </select>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleAdd} disabled={!title.trim()}>Add Event</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
