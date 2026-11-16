/**
 * SovereignEG OpenAI-compatible client integration for AMAL Assistant & Mindful Tips.
 * Uses SovereignEG/Qwen3.8-27B-FP8 on https://backend.sovereigneg.com/v1.
 */

export const SOVEREIGN_CONFIG = {
  baseURL: import.meta.env.VITE_SOVEREIGN_BASE_URL || 'https://backend.sovereigneg.com/v1',
  apiKey: import.meta.env.VITE_SOVEREIGN_API_KEY || 'sk-bece18c5b0adc0134c7f29f622b06eb1',
  model: import.meta.env.VITE_SOVEREIGN_MODEL || 'SovereignEG/Qwen3.8-27B-FP8',
};

const ALLOWED_ICONS = ['wind', 'heart', 'sparkles', 'shield', 'sprout', 'sun', 'edit', 'care'];
const ALLOWED_THEMES = ['teal', 'purple', 'rose', 'amber', 'emerald'];

/**
 * Creates chat completion using SovereignEG API.
 * Mirrors the OpenAI SDK client.chat.completions.create signature.
 */
export async function createChatCompletion({
  messages,
  model = SOVEREIGN_CONFIG.model,
  temperature,
}) {
  const response = await fetch(`${SOVEREIGN_CONFIG.baseURL.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SOVEREIGN_CONFIG.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      ...(temperature !== undefined ? { temperature } : {}),
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`SovereignEG API error: ${response.status} - ${errText}`);
  }

  return response.json();
}

/**
 * Helper to get a text response directly from SovereignEG.
 */
export async function askSovereign(prompt, { history = [], lang = 'ar', systemPrompt } = {}) {
  const defaultSystemPrompt = lang === 'ar'
    ? 'أنت مساعد أمل (AMAL Assistant)، مساعد ذكي وداعم يقدم إجابات دقيقة ومفيدة ولطيفة باللغة التي يخاطبك بها المستخدم (العربية أو الإنجليزية). في سياق المنصة، تقدم الدعم والتوعية وتوضح أنك أداة توعية ولست بديلاً عن الطبيب النفسي أو الاستشارة الطبية المتخصصة. في المواضيع العامة الأخرى، أجب بشكل مباشر وودود وممتع ومفيد.'
    : 'You are AMAL Assistant, an intelligent, empathetic, and supportive AI companion. Answer clearly, helpfully, and warmly in the user\'s language. For platform and mental health topics, provide educational awareness and clarify that you are not a clinical tool. For general inquiries, be helpful, natural, and engaging.';

  const messages = [
    { role: 'system', content: systemPrompt || defaultSystemPrompt },
    ...history.map((turn) => ({ role: turn.role, content: turn.text || turn.content })),
    { role: 'user', content: prompt },
  ];

  const data = await createChatCompletion({ messages });
  const choice = data?.choices?.[0]?.message;
  return (choice?.content || choice?.reasoning_content || '').trim();
}

/**
 * Safely parses JSON array from raw model text, stripping markdown code fences if present.
 */
function extractJsonArray(rawText) {
  if (!rawText) return null;
  const cleaned = rawText.trim();

  // Try direct parse
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
  } catch {}

  // Try extracting from markdown code block ```json ... ``` or standard [ ... ]
  const arrayMatch = cleaned.match(/\[\s*\{[\s\S]*\}\s*\]/);
  if (arrayMatch) {
    try {
      const parsed = JSON.parse(arrayMatch[0]);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }

  return null;
}

/**
 * Generates new psychological mindful tips automatically using SovereignEG.
 * Used when the local stock of tips is depleted or on user demand.
 * @param {number} count Number of tips to generate (default 2)
 * @returns {Promise<Array>} Array of parsed tip objects matching mindfulTips schema
 */
export async function generateMindfulTipsWithSovereign(count = 2) {
  const systemPrompt =
    'You are AMAL Mental Health AI expert. Respond ONLY with a valid JSON array of mindful tip objects matching the requested schema. No markdown code blocks outside JSON, no preamble, no conversational commentary.';

  const userPrompt = `قم بتوليد ${count} نصائح نفسية جديدة وملهمة ومختلفة عن المألوف لمنصة أمل للوعي النفسي والصحة النفسية.
يجب أن ترجع النتيجة كمصفوفة JSON فقط تحوي ${count} كائنات بالهيكل التالي:
[
  {
    "category": "فئة النصيحة بالعربية (مثل: الهدوء والتوازن، حب الذات، تنظيم المشاعر، الحدود، الامتنان)",
    "categoryEn": "Category in English",
    "title": "عنوان ملهم ومختصر بالعربية",
    "titleEn": "Title in English",
    "quote": "اقتباس عميق ومركز بالعربية",
    "quoteEn": "Short inspiring quote in English",
    "body": "شرح نفسي تحليلي مبسط وداعم بالعربية في سطرين أو ثلاثة",
    "bodyEn": "Concise psychological insight in English",
    "exercise": "تمرين دقيقة واحدة عملي وسريع بالعربية",
    "exerciseEn": "One-minute mindful exercise in English",
    "iconName": "wind",
    "theme": "teal"
  }
]
- اختر iconName حصراً من: ["wind", "heart", "sparkles", "shield", "sprout", "sun", "edit", "care"]
- اختر theme حصراً من: ["teal", "purple", "rose", "amber", "emerald"]
- أرجع فقط الـ JSON Array الصالح.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const data = await createChatCompletion({
    messages,
    temperature: 0.75,
  });

  const choice = data?.choices?.[0]?.message;
  const rawText = (choice?.content || choice?.reasoning_content || '').trim();

  const parsedArray = extractJsonArray(rawText);
  if (!parsedArray || !parsedArray.length) {
    throw new Error('Failed to parse mindful tips JSON from SovereignEG response');
  }

  const timestamp = Date.now();
  return parsedArray.map((tip, idx) => ({
    id: `ai-tip-${timestamp}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
    category: tip.category || 'وعي نفسي',
    categoryEn: tip.categoryEn || 'Mindful Insight',
    title: tip.title || 'لحظة وعي',
    titleEn: tip.titleEn || 'Mindful Moment',
    quote: tip.quote || 'تنفس بعمق وامنح نفسك مساحة للأمان.',
    quoteEn: tip.quoteEn || 'Breathe deeply and find peace within.',
    body: tip.body || 'كل لحظة هي فرصة جديدة للبدء بلطف وهدوء.',
    bodyEn: tip.bodyEn || 'Every moment is a gentle chance to begin anew.',
    exercise: tip.exercise || 'خذ 3 أنفاس عميقة وركز على إحساس جسدك.',
    exerciseEn: tip.exerciseEn || 'Take three deep breaths and observe your sensations.',
    iconName: ALLOWED_ICONS.includes(tip.iconName) ? tip.iconName : 'sparkles',
    theme: ALLOWED_THEMES.includes(tip.theme) ? tip.theme : 'purple',
    isAiGenerated: true,
  }));
}
