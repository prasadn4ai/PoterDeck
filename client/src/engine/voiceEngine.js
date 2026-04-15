// Voice engine — Web Speech API wrapper with text fallback

const SpeechRecognition = typeof window !== 'undefined'
  ? window.SpeechRecognition || window.webkitSpeechRecognition
  : null;

export function isVoiceSupported() {
  return !!SpeechRecognition;
}

export function createRecognizer(onResult, onError) {
  if (!SpeechRecognition) return null;
  const recognizer = new SpeechRecognition();
  recognizer.continuous = false;
  recognizer.interimResults = false;
  recognizer.lang = 'en-US';

  recognizer.onresult = (event) => {
    const transcript = event.results[0]?.[0]?.transcript || '';
    onResult(transcript);
  };
  recognizer.onerror = (event) => { onError(event.error); };
  return recognizer;
}

export function needsAI(command) {
  // Simple heuristics: commands > 3 words or containing intent keywords go to AI
  const words = command.trim().split(/\s+/);
  if (words.length > 3) return true;
  const aiKeywords = ['make', 'change', 'improve', 'summarize', 'add', 'remove', 'simplify', 'executive', 'visual', 'highlight'];
  return aiKeywords.some((kw) => command.toLowerCase().includes(kw));
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
