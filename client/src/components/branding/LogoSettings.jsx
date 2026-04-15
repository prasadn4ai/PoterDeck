import React, { useRef } from 'react';
import { Upload, Trash2, Image } from 'lucide-react';
import { Button } from '../shared/Button';
import { useDeckStore } from '../../store/deckStore';

const POSITIONS = [
  ['top-left', 'top-center', 'top-right'],
  ['middle-left', 'middle-center', 'middle-right'],
  ['bottom-left', 'bottom-center', 'bottom-right'],
];

export function LogoSettings() {
  const logoData = useDeckStore((s) => s.logoData);
  const logoPosition = useDeckStore((s) => s.logoPosition);
  const logoSize = useDeckStore((s) => s.logoSize);
  const setLogoData = useDeckStore((s) => s.setLogoData);
  const setLogoPosition = useDeckStore((s) => s.setLogoPosition);
  const setLogoSize = useDeckStore((s) => s.setLogoSize);
  const fileRef = useRef(null);

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Logo must be under 2MB'); return; }
    if (!['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'].includes(file.type)) {
      alert('Accepted formats: PNG, JPG, SVG, WebP'); return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogoData(ev.target.result);
      localStorage.setItem('poterdeck_logo', ev.target.result);
      localStorage.setItem('poterdeck_logo_position', logoPosition);
      localStorage.setItem('poterdeck_logo_size', String(logoSize));
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setLogoData(null);
    localStorage.removeItem('poterdeck_logo');
  };

  const handlePositionChange = (pos) => {
    setLogoPosition(pos);
    localStorage.setItem('poterdeck_logo_position', pos);
  };

  const handleSizeChange = (val) => {
    setLogoSize(Number(val));
    localStorage.setItem('poterdeck_logo_size', val);
  };

  return (
    <section style={{ marginBottom: 'var(--space-8)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
        <Image size={20} style={{ color: 'var(--color-primary)' }} />
        <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>Company Logo</h2>
      </div>
      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
        Upload your logo to display on every slide. PNG with transparency recommended.
      </p>

      {/* Upload */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        {logoData ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <img src={logoData} alt="Logo" style={{ height: '48px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }} />
            <Button size="sm" variant="danger" onClick={handleRemove}><Trash2 size={14} /> Remove</Button>
          </div>
        ) : (
          <Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()}>
            <Upload size={14} /> Upload Logo
          </Button>
        )}
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" onChange={handleUpload} style={{ display: 'none' }} />
      </div>

      {logoData && (
        <>
          {/* Position picker */}
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, display: 'block', marginBottom: 'var(--space-2)' }}>Position on Slide</label>
            <div style={{ display: 'inline-grid', gridTemplateColumns: 'repeat(3, 40px)', gap: '4px', background: 'var(--color-bg-alt)', padding: '8px', borderRadius: 'var(--radius-md)' }}>
              {POSITIONS.flat().map((pos) => (
                <button key={pos} onClick={() => handlePositionChange(pos)}
                  title={pos.replace('-', ' ')}
                  style={{
                    width: '40px', height: '28px', borderRadius: '4px', border: 'none', cursor: 'pointer',
                    background: logoPosition === pos ? 'var(--color-primary)' : 'var(--color-surface)',
                    transition: 'var(--transition-fast)',
                  }}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '2px',
                    background: logoPosition === pos ? '#fff' : 'var(--color-text-muted)',
                    margin: pos.includes('left') ? '0' : pos.includes('right') ? '0 0 0 auto' : '0 auto',
                    marginTop: pos.includes('top') ? '0' : pos.includes('bottom') ? 'auto' : '0',
                  }} />
                </button>
              ))}
            </div>
          </div>

          {/* Size slider */}
          <div>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, display: 'block', marginBottom: 'var(--space-2)' }}>
              Logo Size: {logoSize}px
            </label>
            <input type="range" min="24" max="120" value={logoSize} onChange={(e) => handleSizeChange(e.target.value)}
              style={{ width: '200px' }} />
          </div>
        </>
      )}
    </section>
  );
}
