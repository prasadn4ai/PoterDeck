// SERVER-ONLY: Privacy masking and MaskMap management
import { supabase } from './supabase.js';

const SENSITIVE_PATTERNS = [
  { type: 'EMAIL', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
  { type: 'PHONE', regex: /(\+?1?\s?)?(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/g },
  { type: 'MONEY', regex: /\$[\d,]+(\.\d{2})?|\d+(\.\d{2})?\s?(USD|EUR|GBP)/g },
  { type: 'NAME', regex: /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g },
  { type: 'COMPANY', regex: /\b[A-Z][a-zA-Z]+ (Inc|LLC|Corp|Ltd|Co)\b/g },
  { type: 'ID', regex: /\b\d{6,}\b/g },
];

export async function maskDeck(sessionId, userId, text) {
  if (!text) return { maskedText: text, tokenCount: 0 };

  // Load existing maskMap or create new
  let maskMap = {};
  const { data: existing } = await supabase
    .from('mask_maps')
    .select('mask_data')
    .eq('session_id', sessionId)
    .single();

  if (existing) maskMap = existing.mask_data || {};

  // Build reverse lookup
  const reverseMap = {};
  for (const [token, val] of Object.entries(maskMap)) reverseMap[val] = token;

  let maskedText = text;
  let counter = Object.keys(maskMap).length;

  for (const pattern of SENSITIVE_PATTERNS) {
    const matches = maskedText.match(pattern.regex) || [];
    for (const match of matches) {
      if (reverseMap[match]) {
        maskedText = maskedText.replace(match, reverseMap[match]);
      } else {
        const token = `[[MASKED_${pattern.type}_${counter}]]`;
        maskMap[token] = match;
        reverseMap[match] = token;
        maskedText = maskedText.replace(match, token);
        counter++;
      }
    }
  }

  // Persist maskMap
  await supabase.from('mask_maps').upsert({
    session_id: sessionId,
    user_id: userId,
    mask_data: maskMap,
    expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  });

  return { maskedText, tokenCount: Object.keys(maskMap).length };
}

export async function injectRealData(sessionId, slides) {
  const { data, error } = await supabase
    .from('mask_maps')
    .select('mask_data')
    .eq('session_id', sessionId)
    .single();

  if (error || !data) {
    const e = new Error('MaskMap not found or expired');
    e.status = 410;
    throw e;
  }

  const maskMap = data.mask_data || {};
  return slides.map((slide) => {
    const unmasked = { ...slide };
    for (const [key, val] of Object.entries(unmasked)) {
      if (typeof val === 'string') {
        let replaced = val;
        for (const [token, real] of Object.entries(maskMap)) {
          replaced = replaced.split(token).join(real);
        }
        unmasked[key] = replaced;
      }
      if (Array.isArray(val)) {
        unmasked[key] = val.map((item) => {
          if (typeof item === 'string') {
            let r = item;
            for (const [token, real] of Object.entries(maskMap)) r = r.split(token).join(real);
            return r;
          }
          return item;
        });
      }
    }
    return unmasked;
  });
}

export async function getMaskedCount(sessionId) {
  const { data } = await supabase
    .from('mask_maps')
    .select('mask_data')
    .eq('session_id', sessionId)
    .single();

  if (!data) return { maskedCount: 0, hasMaskMap: false };
  return { maskedCount: Object.keys(data.mask_data || {}).length, hasMaskMap: true };
}
