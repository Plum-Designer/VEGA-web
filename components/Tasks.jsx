'use client';
import { useState } from 'react';
import { useData, RECURRENCE_TYPES, formatRecurrenceLabel } from '../contexts/DataContext';

const PRIORITY_COLORS = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' };
const CATEGORIES = ['general', 'work', 'personal', 'health', 'finance'];

export default function Tasks() {
  const { tasks, addTask, toggleTask, deleteTask } = useData();
  const [filter, setFilter] = useState('pending');
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('general');
  const [recurrenceType, setRecurrenceType] = useState('none');

  const today = new Date().toISOString().split('T')[0];
  const filtered = tasks.filter(t => filter === 'all' ? true : filter === 'pending' ? !t.completed : t.completed);

  const handleAdd = () => {
    if (!title.trim()) return;
    addTask({ title: title.trim(), priority, dueDate: dueDate || null, category, recurrence: { type: recurrenceType, startDate: today } });
    setTitle(''); setPriority('medium'); setDueDate(''); setCategory('general'); setRecurrenceType('none'); setShowAdd(false);
  };

  return (
    <div className="screen">
      <div className="page-header">
        <h1 className="page-title">Tasks</h1>
        <button onClick={() => setShowAdd(true)} style={{ width: 40, height: 40, borderRadius: 20, background: 'var(--accent)', border: 'none', fontSize: 22, color: 'var(--bg)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
      </div>

      <div className="filter-tabs">
        {['pending', 'all', 'done'].map(f => (
          <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ padding: '0 16px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
            <p>{filter === 'pending' ? 'No pending tasks' : 'Nothing here'}</p>
          </div>
        ) : filtered.map(task => {
          const isOverdue = !task.completed && task.dueDate && task.dueDate < today;
          const recLabel = formatRecurrenceLabel(task.recurrence);
          return (
            <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 14, marginBottom: 10, opacity: task.completed ? 0.5 : 1 }}>
              <button onClick={() => toggleTask(task.id)} style={{ width: 22, height: 22, borderRadius: 11, border: `1.5px solid var(--accent)`, background: task.completed ? 'var(--accent)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {task.completed && <span style={{ color: 'var(--bg)', fontSize: 12 }}>✓</span>}
              </button>
              <div style={{ width: 3, height: 36, borderRadius: 2, background: PRIORITY_COLORS[task.priority], flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 300, textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? 'var(--text-secondary)' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{task.category}</span>
                  {task.dueDate && <span style={{ fontSize: 10, color: isOverdue ? '#ef4444' : 'var(--text-secondary)' }}>{isOverdue ? '⚠ ' : ''}{task.dueDate}</span>}
                  {recLabel && <span style={{ fontSize: 10, color: '#22c55e' }}>↻ {recLabel}</span>}
                </div>
              </div>
              <button onClick={() => { if (confirm(`Delete "${task.title}"?`)) deleteTask(task.id); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4, fontSize: 14 }}>🗑</button>
            </div>
          );
        })}
      </div>

      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)', borderRadius: '24px 24px 0 0', padding: 24, paddingBottom: 'calc(24px + env(safe-area-inset-bottom))', width: '100%', maxWidth: 480, margin: '0 auto' }}>
            <h2 style={{ fontSize: 20, fontWeight: 200, letterSpacing: 3, color: 'var(--accent)', marginBottom: 20 }}>New Task</h2>
            <input className="input" placeholder="What needs to be done?" value={title} onChange={e => setTitle(e.target.value)} autoFocus style={{ marginBottom: 16 }} onKeyDown={e => e.key === 'Enter' && handleAdd()} />

            <p style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Priority</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {['low', 'medium', 'high'].map(p => (
                <button key={p} onClick={() => setPriority(p)} style={{ flex: 1, padding: '8px 0', borderRadius: 20, border: `1px solid ${priority === p ? PRIORITY_COLORS[p] : 'var(--border)'}`, background: priority === p ? `${PRIORITY_COLORS[p]}20` : 'var(--surface)', color: priority === p ? PRIORITY_COLORS[p] : 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>

            <p style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Category</p>
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)} style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${category === c ? 'var(--accent)' : 'var(--border)'}`, background: category === c ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'var(--surface)', color: category === c ? 'var(--accent)' : 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' }}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>

            <p style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Repeat</p>
            <select value={recurrenceType} onChange={e => setRecurrenceType(e.target.value)} className="input" style={{ marginBottom: 16 }}>
              <option value="none">Does not repeat</option>
              <option value="daily">Every day</option>
              <option value="weekdays">Weekdays only</option>
              <option value="weekly">Every week</option>
              <option value="monthly">Every month</option>
            </select>

            <p style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Due Date</p>
            <input className="input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ marginBottom: 20 }} />

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleAdd} disabled={!title.trim()}>Add Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
