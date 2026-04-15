import { requireAuth } from '../../lib/auth.js';
import { buildPptx } from '../../lib/pptxService.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const user = await requireAuth(req, res);
  if (!user) return;

  const { slides, style, colorTheme, deckTitle } = req.body || {};
  if (!slides?.length) return res.status(422).json({ error: 'slides required', code: 'VALIDATION_FAILED' });

  try {
    const pptx = buildPptx(slides, style || 'corporate', colorTheme || 'blue', deckTitle || 'Presentation');
    const buffer = await pptx.write({ outputType: 'nodebuffer' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${(deckTitle || 'deck').replace(/[^a-zA-Z0-9]/g, '_')}.pptx"`);
    return res.status(200).send(buffer);
  } catch (err) {
    console.error('PPTX export error:', err.message);
    return res.status(500).json({ error: 'PPTX export failed', code: 'EXPORT_FAILED', retryable: true });
  }
}
