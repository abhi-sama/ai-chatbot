'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { UseVoiceInputReturn } from '@/types/chatqa';

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
    SpeechRecognition: new () => SpeechRecognition;
  }
}

export function useVoiceInput(): UseVoiceInputReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check support on mount
  useEffect(() => {
    const supported =
      typeof window !== 'undefined' &&
      ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    setIsSupported(supported);
  }, []);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const stopListening = useCallback(() => {
    clearSilenceTimer();
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, [clearSilenceTimer]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    setError(null);
    setTranscript('');

    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      clearSilenceTimer();

      // Only process NEW results from resultIndex onward to avoid duplicates
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          // Append only the new finalized text
          const finalText = result[0].transcript;
          setTranscript((prev) => prev + finalText);
        }
        // Ignore interim results — they change constantly and cause duplication
      }

      // Auto-stop after 3 seconds of silence
      silenceTimerRef.current = setTimeout(() => {
        stopListening();
      }, 3000);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      clearSilenceTimer();

      switch (event.error) {
        case 'not-allowed':
          setError('Microphone access denied. Please allow microphone permissions.');
          break;
        case 'no-speech':
          setError('No speech detected. Please try again.');
          break;
        case 'network':
          setError('Network error. Please check your connection.');
          break;
        default:
          setError(`Speech recognition error: ${event.error}`);
      }

      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      clearSilenceTimer();
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      setError('Failed to start speech recognition.');
      setIsListening(false);
    }
  }, [isSupported, clearSilenceTimer, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearSilenceTimer();
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [clearSilenceTimer]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported,
    error,
  };
}
