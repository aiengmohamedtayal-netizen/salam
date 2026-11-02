/**
 * AMAL Assistant — mock response engine.
 *
 * FRONTEND-ONLY demo shell: no backend, no LLM call, no database, no
 * persistence. Every answer body lives in the locale files under
 * `assistant.responses.<id>` so Arabic and English stay fully localized and
 * this file holds no answer copy.
 */

/** Crisis keywords — matched against free-text input only. */
const CRISIS_KEYWORDS = [
  'انتحار',
  'أؤذي نفسي',
  'أقتل نفسي',
  'خطر فوري',
  'مساعدة عاجلة',
  'suicide',
  'kill myself',
  'self harm',
  'self-harm',
  'hurt myself',
  'end my life',
  'immediate danger',
  'emergency',
];

/**
 * Topic list. `id` maps to `assistant.responses.<id>` in the locale files.
 * `keywords` are matched against the normalized user input; the longest match
 * wins, and the exact quick-prompt texts are listed first so a chip always
 * resolves to its own topic.
 */
export const ASSISTANT_TOPICS = [
  {
    id: 'overview',
    answerKey: 'assistant.responses.overview',
    keywords: [
      'كيف يعمل AMAL؟',
      'كيف يعمل أمل؟',
      'كيف يعمل SALAM؟',
      'كيف يعمل',
      'كيف تعمل المنصة',
      'ما هي المنصة',
      'عن المنصة',
      'how does AMAL work?',
      'how does SALAM work?',
      'how does it work',
      'what is AMAL',
      'what is SALAM',
      'about AMAL',
      'about SALAM',
      'overview',
    ],
  },
  {
    id: 'assessment',
    answerKey: 'assistant.responses.assessment',
    keywords: [
      'خطوات التقييم',
      'التقييم',
      'كيف أبدأ',
      'الاختبار',
      'assessment',
      'how do I start',
      'assessment flow',
    ],
  },
  {
    id: 'result',
    answerKey: 'assistant.responses.result',
    keywords: [
      'ماذا تعني النتيجة؟',
      'ماذا تعني النتيجة',
      'النتيجة',
      'ماذا يعني',
      'what does the result mean?',
      'the result',
      'result',
      'score',
    ],
  },
  {
    id: 'uncertainty',
    answerKey: 'assistant.responses.uncertainty',
    keywords: [
      'ماذا لو لم أكن متأكدا',
      'غير متأكد',
      'عدم اليقين',
      'نتائج متضاربة',
      'uncertain',
      'not sure',
      'unsure',
      'inconclusive',
    ],
  },
  {
    id: 'textAnalysis',
    answerKey: 'assistant.responses.textAnalysis',
    keywords: [
      'كيف يتم تحليل النص؟',
      'تحليل النص',
      'تحليل لغوي',
      'how is text analyzed?',
      'text analysis',
      'analyzed',
      'analyse text',
      'analyze text',
    ],
  },
  {
    id: 'voice',
    answerKey: 'assistant.responses.voice',
    keywords: [
      'ماذا يحدث للصوت؟',
      'ما يحدث للصوت',
      'الصوت',
      'تسجيل صوتي',
      'what happens to my voice recording?',
      'voice recording',
      'recording',
      'voice',
      'audio',
    ],
  },
  {
    id: 'multimodal',
    answerKey: 'assistant.responses.multimodal',
    keywords: [
      'تحليل الوسائط',
      'متعدد الوسائط',
      'صورة',
      'multimodal',
      'media analysis',
      'image',
    ],
  },
  {
    id: 'privacy',
    answerKey: 'assistant.responses.privacy',
    keywords: [
      'هل يتم حفظ بياناتي؟',
      'حفظ بياناتي',
      'الخصوصية',
      'خصوصية',
      'حفظ',
      'is my data stored?',
      'data stored',
      'my data',
      'privacy',
    ],
  },
  {
    id: 'awareness',
    answerKey: 'assistant.responses.awareness',
    keywords: [
      'موارد التوعية',
      'التوعية',
      'علامات',
      'awareness',
      'resources',
      'signs',
    ],
  },
  {
    id: 'support',
    answerKey: 'assistant.responses.support',
    keywords: [
      'كيف أحصل على الدعم؟',
      'الدعم',
      'المساعدة',
      'where can I get support?',
      'get support',
      'support',
      'help',
    ],
  },
  {
    id: 'limitations',
    answerKey: 'assistant.responses.limitations',
    keywords: [
      'حدود',
      'الحدود',
      'لا أستطيع',
      'تشخيص',
      'طبيب',
      'limitations',
      'limitation',
      'cannot',
      'diagnos',
      'doctor',
    ],
  },
];

/**
 * Normalizes free text so matching is stable across Arabic orthography
 * variants (diacritics, tatweel, alef/ya/ta-marbuta) and English casing.
 */
export function normalizeAssistantText(text) {
  if (typeof text !== 'string') return '';

  return text
    .trim()
    .toLowerCase()
    // Arabic diacritics (tashkeel), tatweel and Quranic annotation marks.
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640\u08D3-\u08FF]/g, '')
    // Alef variants -> ا
    .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')
    // Ya variants -> ي
    .replace(/[\u0649\u06CC]/g, '\u064A')
    // Ta marbuta -> ه
    .replace(/\u0629/g, '\u0647')
    // Waw with hamza -> و
    .replace(/\u0624/g, '\u0648')
    // Ya with hamza -> ي
    .replace(/\u0626/g, '\u064A')
    // Arabic-Indic and Extended Arabic-Indic digits -> latin
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06F0))
    .replace(/\s+/g, ' ')
    .trim();
}

/** True when the message contains any crisis keyword. */
export function isCrisisMessage(text) {
  const normalized = normalizeAssistantText(text);
  if (!normalized) return false;

  return CRISIS_KEYWORDS.some((keyword) => {
    const normalizedKeyword = normalizeAssistantText(keyword);
    return normalizedKeyword.length > 0 && normalized.includes(normalizedKeyword);
  });
}

/**
 * Matches user input to a topic.
 * @returns {{ id: string, kind: 'answer' | 'unsupported' | 'safety' }}
 */
export function matchAssistantResponse(text) {
  const normalized = normalizeAssistantText(text);

  if (!normalized) {
    return { id: 'unsupported', kind: 'unsupported' };
  }

  if (isCrisisMessage(normalized)) {
    return { id: 'safety', kind: 'safety' };
  }

  // Longest keywords first, so an exact quick-prompt text always beats a
  // shorter generic keyword from another topic.
  const ranked = ASSISTANT_TOPICS.flatMap((topic) =>
    topic.keywords.map((keyword) => ({ topic, keyword })),
  ).sort((a, b) => b.keyword.length - a.keyword.length);

  for (const { topic, keyword } of ranked) {
    const normalizedKeyword = normalizeAssistantText(keyword);
    if (!normalizedKeyword) continue;
    if (normalized === normalizedKeyword || normalized.includes(normalizedKeyword)) {
      return { id: topic.id, kind: 'answer' };
    }
  }

  return { id: 'unsupported', kind: 'unsupported' };
}
