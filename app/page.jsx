'use client';
import { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import Dashboard from '../components/Dashboard';
import Tasks from '../components/Tasks';
import Schedule from '../components/Schedule';
import Settings from '../components/Settings';
import Onboarding from '../components/Onboarding';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '⌂' },
  { id: 'tasks', label: 'Tasks', icon: '☑' },
  { id: 'schedule', label: 'Schedule', icon: '📅' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
];

export default function Home() {
  const { isLoaded, preferences } = useData();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    const done = localStorage.getItem('vega_onboarding_complete');
    setOnboardingDone(!!done);
    setChecked(true);
  }, [isLoaded]);

  if (!checked) return <div style={{ background: '#000', height: '100dvh' }} />;

  if (!onboardingDone) {
    return <Onboarding onComplete={() => setOnboardingDone(true)} />;
  }

  const screens = { dashboard: <Dashboard onNavigate={setActiveTab} />, tasks: <Tasks />, schedule: <Schedule />, settings: <Settings /> };

  return (
    <div className="app-shell">
      <div className="scroll-area">
        {screens[activeTab]}
      </div>
      <nav className="tab-bar">
        {TABS.map(tab => (
          <button key={tab.id} className="tab-item" onClick={() => setActiveTab(tab.id)}>
            <div className={`tab-icon ${activeTab === tab.id ? 'active' : ''}`}>{tab.icon}</div>
            <span className={`tab-label ${activeTab === tab.id ? 'active' : ''}`}>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
