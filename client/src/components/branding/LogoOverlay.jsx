import React from 'react';
import { useDeckStore } from '../../store/deckStore';

const POSITION_MAP = {
  'top-left':      { top: '12px', left: '16px' },
  'top-center':    { top: '12px', left: '50%', transform: 'translateX(-50%)' },
  'top-right':     { top: '12px', right: '16px' },
  'middle-left':   { top: '50%', left: '16px', transform: 'translateY(-50%)' },
  'middle-center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
  'middle-right':  { top: '50%', right: '16px', transform: 'translateY(-50%)' },
  'bottom-left':   { bottom: '12px', left: '16px' },
  'bottom-center': { bottom: '12px', left: '50%', transform: 'translateX(-50%)' },
  'bottom-right':  { bottom: '40px', right: '16px' }, // above watermark
};

export function LogoOverlay() {
  const logoData = useDeckStore((s) => s.logoData);
  const logoPosition = useDeckStore((s) => s.logoPosition);
  const logoSize = useDeckStore((s) => s.logoSize);

  if (!logoData) return null;

  const posStyle = POSITION_MAP[logoPosition] || POSITION_MAP['bottom-left'];

  return (
    <div style={{
      position: 'absolute', zIndex: 90, pointerEvents: 'none', userSelect: 'none',
      ...posStyle,
    }}>
      <img
        src={logoData}
        alt="Company logo"
        style={{
          height: `${logoSize || 48}px`,
          width: 'auto',
          objectFit: 'contain',
          opacity: 0.9,
        }}
      />
    </div>
  );
}
