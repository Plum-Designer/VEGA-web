'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext(null);

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};

export const RECURRENCE_TYPES = {
  NONE: 'none', DAILY: 'daily', WEEKDAYS: 'weekdays',
  WEEKLY: 'weekly', BIWEEKLY: 'biweekly', MONTHLY: 'monthly',
  CUSTOM_DAYS: 'custom_days', CUSTOM_WEEKDAYS: 'custom_weekdays',
};

export const RECURRENCE_LABELS = {
  none: 'Does not repeat', daily: 'Every day', weekdays: 'Weekdays only',
  weekly: 'Every week', biweekly: 'Every 2 weeks', monthly: 'Every month',
  custom_days: 'Every X days', custom_weekdays: 'Specific days',
};

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const shouldAppearOn = (item, dateStr) => {
  const r = item.recurrence;
  if (!r || r.type === RECURRENCE_TYPES.NONE) return item.dueDate === dateStr || item.date === dateStr;
  const startDate = new Date(r.startDate || item.dueDate || item.date);
  const checkDate = new Date(dateStr);
  if (checkDate < startDate) return false;
  if (r.endDate && checkDate > new Date(r.endDate)) return false;
  const dayOfWeek = checkDate.getDay();
  const diffDays = Math.round((checkDate - startDate) / (1000 * 60 * 60 * 24));
  switch (r.type) {
    case RECURRENCE_TYPES.DAILY: return true;
    case RECURRENCE_TYPES.WEEKDAYS: return dayOfWeek >= 1 && dayOfWeek <= 5;
    case RECURRENCE_TYPES.WEEKLY: return diffDays % 7 === 0;
    case RECURRENCE_TYPES.BIWEEKLY: return diffDays % 14 === 0;
    case RECURRENCE_TYPES.MONTHLY: return checkDate.getDate() === startDate.getDate();
    case RECURRENCE_TYPES.CUSTOM_DAYS: return diffDays % (r.interval || 1) === 0;
    case RECURRENCE_TYPES.CUSTOM_WEEKDAYS: return (r.weekdays || []).includes(dayOfWeek);
    default: return false;
  }
};

export const formatRecurrenceLabel = (recurrence) => {
  if (!recurrence || recurrence.type === RECURRENCE_TYPES.NONE) return null;
  switch (recurrence.type) {
    case RECURRENCE_TYPES.DAILY: return 'Daily';
    case RECURRENCE_TYPES.WEEKDAYS: return 'Weekdays';
    case RECURRENCE_TYPES.WEEKLY: return 'Weekly';
    case RECURRENCE_TYPES.BIWEEKLY: return 'Every 2 weeks';
    case RECURRENCE_TYPES.MONTHLY: return 'Monthly';
    case RECURRENCE_TYPES.CUSTOM_DAYS: return `Every ${recurrence.interval} days`;
    case RECURRENCE_TYPES.CUSTOM_WEEKDAYS: return (recurrence.weekdays || []).map(d => WEEKDAY_LABELS[d]).join(', ');
    default: return null;
  }
};

const save = (key, data) => {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) {}
};

const load = (key) => {
  try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : null; } catch { return null; }
};

export const DataProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [preferences, setPreferences] = useState({ userName: '', theme: 'midnight', calendarProvider: 'none' });
  const [completedRecurrences, setCompletedRecurrences] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setTasks(load('vega_tasks') || []);
    setSchedule(load('vega_schedule') || []);
    setPreferences(load('vega_preferences') || { userName: '', theme: 'midnight', calendarProvider: 'none' });
    setCompletedRecurrences(load('vega_completed_recurrences') || {});
    setIsLoaded(true);
  }, []);

  const addTask = (task) => {
    const t = { id: Date.now().toString(), title: task.title || '', completed: false, priority: task.priority || 'medium', dueDate: task.dueDate || null, category: task.category || 'general', recurrence: task.recurrence || { type: RECURRENCE_TYPES.NONE }, notes: task.notes || '', createdAt: new Date().toISOString(), isSample: task.isSample || false };
    const updated = [t, ...tasks];
    setTasks(updated); save('vega_tasks', updated);
    return t;
  };

  const toggleTask = (id, dateStr = null) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    if (task.recurrence?.type !== RECURRENCE_TYPES.NONE && dateStr) {
      const key = `${id}_${dateStr}`;
      const updated = { ...completedRecurrences };
      if (updated[key]) delete updated[key]; else updated[key] = true;
      setCompletedRecurrences(updated); save('vega_completed_recurrences', updated);
    } else {
      const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : null } : t);
      setTasks(updated); save('vega_tasks', updated);
    }
  };

  const deleteTask = (id) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated); save('vega_tasks', updated);
  };

  const updateTask = (id, changes) => {
    const updated = tasks.map(t => t.id === id ? { ...t, ...changes } : t);
    setTasks(updated); save('vega_tasks', updated);
  };

  const isTaskCompletedOn = (taskId, dateStr) => !!completedRecurrences[`${taskId}_${dateStr}`];

  const getTasksForDate = (dateStr) => tasks.filter(t => t.recurrence?.type === RECURRENCE_TYPES.NONE ? t.dueDate === dateStr : shouldAppearOn(t, dateStr));

  const addEvent = (event) => {
    const e = { id: Date.now().toString(), title: event.title || '', date: event.date || new Date().toISOString().split('T')[0], time: event.time || '', duration: event.duration || '', type: event.type || 'personal', recurrence: event.recurrence || { type: RECURRENCE_TYPES.NONE }, notes: event.notes || '', isSample: event.isSample || false, createdAt: new Date().toISOString() };
    const updated = [e, ...schedule];
    setSchedule(updated); save('vega_schedule', updated);
    return e;
  };

  const deleteEvent = (id) => {
    const updated = schedule.filter(e => e.id !== id);
    setSchedule(updated); save('vega_schedule', updated);
  };

  const getEventsForDate = (dateStr) => schedule.filter(e => shouldAppearOn(e, dateStr)).sort((a, b) => a.time.localeCompare(b.time));

  const getTodaysEvents = () => getEventsForDate(new Date().toISOString().split('T')[0]);

  const search = (query) => {
    if (!query.trim()) return { tasks: [], events: [] };
    const q = query.toLowerCase();
    return {
      tasks: tasks.filter(t => t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)),
      events: schedule.filter(e => e.title.toLowerCase().includes(q) || e.type.toLowerCase().includes(q)),
    };
  };

  const getCompletionRate = () => {
    const nr = tasks.filter(t => t.recurrence?.type === RECURRENCE_TYPES.NONE);
    if (!nr.length) return 0;
    return Math.round((nr.filter(t => t.completed).length / nr.length) * 100);
  };

  const getPendingCount = () => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(t => t.recurrence?.type !== RECURRENCE_TYPES.NONE ? shouldAppearOn(t, today) && !isTaskCompletedOn(t.id, today) : !t.completed).length;
  };

  const getOverdueTasks = () => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(t => !t.completed && t.dueDate && t.dueDate < today && t.recurrence?.type === RECURRENCE_TYPES.NONE);
  };

  const exportData = () => JSON.stringify({ exportDate: new Date().toISOString(), version: '2.0', tasks, schedule, preferences }, null, 2);

  const updatePreferences = (changes) => {
    const updated = { ...preferences, ...changes };
    setPreferences(updated); save('vega_preferences', updated);
  };

  return (
    <DataContext.Provider value={{ tasks, schedule, preferences, isLoaded, addTask, toggleTask, deleteTask, updateTask, isTaskCompletedOn, getTasksForDate, addEvent, deleteEvent, getEventsForDate, getTodaysEvents, search, updatePreferences, getCompletionRate, getPendingCount, getOverdueTasks, exportData }}>
      {children}
    </DataContext.Provider>
  );
};
