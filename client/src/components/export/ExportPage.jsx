import React, { useState } from 'react';
import { Download, FileText, FileJson, ArrowLeft } from 'lucide-react';
import { Button } from '../shared/Button';
import { useUiStore } from '../../store/uiStore';
import { useDeckStore } from '../../store/deckStore';
import { useViewerStore } from '../../store/viewerStore';
import { exportPptx } from '../../services/apiService';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export function ExportPage() {
  const [exporting, setExporting] = useState(null);
  const [error, setError] = useState('');
  const setAppPhase = useUiStore((s) => s.setAppPhase);
  const slides = useViewerStore((s) => s.slides);
  const style = useDeckStore((s) => s.selectedStyle);
  const colorTheme = useDeckStore((s) => s.selectedColorTheme);

  const handlePptx = async () => {
    setExporting('pptx'); setError('');
    try {
      const blob = await exportPptx(slides, style, colorTheme, 'PoterDeck Presentation');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'deck.pptx'; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { setError('PPTX export failed. ' + (e.message || '')); }
    setExporting(null);
  };

  const handleJson = () => {
    const blob = new Blob([JSON.stringify({ slides, style, colorTheme }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'deck.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const handlePdf = async () => {
    setExporting('pdf'); setError('');
    try {
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [960, 540] });
      const container = document.getElementById('slide-export-container');
      if (!container) { setError('PDF export container not found'); setExporting(null); return; }
      for (let i = 0; i < slides.length; i++) {
        if (i > 0) pdf.addPage([960, 540], 'landscape');
        // Simplified: capture would need actual slide rendering
      }
      pdf.save('deck.pdf');
    } catch (e) { setError('PDF export failed. ' + (e.message || '')); }
    setExporting(null);
  };

  const options = [
    { id: 'pptx', label: 'PowerPoint (.pptx)', desc: 'Best for editing and presenting', icon: Download, action: handlePptx },
    { id: 'pdf', label: 'PDF', desc: 'Best for sharing (read-only)', icon: FileText, action: handlePdf },
    { id: 'json', label: 'JSON', desc: 'Raw data for developers', icon: FileJson, action: handleJson },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: 'var(--space-8)' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <button onClick={() => setAppPhase('viewer')} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ArrowLeft size={16} /> Back to Viewer
        </button>
        <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Export Your Deck</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-8)' }}>{slides.length} slides ready to export</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {options.map((opt) => {
            const Icon = opt.icon;
            return (
              <button key={opt.id} onClick={opt.action} disabled={exporting === opt.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
                  padding: 'var(--space-5)', background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer', textAlign: 'left', transition: 'var(--transition-fast)',
                  opacity: exporting === opt.id ? 0.6 : 1,
                }}>
                <Icon size={24} style={{ color: 'var(--color-primary)' }} />
                <div>
                  <div style={{ fontWeight: 600 }}>{exporting === opt.id ? 'Exporting...' : opt.label}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{opt.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
        {error && <p style={{ color: 'var(--color-error)', marginTop: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>{error}</p>}
      </div>
    </div>
  );
}
