import React from 'react';
import { useDeckStore } from '../../store/deckStore';

export function WatermarkOverlay() {
  const userTier = useDeckStore((s) => s.userTier);

  // Premium users: no watermark
  if (userTier === 'premium') return null;

  return (
    <div style={{
      position: 'absolute', bottom: '12px', right: '16px', zIndex: 100,
      pointerEvents: 'none', userSelect: 'none',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        background: 'rgba(0,0,0,0.06)', backdropFilter: 'blur(2px)',
        padding: '4px 12px', borderRadius: '20px',
      }}>
        <svg width="16" height="16" viewBox="0 0 256 256" style={{ opacity: 0.4 }}>
          <rect width="256" height="256" rx="48" fill="#2563EB" />
          <text x="128" y="170" fontFamily="Arial" fontSize="130" fontWeight="800" fill="white" textAnchor="middle">PD</text>
        </svg>
        <span style={{
          fontSize: '10px', fontWeight: 600, color: 'rgba(0,0,0,0.35)',
          letterSpacing: '0.02em',
        }}>
          Made with PoterDeck
        </span>
      </div>
    </div>
  );
}
