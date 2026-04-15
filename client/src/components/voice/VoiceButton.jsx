import React, { useState, useCallback } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { isVoiceSupported, createRecognizer } from '../../engine/voiceEngine';
import { useUiStore } from '../../store/uiStore';

export function VoiceButton({ onCommand, mode = 'edit', size = 56, style: styleProp }) {
  const [listening, setListening] = useState(false);
  const setVoiceActive = useUiStore((s) => s.setVoiceActive);
  const setLastVoiceCommand = useUiStore((s) => s.setLastVoiceCommand);

  const handleStart = useCallback(() => {
    const recognizer = createRecognizer(
      (transcript, isFinal) => {
        if (isFinal !== false) {
          setListening(false);
          setVoiceActive(false);
          setLastVoiceCommand(transcript);
          if (onCommand) onCommand(transcript);
        }
      },
      (err) => {
        console.error('Voice error:', err);
        setListening(false);
        setVoiceActive(false);
      },
      { onEnd: () => { setListening(false); setVoiceActive(false); } }
    );
    if (recognizer) {
      setListening(true);
      setVoiceActive(true);
      recognizer.start();
    }
  }, [onCommand, setVoiceActive, setLastVoiceCommand]);

  if (!isVoiceSupported()) return null;

  const isSmall = size < 48;

  return (
    <button
      onClick={listening ? undefined : handleStart}
      aria-label={listening ? 'Listening...' : `Voice ${mode === 'intent' ? 'input' : 'command'}`}
      title={listening ? 'Listening...' : mode === 'intent' ? 'Speak your presentation idea' : 'Voice command'}
      style={{
        width: `${size}px`, height: `${size}px`, borderRadius: '50%',
        background: listening ? 'var(--color-error)' : 'var(--color-primary)',
        color: '#fff', border: 'none', cursor: 'pointer',
        boxShadow: isSmall ? 'var(--shadow-md)' : 'var(--shadow-lg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: listening ? 'pulse 1.5s infinite' : 'none',
        transition: 'var(--transition-fast)',
        flexShrink: 0,
        ...styleProp,
      }}
    >
      {listening ? <MicOff size={size * 0.4} /> : <Mic size={size * 0.4} />}
      <style>{`@keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); } 50% { box-shadow: 0 0 0 12px rgba(239,68,68,0); } }`}</style>
    </button>
  );
}
