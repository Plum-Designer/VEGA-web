'use client';
import { createContext, useContext, useState, useRef, useCallback } from 'react';

const VoiceContext = createContext(null);
export const useVoice = () => useContext(VoiceContext);

const WAKE_WORDS = ['hey vega', 'vega', 'ok vega', 'okay vega'];

export const VoiceProvider = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceId, setVoiceId] = useState('executive');
  const recognitionRef = useRef(null);
  const onCommandRef = useRef(null);

  const getVoice = () => {
    const voices = window.speechSynthesis?.getVoices() || [];
    const prefs = { executive: ['Samantha', 'Karen', 'Moira'], aria: ['Ava', 'Samantha'], nova: ['Karen', 'Moira'], sterling: ['Daniel', 'Alex'] };
    const preferred = prefs[voiceId] || prefs.executive;
    for (const name of preferred) {
      const v = voices.find(v => v.name.includes(name));
      if (v) return v;
    }
    return voices.find(v => v.lang === 'en-US') || voices[0];
  };

  const speak = useCallback((text, onEnd) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.92; utt.pitch = voiceId === 'sterling' ? 0.8 : 0.9; utt.volume = 1;
    const voice = getVoice();
    if (voice) utt.voice = voice;
    setIsSpeaking(true);
    utt.onend = () => { setIsSpeaking(false); if (onEnd) onEnd(); };
    utt.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utt);
  }, [voiceId]);

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  const startListening = useCallback((onCommand) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice recognition is not supported in this browser. Try Chrome or Safari.');
      return;
    }
    onCommandRef.current = onCommand;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join('').toLowerCase();
      setTranscript(t);
      if (e.results[e.results.length - 1].isFinal) {
        const cleaned = WAKE_WORDS.reduce((s, w) => s.replace(w, '').trim(), t);
        if (onCommandRef.current && cleaned) onCommandRef.current(cleaned);
      }
    };
    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return (
    <VoiceContext.Provider value={{ isListening, isSpeaking, transcript, voiceId, setVoiceId, speak, stopSpeaking, startListening, stopListening }}>
      {children}
    </VoiceContext.Provider>
  );
};
