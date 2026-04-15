import React, { useState } from 'react';
import { Download, FileText, FileJson, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../shared/Button';
import { useUiStore } from '../../store/uiStore';
import { useDeckStore } from '../../store/deckStore';
import { useViewerStore } from '../../store/viewerStore';
import { exportPptx } from '../../services/apiService';

export function ExportPage() {
  const [exporting, setExporting] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const setAppPhase = useUiStore((s) => s.setAppPhase);
  const slides = useViewerStore((s) => s.slides);
  const style = useDeckStore((s) => s.selectedStyle);
  const colorTheme = useDeckStore((s) => s.selectedColorTheme);
  const setToast = useUiStore((s) => s.setToast);

  const goBack = () => setAppPhase('viewer');

  const handlePptx = async () => {
    setExporting('pptx'); setError(''); setSuccess('');
    try {
      const blob = await exportPptx(slides, style, colorTheme, 'PoterDeck Presentation');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'deck.pptx'; a.click();
      URL.revokeObjectURL(url);
      setSuccess('PPTX exported successfully!');
      setToast({ type: 'success', message: 'PPTX downloaded' });
    } catch (e) { setError('PPTX export failed. ' + (e.message || '')); }
    setExporting(null);
  };

  const handleJson = () => {
    setError(''); setSuccess('');
    const blob = new Blob([JSON.stringify({ slides, style, colorTheme }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'deck.json'; a.click();
    URL.revokeObjectURL(url);
    setSuccess('JSON exported successfully!');
    setToast({ type: 'success', message: 'JSON downloaded' });
  };

  const handlePdf = async () => {
    setExporting('pdf'); setError(''); setSuccess('');
    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [960, 540] });
      // Add a simple text-based page per slide (full rendering requires html2canvas)
      for (let i = 0; i < slides.length; i++) {
        if (i > 0) pdf.addPage([960, 540], 'landscape');
        pdf.setFontSize(24);
        pdf.text(slides[i].title || `Slide ${i + 1}`, 40, 60);
        if (slides[i].subtitle) { pdf.setFontSize(14); pdf.text(slides[i].subtitle, 40, 90); }
        if (slides[i].body) { pdf.setFontSize(12); pdf.text(slides[i].body.slice(0, 200), 40, 130, { maxWidth: 880 }); }
        if (slides[i].bullets?.length) {
          pdf.setFontSize(12);
          slides[i].bullets.forEach((b, j) => { pdf.text(`• ${b}`, 50, 160 + j * 25, { maxWidth: 860 }); });
        }
      }
      pdf.save('deck.pdf');
      setSuccess('PDF exported successfully!');
      setToast({ type: 'success', message: 'PDF downloaded' });
    } catch (e) { setError('PDF export failed. ' + (e.message || '')); }
    setExporting(null);
  };

  const userTier = useDeckStore((s) => s.userTier);
  const isPremium = userTier === 'premium';

  const options = [
    { id: 'pptx', label: 'PowerPoint (.pptx)', desc: isPremium ? 'Best for editing and presenting' : 'Premium only — upgrade to unlock', icon: Download, action: isPremium ? handlePptx : () => setError('PPTX export requires a Premium subscription.'), premium: true },
    { id: 'pdf', label: 'PDF', desc: 'Available for all users', icon: FileText, action: handlePdf },
    { id: 'json', label: 'JSON', desc: isPremium ? 'Raw data for developers' : 'Premium only', icon: FileJson, action: isPremium ? handleJson : () => setError('JSON export requires a Premium subscription.'), premium: true },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: 'var(--space-8)' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--font-size-sm)' }}>
          <ArrowLeft size={16} /> Back to Viewer
        </button>
        <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Export Your Deck</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-8)' }}>{slides.length} slides ready to export</p>

        {success && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
            padding: 'var(--space-4)', background: '#10B98115', borderRadius: 'var(--radius-lg)',
            marginBottom: 'var(--space-4)', border: '1px solid #10B98130',
          }}>
            <CheckCircle size={20} color="#10B981" />
            <span style={{ color: '#10B981', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{success}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {options.map((opt) => {
            const Icon = opt.icon;
            return (
              <button key={opt.id} onClick={opt.action} disabled={exporting === opt.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
                  padding: 'var(--space-5)', background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
                  cursor: exporting === opt.id ? 'wait' : 'pointer', textAlign: 'left',
                  transition: 'var(--transition-fast)', opacity: exporting === opt.id ? 0.6 : 1,
                }}>
                <Icon size={24} style={{ color: 'var(--color-primary)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{exporting === opt.id ? 'Exporting...' : opt.label}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{opt.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {error && <p style={{ color: 'var(--color-error)', marginTop: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>{error}</p>}

        <div style={{ marginTop: 'var(--space-8)', textAlign: 'center' }}>
          <Button variant="secondary" onClick={goBack}>
            <ArrowLeft size={14} /> Return to Viewer
          </Button>
        </div>
      </div>
    </div>
  );
}
