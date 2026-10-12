/**
 * SALAM — Smart Adaptive Question Bank & Deterministic Branching Engine
 * Strictly non-diagnostic: collects early indicator context (Duration, Frequency,
 * Intensity, Daily Function, Sleep/Rest, Social Interaction, Concentration, Emotional Variation).
 * Fully localized for Arabic (ar) and English (en).
 */

export const ADAPTIVE_QUESTION_BANK = [
  {
    id: 'q_duration',
    category: 'duration',
    categoryLabel: {
      ar: 'المدة الزمنية',
      en: 'Duration',
    },
    question: {
      ar: 'منذ متى لاحظت هذه التغيّرات أو المشاعر التي وصفتها؟',
      en: 'How long have you noticed these changes or feelings you described?',
    },
    priority: 10,
    options: [
      { id: 'days', label: { ar: 'منذ أيام قليلة', en: 'A few days ago' }, value: 'days', weight: 'recent' },
      { id: 'weeks', label: { ar: 'منذ عدة أسابيع', en: 'Several weeks ago' }, value: 'weeks', weight: 'moderate' },
      { id: 'months', label: { ar: 'منذ عدة أشهر', en: 'Several months ago' }, value: 'months', weight: 'chronic' },
      { id: 'long_time', label: { ar: 'منذ فترة طويلة وممتدة', en: 'For an extended long period' }, value: 'long_time', weight: 'long' },
      { id: 'uncertain', label: { ar: 'لست متأكداً بدقة', en: 'Not entirely sure' }, value: 'uncertain', weight: 'neutral' },
      { id: 'prefer_not', label: { ar: 'أفضل عدم الإجابة', en: 'Prefer not to say' }, value: 'prefer_not', weight: 'skip' },
    ],
  },
  {
    id: 'q_frequency',
    category: 'frequency',
    categoryLabel: {
      ar: 'تكرار الشعور',
      en: 'Frequency',
    },
    question: {
      ar: 'كم مرة تلاحظ هذا الشعور أو الضغط خلال الأيام الأخيرة؟',
      en: 'How often have you noticed this feeling or pressure in recent days?',
    },
    priority: 9,
    options: [
      { id: 'rare', label: { ar: 'نادراً ما يطرأ', en: 'Rarely occurs' }, value: 'rare', weight: 'low' },
      { id: 'sometimes', label: { ar: 'أحياناً في بعض المواقف', en: 'Occasionally in certain situations' }, value: 'sometimes', weight: 'medium' },
      { id: 'several_days', label: { ar: 'عدة مرات في الأسبوع', en: 'Several times a week' }, value: 'several_days', weight: 'elevated' },
      { id: 'most_days', label: { ar: 'معظم أيام الأسبوع', en: 'Most days of the week' }, value: 'most_days', weight: 'high' },
      { id: 'daily', label: { ar: 'يومياً بشكل شبه مستمر', en: 'Daily almost continuously' }, value: 'daily', weight: 'high' },
      { id: 'uncertain', label: { ar: 'لست متأكداً', en: 'Not sure' }, value: 'uncertain', weight: 'neutral' },
    ],
  },
  {
    id: 'q_intensity',
    category: 'intensity',
    categoryLabel: {
      ar: 'شدة التأثير',
      en: 'Intensity',
    },
    question: {
      ar: 'ما مدى ثقل أو شدة هذا الشعور عليك عندما يداهمك؟',
      en: 'How heavy or intense does this feeling feel when it arises?',
    },
    priority: 8,
    options: [
      { id: 'mild', label: { ar: 'تأثير بسيط أتعايش معه بسهولة', en: 'Mild impact that is easy to manage' }, value: 'mild', weight: 'low' },
      { id: 'moderate', label: { ar: 'تأثير متوسط يمكنني تجاوزه بجهد', en: 'Moderate impact I can overcome with effort' }, value: 'moderate', weight: 'medium' },
      { id: 'noticeable', label: { ar: 'تأثير ملحوظ يغير من مزاجي بوضوح', en: 'Noticeable impact distinctly altering my mood' }, value: 'noticeable', weight: 'elevated' },
      { id: 'severe', label: { ar: 'تأثير كبير يثقل تفكيري ويصعب احتماله', en: 'Significant impact weighing on my mind and hard to bear' }, value: 'severe', weight: 'high' },
      { id: 'hard_to_tell', label: { ar: 'يصعب عليّ تحديد ذلك', en: 'Difficult to determine' }, value: 'hard_to_tell', weight: 'neutral' },
    ],
  },
  {
    id: 'q_daily_function',
    category: 'daily_function',
    categoryLabel: {
      ar: 'المهام والروتين',
      en: 'Daily Function',
    },
    question: {
      ar: 'إلى أي مدى يؤثر ما تشعر به على مهامك اليومية أو عملك/دراستك؟',
      en: 'To what extent does what you feel affect your daily tasks, work, or studies?',
    },
    priority: 9,
    options: [
      { id: 'no_effect', label: { ar: 'لا يؤثر تقريباً على إنتاجيتي', en: 'Hardly affects my productivity' }, value: 'no_effect', weight: 'low' },
      { id: 'sometimes', label: { ar: 'يؤثر أحياناً في أوقات الذروة فقط', en: 'Occasionally affects peak times only' }, value: 'sometimes', weight: 'medium' },
      { id: 'some_tasks', label: { ar: 'يجعل بعض المهام المطلوبة أكثر صعوبة', en: 'Makes certain required tasks more difficult' }, value: 'some_tasks', weight: 'elevated' },
      { id: 'significant', label: { ar: 'يؤثر بشكل واضح وملموس على يومي وإنجازي', en: 'Noticeably impairs my daily accomplishments' }, value: 'significant', weight: 'high' },
      { id: 'prefer_not', label: { ar: 'أفضل عدم الإجابة', en: 'Prefer not to say' }, value: 'prefer_not', weight: 'skip' },
    ],
  },
  {
    id: 'q_concentration',
    category: 'concentration',
    categoryLabel: {
      ar: 'التركيز والذهن',
      en: 'Concentration & Focus',
    },
    question: {
      ar: 'كيف تصف قدرتك على التركيز واتخاذ القرارات مؤخراً؟',
      en: 'How would you describe your ability to focus and make decisions recently?',
    },
    priority: 7,
    options: [
      { id: 'better_normal', label: { ar: 'مستقرة وقريبة من المعتاد', en: 'Stable and close to usual' }, value: 'normal', weight: 'low' },
      { id: 'slightly_lower', label: { ar: 'أقل قليلاً وأجد شروداً عابراً', en: 'Slightly reduced with occasional wandering thoughts' }, value: 'slightly_lower', weight: 'medium' },
      { id: 'noticeable_lower', label: { ar: 'أقل بشكل ملحوظ وأواجه صعوبة في التركيز', en: 'Noticeably lower with genuine difficulty concentrating' }, value: 'noticeable_lower', weight: 'elevated' },
      { id: 'fluctuating', label: { ar: 'متذبذبة جداً بحسب ضغط اليوم', en: 'Fluctuating greatly based on the day’s stress' }, value: 'fluctuating', weight: 'medium' },
      { id: 'uncertain', label: { ar: 'لست متأكداً', en: 'Not sure' }, value: 'uncertain', weight: 'neutral' },
    ],
  },
  {
    id: 'q_sleep_depth',
    category: 'sleep_rest',
    categoryLabel: {
      ar: 'الراحة والاسترخاء',
      en: 'Rest & Recovery',
    },
    question: {
      ar: 'عندما تأخذ قسطاً من الراحة أو النوم، هل تشعر بتجدد طاقتك؟',
      en: 'When you take time to rest or sleep, do you feel refreshed?',
    },
    priority: 8,
    options: [
      { id: 'refreshed', label: { ar: 'نعم، أشعر باستعادة نشاطي غالباً', en: 'Yes, I usually feel my energy restored' }, value: 'refreshed', weight: 'low' },
      { id: 'partially', label: { ar: 'جزئياً، لكن الإرهاق الذهني يظل موجوداً', en: 'Partially, but mental fatigue lingers' }, value: 'partially', weight: 'medium' },
      { id: 'unrefreshed', label: { ar: 'أصحو شاعراً بالثقل والإجهاد وكأنني لم أرتح', en: 'I wake up heavy and exhausted as if unrested' }, value: 'unrefreshed', weight: 'elevated' },
      { id: 'irregular', label: { ar: 'روتين راحتي غير منتظم إطلاقاً', en: 'My rest routine is completely irregular' }, value: 'irregular', weight: 'elevated' },
      { id: 'uncertain', label: { ar: 'لست متأكداً', en: 'Not sure' }, value: 'uncertain', weight: 'neutral' },
    ],
  },
  {
    id: 'q_social_deep',
    category: 'social_interaction',
    categoryLabel: {
      ar: 'التواصل الاجتماعي',
      en: 'Social Interaction',
    },
    question: {
      ar: 'هل لاحظت تغيراً حديثاً في رغبتك في مشاركة مشاعرك مع من حولك؟',
      en: 'Have you noticed a recent change in your desire to share your thoughts with those around you?',
    },
    priority: 6,
    options: [
      { id: 'no_change', label: { ar: 'لا، أتواصل وأشارك بنفس الوتيرة', en: 'No, I connect and share at the usual pace' }, value: 'no_change', weight: 'low' },
      { id: 'slight_pullback', label: { ar: 'تراجع بسيط، أفضّل قضاء وقت أكبر بمفردي', en: 'Slight retreat, preferring more time alone' }, value: 'slight_pullback', weight: 'medium' },
      { id: 'withdrawn_more', label: { ar: 'أشعر أن الآخرين قد لا يفهمون ما أمر به', en: 'I feel others might not understand what I am going through' }, value: 'withdrawn_more', weight: 'elevated' },
      { id: 'complete_isolate', label: { ar: 'أفضّل الابتعاد التام عن النقاشات الاجتماعية', en: 'I prefer withdrawing completely from social engagements' }, value: 'complete_isolate', weight: 'high' },
      { id: 'uncertain', label: { ar: 'لست متأكداً', en: 'Not sure' }, value: 'uncertain', weight: 'neutral' },
    ],
  },
  {
    id: 'q_emotional_variation',
    category: 'emotional_variation',
    categoryLabel: {
      ar: 'التقلبات المزاجية',
      en: 'Emotional Shifts',
    },
    question: {
      ar: 'هل تلاحظ تغيراً كبيراً في حالتك النفسية أو نشاطك على مدار ساعات اليوم؟',
      en: 'Do you notice significant shifts in your mood or energy throughout the day?',
    },
    priority: 5,
    options: [
      { id: 'rare', label: { ar: 'نادراً، حالتي متقاربة خلال اليوم', en: 'Rarely, my state is fairly steady across the day' }, value: 'rare', weight: 'low' },
      { id: 'time_linked', label: { ar: 'نعم، أكون أكثر إرهاقاً في أوقات معينة (كالصباح أو المساء)', en: 'Yes, I am more fatigued at specific times (like mornings or evenings)' }, value: 'time_linked', weight: 'medium' },
      { id: 'frequent_shifts', label: { ar: 'تتغير بشكل مفاجئ ومتكرر دون سبب محدد', en: 'Shifts suddenly and frequently without a clear reason' }, value: 'frequent_shifts', weight: 'elevated' },
      { id: 'cant_tell', label: { ar: 'لا أستطيع تحديد ذلك بوضوح', en: 'Cannot identify this clearly' }, value: 'cant_tell', weight: 'neutral' },
    ],
  },
];

/**
 * Deterministically select and order adaptive follow-up questions (5-6 questions max).
 * Language-independent logic matching Arabic source of truth exactly.
 *
 * @param {string} text
 * @param {object} initialAnswers - { q_sleep, q_energy, q_social }
 * @param {object} currentFollowUps - { [questionId]: value }
 * @returns {Array<object>} ordered list of active adaptive questions
 */
export function buildAdaptiveQuestionQueue(text = '', initialAnswers = {}, currentFollowUps = {}) {
  const normText = (text || '').toLowerCase();

  const scored = ADAPTIVE_QUESTION_BANK.map((q) => {
    let score = q.priority;

    // Rule 1: Energy & Exhaustion focus
    if (initialAnswers.q_energy === 'low_energy') {
      if (q.category === 'daily_function' || q.category === 'duration') score += 5;
      if (q.category === 'sleep_rest') score += 4;
    }

    // Rule 2: Sleep & Restoration focus
    if (initialAnswers.q_sleep === 'exhausted' || normText.includes('أرق') || normText.includes('نوم') || normText.includes('sleep') || normText.includes('insomnia')) {
      if (q.category === 'sleep_rest') score += 5;
      if (q.category === 'concentration') score += 3;
    } else if (initialAnswers.q_sleep === 'stable') {
      if (q.category === 'sleep_rest') score -= 5;
    }

    // Rule 3: Social connection focus
    if (initialAnswers.q_social === 'withdrawn' || normText.includes('وحدة') || normText.includes('عزلة') || normText.includes('alone') || normText.includes('isolate')) {
      if (q.category === 'social_interaction') score += 5;
    } else if (initialAnswers.q_social === 'connected') {
      if (q.category === 'social_interaction') score -= 6;
    }

    // Rule 4: Work/study impact detected in text
    if (normText.includes('شغل') || normText.includes('عمل') || normText.includes('دراسة') || normText.includes('مذاكرة') || normText.includes('work') || normText.includes('study')) {
      if (q.category === 'daily_function') score += 4;
      if (q.category === 'concentration') score += 3;
    }

    // Rule 5: Dynamic branch based on existing follow-up answers
    if (currentFollowUps.q_duration === 'long_time' || currentFollowUps.q_duration === 'months') {
      if (q.category === 'intensity' || q.category === 'daily_function') score += 3;
    }

    return { ...q, dynamicScore: score };
  });

  const sorted = scored.sort((a, b) => b.dynamicScore - a.dynamicScore);
  return sorted.slice(0, 6);
}

/**
 * Consistency Check Helper
 * Checks for non-judgmental consistency between initial selections and follow-ups.
 * @param {object} initialAnswers
 * @param {object} followUpAnswers
 * @param {string} [lang='ar']
 * @returns {{ isConsistent: boolean, note?: string }}
 */
export function checkAssessmentConsistency(initialAnswers = {}, followUpAnswers = {}, lang = 'ar') {
  if (
    initialAnswers.q_energy === 'low_energy' &&
    followUpAnswers.q_daily_function === 'no_effect' &&
    followUpAnswers.q_intensity === 'mild'
  ) {
    return {
      isConsistent: false,
      note:
        lang === 'en'
          ? 'We observed a slight variance between your energy level and daily functional impact, which will be accounted for within natural uncertainty intervals.'
          : 'لاحظنا تبايناً بسيطاً بين مستوى الطاقة وتأثير المهام اليومية، وسيتم أخذ ذلك في الحسبان ضمن حزام عدم اليقين الطبيعي.',
    };
  }

  return { isConsistent: true };
}

/**
 * Localized string resolver for question categories, question prompts, and options.
 */
export function resolveQuestionText(field, lang = 'ar') {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[lang] || field.ar || '';
}
