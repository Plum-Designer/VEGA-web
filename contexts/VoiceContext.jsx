'use client';
import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

const VoiceContext = createContext(null);
export const useVoice = () => useContext(VoiceContext);

const WAKE_WORDS = ['hey vega', 'vega', 'ok vega', 'okay vega'];

const VOICE_PROFILES = {
  executive: { name: 'Executive', rate: 0.88, pitch: 0.88, preferred: ['Samantha', 'Karen', 'Moira', 'Tessa', 'Nicky', 'Ava'], fallbackLang: 'en-US' },
  aria: { name: 'Aria', rate: 0.92, pitch: 0.95, preferred: ['Ava', 'Samantha', 'Karen', 'Allison'], fallbackLang: 'en-US' },
  nova: { name: 'Nova', rate: 0.85, pitch: 0.90, preferred: ['Karen', 'Moira', 'Veena', 'Tessa'], fallbackLang: 'en-AU' },
  sterling: { name: 'Sterling', rate: 0.88, pitch: 0.78, preferred: ['Daniel', 'Arthur', 'Alex', 'Oliver'], fallbackLang: 'en-GB' },
};

const chunkText = (text) => (text.match(/[^.!?]+[.!?]+[\s]*/g) || [text]).map(s => s.trim()).filter(Boolean);
const COMMA_PAUSE = 120;
const SENTENCE_PAUSE = 280;

export const VoiceProvider = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceId, setVoiceId] = useState('executive');
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const recognitionRef = useRef(null);
  const isCancelledRef = useRef(false);

  useEffect(() => {
    const load = () => {
      const voices = window.speechSynthesis?.getVoices() || [];
      if (voices.length > 0) { setAvailableVoices(voices); }
    };
    load();
    window.speechSynthesis?.addEventListener('voiceschanged', load);
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', load);
  }, []);

  useEffect(() => {
    if (availableVoices.length > 0) setSelectedVoice(pickVoice(availableVoices, voiceId));
  }, [voiceId, availableVoices]);

  const pickVoice = (voices, profileId) => {
    const p = VOICE_PROFILES[profileId] || VOICE_PROFILES.executive;
    for (const name of p.preferred) {
      const m = voices.find(v => v.name.includes(name) && v.lang.startsWith('en'));
      if (m) return m;
    }
    return voices.find(v => v.lang === p.fallbackLang) || voices.find(v => v.lang.startsWith('en')) || voices[0];
  };

  const speakChunk = (text, voice, profile) => new Promise(resolve => {
    if (isCancelledRef.current) { resolve(); return; }
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = profile.rate; utt.pitch = profile.pitch; utt.volume = 1;
    if (voice) utt.voice = voice;
    utt.onend = resolve; utt.onerror = resolve;
    window.speechSynthesis.speak(utt);
  });

  const pause = ms => new Promise(r => setTimeout(r, ms));

  const speak = useCallback(async (text, onEnd) => {
    if (!window.speechSynthesis) return;
    isCancelledRef.current = true;
    window.speechSynthesis.cancel();
    await pause(80);
    isCancelledRef.current = false;
    setIsSpeaking(true);

    const profile = VOICE_PROFILES[voiceId] || VOICE_PROFILES.executive;
    const voice = selectedVoice || pickVoice(availableVoices, voiceId);
    const chunks = chunkText(text);

    try {
      for (let i = 0; i < chunks.length; i++) {
        if (isCancelledRef.current) break;
        const parts = chunks[i].split(/,\s+/);
        for (let j = 0; j < parts.length; j++) {
          if (isCancelledRef.current) break;
          if (parts[j].trim()) {
            await speakChunk(parts[j] + (j < parts.length - 1 ? ',' : ''), voice, profile);
            if (j < parts.length - 1) await pause(COMMA_PAUSE);
          }
        }
        if (i < chunks.length - 1 && !isCancelledRef.current) await pause(SENTENCE_PAUSE);
      }
    } finally {
      if (!isCancelledRef.current) { setIsSpeaking(false); if (onEnd) onEnd(); }
    }
  }, [selectedVoice, availableVoices, voiceId]);

  const stopSpeaking = useCallback(() => {
    isCancelledRef.current = true;
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  const startListening = useCallback((onCommand) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice recognition requires Chrome or Safari.'); return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = false; recognition.interimResults = true; recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join('').toLowerCase().trim();
      setTranscript(t);
      if (e.results[e.results.length - 1].isFinal) {
        let command = t;
        for (const w of WAKE_WORDS) command = command.replace(w, '').trim();
        if (onCommand && command) onCommand(command);
        setTranscript('');
      }
    };
    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopListening = useCallback(() => { recognitionRef.current?.stop(); setIsListening(false); }, []);

  const previewVoice = useCallback((profileId) => {
    const voices = window.speechSynthesis?.getVoices() || [];
    const voice = pickVoice(voices, profileId);
    const profile = VOICE_PROFILES[profileId];
    const utt = new SpeechSynthesisUtterance('Good morning. You have three tasks pending today.');
    utt.rate = profile.rate; utt.pitch = profile.pitch;
    if (voice) utt.voice = voice;
    window.speechSynthesis?.cancel();
    window.speechSynthesis?.speak(utt);
  }, []);

  return (
    <VoiceContext.Provider value={{ isListening, isSpeaking, transcript, voiceId, setVoiceId, availableVoices, selectedVoice, speak, stopSpeaking, startListening, stopListening, previewVoice, voiceProfiles: VOICE_PROFILES }}>
      {children}
    </VoiceContext.Provider>
  );
};
