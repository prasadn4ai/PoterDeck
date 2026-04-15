import React from 'react';
import { Palette, Check } from 'lucide-react';
import { Button } from '../shared/Button';
import { useUiStore } from '../../store/uiStore';
import { useDeckStore } from '../../store/deckStore';
import { getTypography, COLOR_THEMES } from '../../engine/designEngine';

const STYLES = [
  { id: 'corporate', label: 'Corporate', desc: 'Clean, professional, DM Sans' },
  { id: 'modern', label: 'Modern', desc: 'Contemporary, Outfit font' },
  { id: 'minimal', label: 'Minimal', desc: 'Elegant, lightweight, Montserrat' },
  { id: 'glass', label: 'Glass', desc: 'Frosted, translucent surfaces' },
  { id: 'bold', label: 'Bold', desc: 'High contrast, large type' },
];

const COLORS = [
  { id: 'blue', label: 'Blue', hex: '#2563EB' },
  { id: 'purple', label: 'Purple', hex: '#7C3AED' },
  { id: 'teal', label: 'Teal', hex: '#0D9488' },
  { id: 'rose', label: 'Rose', hex: '#E11D48' },
  { id: 'amber', label: 'Amber', hex: '#D97706' },
];

export function StyleSelectPage() {
  const setAppPhase = useUiStore((s) => s.setAppPhase);
  const selectedStyle = useDeckStore((s) => s.selectedStyle);
  const selectedColorTheme = useDeckStore((s) => s.selectedColorTheme);
  const setStyle = useDeckStore((s) => s.setStyle);
  const setColorTheme = useDeckStore((s) => s.setColorTheme);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: 'var(--space-8)' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <button onClick={() => setAppPhase('landing')} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
          &larr; Back
        </button>

        <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
          Choose Your Style
        </h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-8)' }}>
          AI recommends based on your deck type. You can override.
        </p>

        {/* Design Styles */}
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Design Style</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
          {STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => setStyle(s.id)}
              style={{
                padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                border: selectedStyle === s.id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                background: selectedStyle === s.id ? 'var(--color-primary)' : 'var(--color-surface)',
                color: selectedStyle === s.id ? '#fff' : 'var(--color-text)',
                textAlign: 'center', transition: 'var(--transition-fast)',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{s.label}</div>
              <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.8, marginTop: '4px' }}>{s.desc}</div>
            </button>
          ))}
        </div>

        {/* Color Themes */}
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Color Theme</h3>
        <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-10)', flexWrap: 'wrap' }}>
          {COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() => setColorTheme(c.id)}
              style={{
                width: '56px', height: '56px', borderRadius: 'var(--radius-full)', cursor: 'pointer',
                background: c.hex,
                border: selectedColorTheme === c.id ? '3px solid var(--color-text)' : '2px solid transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'var(--transition-fast)',
              }}
              title={c.label}
            >
              {selectedColorTheme === c.id && <Check size={20} color="#fff" />}
            </button>
          ))}
        </div>

        <Button size="lg" fullWidth onClick={() => setAppPhase('generating')}
          disabled={!selectedStyle || !selectedColorTheme}>
          Generate Deck
        </Button>
      </div>
    </div>
  );
}
