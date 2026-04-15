// Voice engine — Web Speech API wrapper with text fallback
// Supports two modes: 'intent' (landing page) and 'edit' (viewer)

const SpeechRecognition = typeof window !== 'undefined'
  ? window.SpeechRecognition || window.webkitSpeechRecognition
  : null;

export function isVoiceSupported() {
  return !!SpeechRecognition;
}

export function createRecognizer(onResult, onError, options = {}) {
  if (!SpeechRecognition) return null;
  const recognizer = new SpeechRecognition();
  recognizer.continuous = options.continuous || false;
  recognizer.interimResults = options.interim || false;
  recognizer.lang = options.lang || 'en-US';

  recognizer.onresult = (event) => {
    const last = event.results.length - 1;
    const transcript = event.results[last]?.[0]?.transcript || '';
    const isFinal = event.results[last]?.isFinal;
    onResult(transcript, isFinal);
  };
  recognizer.onerror = (event) => { onError(event.error); };
  recognizer.onend = () => { if (options.onEnd) options.onEnd(); };
  return recognizer;
}

export function needsAI(command) {
  const words = command.trim().split(/\s+/);
  if (words.length > 3) return true;
  const aiKeywords = [
    // Content changes
    'make', 'change', 'improve', 'summarize', 'add', 'remove', 'simplify',
    'executive', 'visual', 'highlight', 'rewrite', 'shorten', 'expand',
    // Spatial commands
    'move', 'swap', 'replace', 'resize', 'align', 'center',
    // Style commands
    'bold', 'bigger', 'smaller', 'color', 'font', 'dark', 'light',
    // Branding
    'logo', 'watermark', 'branding',
    // Structure
    'split', 'merge', 'duplicate', 'delete',
  ];
  return aiKeywords.some((kw) => command.toLowerCase().includes(kw));
}

// Parse voice command intent for landing page
export function parseIntentCommand(transcript) {
  const lower = transcript.toLowerCase().trim();

  // Check if it's a presentation creation command
  const createPhrases = [
    'create a', 'build a', 'make a', 'generate a', 'prepare a',
    'i need a', 'i want a', 'new presentation', 'new deck',
  ];

  for (const phrase of createPhrases) {
    if (lower.includes(phrase)) {
      // Extract the intent after the trigger phrase
      const idx = lower.indexOf(phrase);
      return {
        type: 'create',
        intent: transcript.slice(idx + phrase.length).trim(),
        raw: transcript,
      };
    }
  }

  // If no trigger phrase, treat the entire transcript as intent
  return { type: 'create', intent: transcript.trim(), raw: transcript };
}

// Parse voice command for slide editing in viewer
export function parseEditCommand(transcript) {
  return {
    type: 'edit',
    instruction: transcript.trim(),
    raw: transcript,
  };
}

export function readAloud(text) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

export function stopReading() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
