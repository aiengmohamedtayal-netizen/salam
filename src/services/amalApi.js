/**
 * Compatibility boundary for existing features. All submitted content is sent
 * only to the configured AMAL API; this module never calls third-party AI APIs.
 */
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const DISCLAIMER = 'AMAL is an educational tool and does not provide a medical or psychological diagnosis.';

function getCsrfToken() {
  return document.cookie.split('; ').find((cookie) => cookie.startsWith('amal_csrf='))?.split('=').slice(1).join('=') || '';
}

async function post(path, payload) {
  let response;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': getCsrfToken() },
      cache: 'no-store',
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (cause) {
    const error = new Error(cause?.name === 'AbortError' ? 'API_TIMEOUT' : 'API_UNAVAILABLE');
    error.code = cause?.name === 'AbortError' ? 'API_TIMEOUT' : 'API_UNAVAILABLE';
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.error?.code || 'API_ERROR');
    error.code = data?.error?.code || 'API_ERROR';
    error.requestId = data?.error?.request_id || response.headers.get('X-Request-ID');
    throw error;
  }
  return data;
}

export async function analyzeText(text) {
  const result = await post('/api/v1/analysis/text', { text, language: 'ar' });
  return {
    status: result.status,
    indicator_level: null,
    confidence_score: null,
    influenced_spans: [],
    guidance: null,
    disclaimer: DISCLAIMER,
    request_id: result.request_id,
  };
}

export async function analyzeGuidedAssessment(text, answers = {}, onProgress, lang = 'ar') {
  onProgress?.(0);
  const result = await post('/api/v1/analysis/text', { text, answers, language: lang });
  if (result.status === 'insufficient_input') {
    return {
      assessmentId: result.request_id,
      createdAt: new Date().toISOString(),
      inputLength: text.length,
      level: 'insufficient',
      isAbstained: true,
      factors: [],
      recommendations: [],
      disclaimer: DISCLAIMER,
    };
  }
  throw new Error('MODEL_UNAVAILABLE');
}

export async function verifyClaim(claimText, lang = 'ar') {
  return post('/api/v1/analysis/claims', { text: claimText, language: lang });
}

export async function analyzeMultimodalPost({ text = '', modality = 'multimodal' }, lang = 'ar') {
  return post('/api/v1/analysis/multimodal', { text, modality, language: lang });
}

export async function sendAssistantMessage({ message, history = [], lang = 'ar' }) {
  return post('/api/v1/assistant/messages', { message, history, language: lang });
}
