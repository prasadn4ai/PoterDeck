import { v4 as uuidv4 } from 'uuid';

const VALID_TYPES = ['title', 'agenda', 'content', 'dashboard', 'table', 'section-overview', 'highlight-list', 'thank-you'];

function cleanJsonResponse(raw) {
  let text = raw.trim();
  // Strip markdown fences
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }
  // Attempt to fix truncated JSON
  let bracketCount = 0;
  for (const ch of text) {
    if (ch === '[' || ch === '{') bracketCount++;
    if (ch === ']' || ch === '}') bracketCount--;
  }
  while (bracketCount > 0) {
    text += text.includes('[') && !text.endsWith(']') ? '}]' : '}';
    bracketCount--;
  }
  return text;
}

function validateSlide(slide, index) {
  const validated = { ...slide };

  if (!validated.id) validated.id = uuidv4();
  if (!validated.type || !VALID_TYPES.includes(validated.type)) {
    validated.type = 'content';
  }
  if (!validated.label) validated.label = `Slide ${index + 1}`;
  if (!validated.title) validated.title = validated.label;

  // Ensure arrays
  if (validated.bullets && !Array.isArray(validated.bullets)) validated.bullets = [];
  if (validated.metrics && !Array.isArray(validated.metrics)) validated.metrics = [];
  if (validated.headers && !Array.isArray(validated.headers)) validated.headers = [];
  if (validated.rows && !Array.isArray(validated.rows)) validated.rows = [];
  if (validated.items && !Array.isArray(validated.items)) validated.items = [];

  // Default confidence
  validated.confidenceScore = 0;
  validated.isApproved = false;
  validated.isManuallyEdited = false;

  return validated;
}

export function validateSlideResponse(rawJson, expectedCount) {
  try {
    const cleaned = cleanJsonResponse(rawJson);
    const parsed = JSON.parse(cleaned);
    const slides = Array.isArray(parsed) ? parsed : [parsed];
    return slides.map((slide, i) => validateSlide(slide, i));
  } catch (err) {
    console.error('JSON parse failed:', err.message);
    throw new Error('AI response was not valid JSON. Please retry.');
  }
}

export function validateSingleSlide(rawJson) {
  const cleaned = cleanJsonResponse(rawJson);
  const parsed = JSON.parse(cleaned);
  const slide = Array.isArray(parsed) ? parsed[0] : parsed;
  return validateSlide(slide, 0);
}
