'use client';
import { ThemeProvider } from '../contexts/ThemeContext';
import { DataProvider } from '../contexts/DataContext';
import { VoiceProvider } from '../contexts/VoiceContext';

export function Providers({ children }) {
  return (
    <ThemeProvider>
      <DataProvider>
        <VoiceProvider>
          {children}
        </VoiceProvider>
      </DataProvider>
    </ThemeProvider>
  );
}
