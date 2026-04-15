import { requireAuth } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const user = await requireAuth(req, res);
  if (!user) return;

  // In Vercel Serverless, file uploads need special handling
  // For MVP: accept multipart, validate type and size
  // Full implementation requires Vercel Blob or Supabase Storage

  return res.status(200).json({
    fileId: 'upload_' + Date.now(),
    type: 'xlsx',
    parsedContent: {},
    message: 'File upload endpoint ready. Full parsing in next iteration.',
  });
}
