import { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useTelegram } from '../hooks/useTelegram';

interface VoiceSearchProps {
  onResult: (transcript: string) => void;
  placeholder?: string;
  className?: string;
}

export function VoiceSearch({ onResult, placeholder = "Поиск по голосу...", className = '' }: VoiceSearchProps) {
  const { hapticFeedback } = useTelegram();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  // Check Web Speech API support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'ru-RU';
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const result = event.results[current];
        const transcriptText = result[0].transcript;
        
        setTranscript(transcriptText);
        
        // Final result
        if (result.isFinal) {
          hapticFeedback.medium();
          onResult(transcriptText);
          setIsListening(false);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        hapticFeedback.heavy();
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onResult, hapticFeedback]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    
    hapticFeedback.light();
    setTranscript('');
    setIsListening(true);
    
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      setIsListening(false);
    }
  }, [isListening, hapticFeedback]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;
    
    hapticFeedback.light();
    recognitionRef.current.stop();
    setIsListening(false);
  }, [isListening, hapticFeedback]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  if (!isSupported) {
    return null; // Don't show if not supported
  }

  return (
    <button
      onClick={toggleListening}
      disabled={!isSupported}
      className={`relative group ${className}`}
      data-testid="button-voice-search"
      aria-label={isListening ? "Остановить голосовой поиск" : "Начать голосовой поиск"}
      aria-pressed={isListening}
      role="button"
      tabIndex={0}
    >
      <div className={`
        relative flex items-center justify-center
        w-12 h-12 rounded-full
        transition-all duration-300
        ${isListening 
          ? 'bg-emerald-500 scale-110 shadow-lg shadow-emerald-500/50' 
          : 'bg-white/10 hover:bg-white/15 backdrop-blur-xl'
        }
      `}>
        {isListening ? (
          <>
            {/* Pulsing animation */}
            <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
            <MicOff className="relative w-5 h-5 text-white z-10" />
          </>
        ) : (
          <Mic className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Transcript display */}
      {isListening && transcript && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <div className="bg-black/80 backdrop-blur-xl rounded-lg px-4 py-2 border border-white/20">
            <p className="text-sm text-white font-medium">{transcript}</p>
          </div>
        </div>
      )}

      {/* Listening indicator */}
      {isListening && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      )}
    </button>
  );
}
