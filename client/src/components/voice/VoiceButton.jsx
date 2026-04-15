import React, { useState, useCallback } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { isVoiceSupported, createRecognizer } from '../../engine/voiceEngine';
import { useUiStore } from '../../store/uiStore';

export function VoiceButton({ onCommand }) {
  const [listening, setListening] = useState(false);
  const isVoiceActive = useUiStore((s) => s.isVoiceActive);
  const setVoiceActive = useUiStore((s) => s.setVoiceActive);
  const setLastVoiceCommand = useUiStore((s) => s.setLastVoiceCommand);

  const handleStart = useCallback(() => {
    const recognizer = createRecognizer(
      (transcript) => {
        setListening(false);
        setVoiceActive(false);
        setLastVoiceCommand(transcript);
        if (onCommand) onCommand(transcript);
      },
      () => { setListening(false); setVoiceActive(false); }
    );
    if (recognizer) {
      setListening(true);
      setVoiceActive(true);
      recognizer.start();
    }
  }, [onCommand, setVoiceActive, setLastVoiceCommand]);

  if (!isVoiceSupported()) return null;

  return (
    <button
      onClick={listening ? undefined : handleStart}
      aria-label={listening ? 'Listening...' : 'Voice command'}
      style={{
        position: 'fixed', bottom: '24px', right: '24px', zIndex: 100,
        width: '56px', height: '56px', borderRadius: '50%',
        background: listening ? 'var(--color-error)' : 'var(--color-primary)',
        color: '#fff', border: 'none', cursor: 'pointer',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: listening ? 'pulse 1.5s infinite' : 'none',
      }}
    >
      {listening ? <MicOff size={24} /> : <Mic size={24} />}
      <style>{`@keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); } 50% { box-shadow: 0 0 0 12px rgba(239,68,68,0); } }`}</style>
    </button>
  );
}
