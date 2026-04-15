// Multi-LLM routing: BYOK first → SystemKey → fallback chain

export function extractByokKeys(req) {
  return {
    gemini: req.headers['x-byok-gemini'] || null,
    gpt4o: req.headers['x-byok-openai'] || null,
    claude: req.headers['x-byok-anthropic'] || null,
  };
}

export function routeLLM(byokKeys, systemKeys, preferredProvider = 'gemini') {
  // Phase 1: Try preferred provider
  if (byokKeys[preferredProvider]) {
    return { provider: preferredProvider, key: byokKeys[preferredProvider], tier: 'primary' };
  }
  if (systemKeys[preferredProvider]) {
    return { provider: preferredProvider, key: systemKeys[preferredProvider], tier: 'primary' };
  }
  // Phase 2: Fallback chain
  const fallbackChain = ['gemini', 'gpt4o', 'claude'].filter((p) => p !== preferredProvider);
  for (const provider of fallbackChain) {
    if (byokKeys[provider]) return { provider, key: byokKeys[provider], tier: 'fallback' };
    if (systemKeys[provider]) return { provider, key: systemKeys[provider], tier: 'fallback' };
  }
  throw new Error('NO_PROVIDER_AVAILABLE');
}

export async function callProvider(provider, key, prompt) {
  const start = Date.now();
  let content, tokensUsed;

  if (provider === 'gemini') {
    content = await callGemini(key, prompt);
  } else if (provider === 'gpt4o') {
    content = await callOpenAI(key, prompt);
  } else if (provider === 'claude') {
    content = await callClaude(key, prompt);
  } else {
    throw new Error(`Unknown provider: ${provider}`);
  }

  return { content, latencyMs: Date.now() - start, provider };
}

async function callGemini(key, prompt) {
  const model = 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function callOpenAI(key, prompt) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 8192,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callClaude(key, prompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text || '';
}
