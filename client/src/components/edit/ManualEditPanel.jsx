import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { Button } from '../shared/Button';
import { useViewerStore } from '../../store/viewerStore';
import { SLIDE_SCHEMA } from '../../engine/slideSchema';

export function ManualEditPanel({ onClose }) {
  const slides = useViewerStore((s) => s.slides);
  const activeSlideIndex = useViewerStore((s) => s.activeSlideIndex);
  const updateSlide = useViewerStore((s) => s.updateSlide);
  const trackManualEdit = useViewerStore((s) => s.trackManualEdit);
  const slide = slides[activeSlideIndex];

  const [fields, setFields] = useState({});

  useEffect(() => {
    if (slide) {
      const editable = {};
      const schema = SLIDE_SCHEMA[slide.type];
      if (schema) {
        for (const f of schema.fields) {
          if (f.type === 'text' || f.type === 'richtext') {
            editable[f.key] = slide[f.key] || '';
          }
        }
      }
      setFields(editable);
    }
  }, [slide]);

  const handleSave = () => {
    updateSlide(activeSlideIndex, fields);
    trackManualEdit(activeSlideIndex);
    onClose();
  };

  if (!slide) return null;
  const schema = SLIDE_SCHEMA[slide.type];

  return (
    <div style={{
      width: '320px', background: 'var(--color-surface)', borderLeft: '1px solid var(--color-border)',
      padding: 'var(--space-4)', overflowY: 'auto', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>Manual Edit</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
          <X size={18} />
        </button>
      </div>
      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
        Advanced: text editing only. Style changes via AI commands.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', flex: 1 }}>
        {schema?.fields.filter((f) => f.type === 'text' || f.type === 'richtext').map((f) => (
          <div key={f.key}>
            <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, marginBottom: '4px', color: 'var(--color-text-muted)' }}>
              {f.label}
            </label>
            {f.type === 'richtext' ? (
              <textarea
                value={fields[f.key] || ''}
                onChange={(e) => setFields((p) => ({ ...p, [f.key]: e.target.value }))}
                rows={3}
                style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: 'var(--font-size-sm)', resize: 'vertical' }}
              />
            ) : (
              <input
                type="text"
                value={fields[f.key] || ''}
                onChange={(e) => setFields((p) => ({ ...p, [f.key]: e.target.value }))}
                style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: 'var(--font-size-sm)' }}
              />
            )}
          </div>
        ))}
      </div>
      <Button size="sm" onClick={handleSave} style={{ marginTop: 'var(--space-4)' }}>
        <Save size={14} /> Save Changes
      </Button>
    </div>
  );
}
