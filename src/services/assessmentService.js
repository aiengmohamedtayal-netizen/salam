/**
 * @file assessmentService.js
 * Domain service for Arabic NLP mental health awareness and early indicator estimation.
 * STRICT SAFETY RULE: This service NEVER produces a medical or psychiatric diagnosis.
 * All outputs represent educational/exploratory indicators ("مؤشرات أولية استرشادية").
 * Fully bilingual (Arabic & English).
 */

/**
 * Stages of Arabic NLP and Explainability Pipeline.
 */
export const ANALYSIS_STAGES = [
  {
    id: 'stage_preprocess',
    title: {
      ar: 'تجهيز النص وتطبيع اللهجة',
      en: 'Text Preprocessing & Dialect Normalization',
    },
    description: {
      ar: 'معالجة الكلمات وتوحيد الصيغ باللهجة المصرية والفصحى وإزالة الضوضاء اللغوية.',
      en: 'Normalizing vocabulary, Egyptian dialectal idioms, and removing linguistic noise.',
    },
  },
  {
    id: 'stage_features',
    title: {
      ar: 'استخراج الأنماط الدلالية واللغوية',
      en: 'Semantic & Linguistic Feature Extraction',
    },
    description: {
      ar: 'تحليل تكرار الكلمات الدالة على الإجهاد، العزلة، النبرة العاطفية، وزمن التعبير.',
      en: 'Analyzing distress lexicon frequency, communicative tone, and temporal framing.',
    },
  },
  {
    id: 'stage_estimation',
    title: {
      ar: 'تقدير المؤشر الاسترشادي',
      en: 'Exploratory Indicator Estimation',
    },
    description: {
      ar: 'حساب مستوى الحاجة للاهتمام وفق النماذج الإحصائية المدربة.',
      en: 'Estimating the degree of attention warranted based on trained statistical models.',
    },
  },
  {
    id: 'stage_explanation',
    title: {
      ar: 'بناء التفسيرات التوعوية (XAI)',
      en: 'Explainable AI Factor Attribution (XAI)',
    },
    description: {
      ar: 'تحديد العوامل اللغوية الأكثر تأثيراً في النتيجة وصياغة التوصيات الداعمة.',
      en: 'Isolating key influential textual drivers and formulating supportive recommendations.',
    },
  },
];

/**
 * Structured mock questions for initial guided questionnaire.
 */
export const STRUCTURED_QUESTIONS = [
  {
    id: 'q_sleep',
    category: {
      ar: 'النمط الحيوي',
      en: 'Bio-Rhythm',
    },
    question: {
      ar: 'كيف تصف جودة نومك وقدرتك على الاسترخاء خلال الأسبوعين الماضيين؟',
      en: 'How would you describe your sleep quality and ability to relax over the past two weeks?',
    },
    options: [
      {
        value: 'stable',
        label: {
          ar: 'نوم منتظم ومريح غالباً',
          en: 'Generally regular and restful sleep',
        },
      },
      {
        value: 'fluctuating',
        label: {
          ar: 'صعوبة متقطعة في النوم أو استيقاظ متكرر',
          en: 'Intermittent difficulty sleeping or frequent waking',
        },
      },
      {
        value: 'exhausted',
        label: {
          ar: 'أرق مستمر أو شعور بالإجهاد عند الاستيقاظ',
          en: 'Persistent insomnia or waking up fatigued',
        },
      },
    ],
  },
  {
    id: 'q_energy',
    category: {
      ar: 'مستوى الطاقة اليومي',
      en: 'Daily Energy Level',
    },
    question: {
      ar: 'إلى أي مدى تجد طاقة كافية لإنجاز مهامك اليومية الاعتيادية؟',
      en: 'To what extent do you have sufficient energy to accomplish your regular daily tasks?',
    },
    options: [
      {
        value: 'energetic',
        label: {
          ar: 'أتمكن من ممارسة يومي بطاقة جيدة',
          en: 'I manage my day with good energy',
        },
      },
      {
        value: 'moderate',
        label: {
          ar: 'أشعر بالإرهاق أحياناً لكنني أواصل العمل',
          en: 'I feel fatigued sometimes but manage to keep going',
        },
      },
      {
        value: 'low_energy',
        label: {
          ar: 'أشعر بثقل وصعوبة بالغة في بدء المهام البسيطة',
          en: 'I feel heavy fatigue and severe difficulty starting simple tasks',
        },
      },
    ],
  },
  {
    id: 'q_social',
    category: {
      ar: 'التواصل الاجتماعي',
      en: 'Social Interaction',
    },
    question: {
      ar: 'ما مدى رغبتك في التواصل مع العائلة أو الأصدقاء المقربين؟',
      en: 'How open do you feel to communicating with close friends or family?',
    },
    options: [
      {
        value: 'connected',
        label: {
          ar: 'أتواصل بشكل طبيعي ومريح',
          en: 'I connect comfortably and naturally',
        },
      },
      {
        value: 'selective',
        label: {
          ar: 'أفضّل العزلة أحياناً لتجديد طاقتي',
          en: 'I prefer solitude occasionally to recharge',
        },
      },
      {
        value: 'withdrawn',
        label: {
          ar: 'أميل لتجنب التواصل تماماً والشعور بالغربة',
          en: 'I tend to withdraw completely and feel disconnected',
        },
      },
    ],
  },
];

/**
 * Validate input text.
 * @param {string} text
 * @param {string} [lang='ar']
 * @returns {{ isValid: boolean, reason?: string, error?: string }}
 */
export function validateAssessmentInput(text, lang = 'ar') {
  if (!text || !text.trim()) {
    return {
      isValid: false,
      reason: 'empty',
      error:
        lang === 'en'
          ? 'Please enter some words or thoughts in the reflection space before analyzing.'
          : 'يرجى كتابة بعض الكلمات أو المشاعر في المساحة المخصصة قبل بدء التحليل.',
    };
  }

  const trimmed = text.trim();

  // Check code/markup/URL patterns (Out-of-Scope check)
  const isCodeOrMarkup = /<[a-z][\s\S]*>|(\b(function|def|import|var|let|const|class|console\.log|SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|curl|npm|git)\b)|({[\s\S]*})/i.test(trimmed);
  const isPureUrl = /^(https?:\/\/|www\.)\S+$/i.test(trimmed);

  if (isCodeOrMarkup || isPureUrl) {
    return {
      isValid: false,
      reason: 'out_of_scope',
      error:
        lang === 'en'
          ? 'The input appears to be technical code or an external link. SALAM is specifically tailored for reflective personal thoughts and emotional self-expression.'
          : 'يبدو أن النص المدخل كود برمجي أو رابط إلكتروني. نظام سَـــلام مخصص حصرياً للتعبير عن المشاعر والتجارب الإنسانية والاسترشاد بالمؤشرات النفسية.',
    };
  }

  if (trimmed.length < 15) {
    return {
      isValid: false,
      reason: 'too_short',
      error:
        lang === 'en'
          ? 'Input is too short (under 15 characters). Please write a sentence or paragraph describing your feelings for semantic pattern analysis.'
          : 'النص المدخل قصير جداً (أقل من 15 حرفاً). يرجى تقديم جملة أو فقرة تصف شعورك بشكل أفضل للوصول لتحليل دلالي دقيق.',
    };
  }

  // Check repetitive or insufficient characters/words
  const cleanChars = trimmed.replace(/[\s\d\p{P}]/gu, '');
  const uniqueChars = new Set(cleanChars.toLowerCase());
  const words = trimmed.split(/\s+/).filter((w) => w.length > 1);

  if (cleanChars.length >= 10 && uniqueChars.size < 4) {
    return {
      isValid: false,
      reason: 'insufficient',
      error:
        lang === 'en'
          ? 'The entered text consists of repeated characters. Please express your genuine thoughts in words to allow meaningful semantic analysis.'
          : 'النص المدخل يحتوي على حروف مكررة دون معنى دلالي. يرجى التعبير بكلمات وجمل تعكس مشاعرك الحقيقية للوصول لتحليل مفيد.',
    };
  }

  if (words.length < 3) {
    return {
      isValid: false,
      reason: 'insufficient',
      error:
        lang === 'en'
          ? 'Input is insufficient (fewer than 3 distinct words). Please write a brief sentence providing enough context for your feelings.'
          : 'النص غير كافٍ دلالياً (أقل من 3 كلمات). يرجى كتابة جملة بسيطة توفر سياقاً أوضح لما تشعر به.',
    };
  }

  if (trimmed.length > 2500) {
    return {
      isValid: false,
      reason: 'too_long',
      error:
        lang === 'en'
          ? 'Input exceeds the maximum limit (2,500 characters). Please summarize your thoughts to focus on core feelings.'
          : 'النص يتجاوز الحد الأقصى المسموح (2500 حرف). يرجى اختصار النص للتركيز على المشاعر الأساسية.',
    };
  }

  return { isValid: true };
}

/**
 * Analyze Arabic/English text and optional questionnaire responses.
 * Simulates real NLP pipeline progression with realistic explainable output.
 * Fully supports Out-of-Scope and Insufficient-Input (Abstention) safe handling.
 * @param {string} text
 * @param {Record<string, string>} [answers]
 * @param {(stageIndex: number) => void} [onProgress]
 * @param {string} [lang='ar']
 * @returns {Promise<object>}
 */
export async function analyzeTextAssessment(text, answers = {}, onProgress, lang = 'ar') {
  // Stage 1
  if (onProgress) onProgress(0);
  await new Promise((r) => setTimeout(r, 650));

  // Stage 2
  if (onProgress) onProgress(1);
  await new Promise((r) => setTimeout(r, 750));

  // Stage 3
  if (onProgress) onProgress(2);
  await new Promise((r) => setTimeout(r, 700));

  // Stage 4
  if (onProgress) onProgress(3);
  await new Promise((r) => setTimeout(r, 600));

  const normalized = text.toLowerCase().trim();

  // Out-of-Scope check during semantic evaluation
  const outOfScopePhrases = [
    'ماتش الأهلي', 'مباراة', 'سعر الدولار', 'الطقس اليوم', 'نتيجة الثانوية',
    'وصفة كيكة', 'كود بايثون', 'رياضة كرة القدم', 'weather forecast',
    'stock price', 'football match', 'recipe cake', 'solve equation', 'crypto price'
  ];
  const isOutOfScope = outOfScopePhrases.some((phrase) => normalized.includes(phrase));

  if (isOutOfScope) {
    return {
      assessmentId: 'slm_' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      inputLength: text.length,
      level: 'out_of_scope',
      isOutOfScope: true,
      levelTitleAr: 'النص المدخل خارج نطاق التقييم النفسي التوعوي',
      levelTitleEn: 'Input Outside the Scope of Emotional Assessment',
      levelTitle: lang === 'en' ? 'Input Outside the Scope of Emotional Assessment' : 'النص المدخل خارج نطاق التقييم النفسي التوعوي',
      levelColor: 'neutral',
      levelSummaryAr: 'صُمم نظام «سَـــلام» لتحليل التعبيرات الذاتية والمشاعر والضغوط اليومية باللغة العربية. النص المدخل يبدو استفساراً عاماً أو غير مرتبط بالجانب الوجداني والنفسي.',
      levelSummaryEn: 'SALAM is specifically engineered to analyze personal emotional expressions and daily distress patterns. The submitted text appears to be a general inquiry or unrelated to psychological reflection.',
      levelSummary: lang === 'en' ? 'SALAM is specifically engineered to analyze personal emotional expressions and daily distress patterns. The submitted text appears to be a general inquiry or unrelated to psychological reflection.' : 'صُمم نظام «سَـــلام» لتحليل التعبيرات الذاتية والمشاعر والضغوط اليومية باللغة العربية. النص المدخل يبدو استفساراً عاماً أو غير مرتبط بالجانب الوجداني والنفسي.',
      uncertaintyPercentage: 92,
      factors: [],
      recommendations: [
        {
          titleAr: 'التركيز على المشاعر والتجربة الشخصية',
          titleEn: 'Focus on Personal Thoughts & Feelings',
          textAr: 'جرب إعادة كتابة نصك بالتركيز على ما تشعر به داخلياً، مثل الإرهاق، التوتر، جودة النوم، أو التحديات اليومية.',
          textEn: 'Try rewriting your text focusing on internal feelings, such as exhaustion, anxiety, sleep patterns, or daily stressors.',
        },
        {
          titleAr: 'تصفح دليل التوعية الشامل',
          titleEn: 'Explore the Mental Health Awareness Guide',
          textAr: 'يمكنك الاطلاع على صفحة التوعية للتعرف على المؤشرات النفسية الأولية وطرق التعامل مع الضغوط.',
          textEn: 'Browse our awareness library to understand early stress indicators and evidence-based self-care strategies.',
        },
      ],
      disclaimer:
        lang === 'en'
          ? 'This result is an exploratory notice regarding the scope of the system, not a clinical determination. SALAM does not process factual, commercial, or non-reflective inquiries.'
          : 'هذه النتيجة إشعار استرشادي بنطاق عمل النظام وليست تشخيصاً. نظام سَـــلام لا يعالج الاستفسارات العامة أو الحقائق المجردة.',
    };
  }

  // Insufficient / Abstention check during evaluation
  // If words < 4 and no identifiable emotional cues exist in a short snippet
  const words = normalized.split(/\s+/).filter((w) => w.length > 1);
  const highStressWords = ['تعبت', 'مش قادر', 'خنقة', 'مخنوق', 'يأس', 'حزين', 'ضايع', 'هموت', 'وحدة', 'منعزل', 'كئيب', 'سواد', 'مفيش فايدة', 'أرق', 'عاجز', 'tired', 'hopeless', 'exhausted', 'cannot go on', 'depressed', 'suffocated', 'isolated'];
  const moderateStressWords = ['شغل كتير', 'ضغط', 'متوتر', 'قلقان', 'تفكير', 'مش عارف', 'مرهق', 'مجهود', 'صداع', 'ملل', 'stress', 'pressure', 'anxious', 'overthinking', 'worried', 'burnout'];
  const positiveWords = ['الحمد لله', 'متفائل', 'بخير', 'أمل', 'تمام', 'أحسن', 'هتعدي', 'كويس', 'نعمة', 'fine', 'good', 'optimistic', 'hope', 'better', 'grateful'];

  const hasEmotionalCue = [...highStressWords, ...moderateStressWords, ...positiveWords].some((w) => normalized.includes(w));
  if (words.length <= 3 && !hasEmotionalCue && text.length < 35) {
    return {
      assessmentId: 'slm_' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      inputLength: text.length,
      level: 'insufficient',
      isAbstained: true,
      levelTitleAr: 'امتناع استرشادي لعدم كفاية الدلالات التعبيرية',
      levelTitleEn: 'Exploratory Abstention: Insufficient Linguistic Context',
      levelTitle: lang === 'en' ? 'Exploratory Abstention: Insufficient Linguistic Context' : 'امتناع استرشادي لعدم كفاية الدلالات التعبيرية',
      levelColor: 'neutral',
      levelSummaryAr: 'فضل النظام الامتناع عن تقديم مؤشر رقمي استرشادي نظراً لقلة الكلمات الدلالية أو غموض السياق، التزاماً بالأمان العلمي وتجنباً لأي استنتاجات عشوائية أو غير موثوقة.',
      levelSummaryEn: 'The system intentionally refrained from generating an exploratory indicator due to sparse linguistic cues, upholding scientific reliability and preventing arbitrary inferences.',
      levelSummary: lang === 'en' ? 'The system intentionally refrained from generating an exploratory indicator due to sparse linguistic cues, upholding scientific reliability and preventing arbitrary inferences.' : 'فضل النظام الامتناع عن تقديم مؤشر رقمي استرشادي نظراً لقلة الكلمات الدلالية أو غموض السياق، التزاماً بالأمان العلمي وتجنباً لأي استنتاجات عشوائية أو غير موثوقة.',
      uncertaintyPercentage: 78,
      factors: [],
      recommendations: [
        {
          titleAr: 'التوسع في التعبير الحر',
          titleEn: 'Elaborate on Your Reflection',
          textAr: 'اكتب سطرين أو ثلاثة إضافية تصف ما يدور في ذهنك بالتفصيل، وكيف كان أسبوعك ومستوى نشاطك وتواصلك مع الآخرين.',
          textEn: 'Write two or three additional sentences detailing what is on your mind, how your week was, and your interactions with others.',
        },
        {
          titleAr: 'التحدث مع شخص مقرب أو طلب الدعم المباشر',
          titleEn: 'Reach Out to Trusted Contacts or Support',
          textAr: 'إذا كنت تشعر بصعوبة في صياغة مشاعرك كتابياً، فإن التحدث شفهياً مع شخص موثوق أو الاتصال بالخط الساخن 16328 قد يكون أكثر راحة.',
          textEn: 'If writing your feelings feels difficult, speaking out loud with someone you trust or calling hotline 16328 can bring immediate relief.',
        },
      ],
      disclaimer:
        lang === 'en'
          ? 'Abstention is an intentional safety feature of the SALAM architecture to avoid unreliable automated estimates when input evidence is sparse.'
          : 'الامتناع ميزة أمان مقصودة في معمارية سَـــلام لتفادي التقديرات غير الدقيقة عند شُح الدلالات التعبيرية.',
    };
  }

  // Calculate realistic heuristic indicators based on keywords
  let stressScore = 0;
  highStressWords.forEach((word) => {
    if (normalized.includes(word)) stressScore += 2;
  });
  moderateStressWords.forEach((word) => {
    if (normalized.includes(word)) stressScore += 1;
  });
  positiveWords.forEach((word) => {
    if (normalized.includes(word)) stressScore -= 1.5;
  });

  // Factor in answers
  if (answers.q_sleep === 'exhausted') stressScore += 1.5;
  if (answers.q_energy === 'low_energy') stressScore += 1.5;
  if (answers.q_social === 'withdrawn') stressScore += 1.5;

  let level = 'low';
  let levelTitleAr = 'مؤشرات معتادة ومستقرة';
  let levelTitleEn = 'Stable and Balanced Expressive Indicators';
  let levelColor = 'safe';
  let levelSummaryAr =
    'الأنماط اللغوية والدلالية في النص تشير إلى توازن عام، مع وجود تعبيرات طبيعية عن ضغوط الحياة المعتادة دون رصد أنماط انغلاق حادة.';
  let levelSummaryEn =
    'Linguistic and semantic patterns suggest overall emotional stability, reflecting ordinary life pressures without acute distress patterns.';

  if (stressScore >= 4) {
    level = 'elevated';
    levelTitleAr = 'مؤشرات مرتفعة تستحق الاهتمام والدعم';
    levelTitleEn = 'Distress Indicators Suggesting Care and Human Support';
    levelColor = 'elevated';
    levelSummaryAr =
      'التحليل اللغوي رصد كثافة في المفردات المعبرة عن الإجهاد النفسي أو الشعور بالثقل والعزلة. هذه النتيجة توعوية وتلفت نظرك إلى أهمية منح نفسك مساحة للراحة والحديث مع شخص مقرب أو استشارة متخصص.';
    levelSummaryEn =
      'Linguistic analysis identified a density of expressions conveying psychological distress, isolation, or heavy exhaustion. We recommend taking these signs seriously and considering professional guidance.';
  } else if (stressScore >= 1.5) {
    level = 'attention';
    levelTitleAr = 'مؤشرات تستحق الانتباه والرعاية';
    levelTitleEn = 'Stress & Pressure Indicators Warranting Attention and Care';
    levelColor = 'attention';
    levelSummaryAr =
      'رصد النموذج بعض علامات التوتر أو الإرهاق الذهني المتراكم. يُنصح بمراجعة روتينك اليومي، وتقليل مصادر الضغط، وممارسة تقنيات التهدئة والتفريغ النفسي.';
    levelSummaryEn =
      'The model detected signs of accumulated stress and mental fatigue. We recommend reviewing daily routines, reducing avoidable stressors, and practicing restorative self-care.';
  }

  // Contributing Factors (Explainable AI - XAI)
  const contributingFactors = [
    {
      id: 'f_lexical_strain',
      nameAr: 'كثافة مفردات الإرهاق والضغط',
      nameEn: 'Distress & Stress Lexicon Density',
      impact: stressScore > 3 ? (lang === 'en' ? 'High' : 'مرتفع') : stressScore > 1 ? (lang === 'en' ? 'Medium' : 'متوسط') : (lang === 'en' ? 'Low' : 'منخفض'),
      impactLevel: stressScore > 3 ? 'high' : stressScore > 1 ? 'medium' : 'low',
      descriptionAr: 'تردد كلمات تعبّر عن التعب الجسدي والذهني وتراكم المسؤوليات اليومية.',
      descriptionEn: 'Frequency of expressions reflecting physical and mental fatigue and accumulated responsibilities.',
      percentageWeight: 38,
    },
    {
      id: 'f_social_connection',
      nameAr: 'نبرة التواصل والعزلة',
      nameEn: 'Communicative Tone & Social Withdrawal',
      impact: answers.q_social === 'withdrawn' ? (lang === 'en' ? 'High' : 'مرتفع') : (lang === 'en' ? 'Medium' : 'متوسط'),
      impactLevel: answers.q_social === 'withdrawn' ? 'high' : 'medium',
      descriptionAr: 'مدى وجود إشارات إلى الرغبة في الابتعاد عن المحيط الاجتماعي أو الشعور بعدم الفهم.',
      descriptionEn: 'Degree of signals indicating a desire to retreat from social environments or feeling misunderstood.',
      percentageWeight: 27,
    },
    {
      id: 'f_emotional_valence',
      nameAr: 'التوازن العاطفي والنظرة المستقبلية',
      nameEn: 'Emotional Valence & Outlook',
      impact: stressScore > 3 ? (lang === 'en' ? 'Medium' : 'متوسط') : (lang === 'en' ? 'Positive' : 'إيجابي'),
      impactLevel: stressScore > 3 ? 'medium' : 'low',
      descriptionAr: 'رصد عبارات التفاؤل والرجاء مقابل تعبيرات الحيرة أو تكرار الأسئلة المغلقة.',
      descriptionEn: 'Balance of hopeful or optimistic expressions versus perplexity or repetitive rumination.',
      percentageWeight: 20,
    },
    {
      id: 'f_temporal_focus',
      nameAr: 'التركيز الزمني للحديث',
      nameEn: 'Temporal Focus of Reflection',
      impact: lang === 'en' ? 'Low' : 'منخفض',
      impactLevel: 'low',
      descriptionAr: 'استخدام صيغ الماضي والاجترار الذهني مقابل التركيز على الحاضر والخطوات العملية.',
      descriptionEn: 'Emphasis on past rumination versus present-oriented coping and practical steps.',
      percentageWeight: 15,
    },
  ];

  // Specific safe guidance tailored to level
  const recommendations = [
    {
      titleAr: 'تنظيم مساحات الراحة والتفريغ',
      titleEn: 'Establish Calm Rest Intervals',
      textAr: 'خصص 15-20 دقيقة يومياً بعيداً عن الشاشات والضغوط لممارسة المشي أو تمارين التنفس العميق.',
      textEn: 'Dedicate 15-20 minutes daily away from screens to engage in mindful walking or deep breathing exercises.',
    },
    {
      titleAr: 'مشاركة المشاعر مع دائرة ثقة',
      titleEn: 'Share Reflections with Trusted Circles',
      textAr: 'التحدث مع صديق أو فرد من العائلة تثق في حكمته يساعد في تخفيف عبء الأفكار الداخلية.',
      textEn: 'Talking openly with a close friend or family member whose judgment you trust helps lighten internal mental weight.',
    },
    {
      titleAr: 'عدم التردد في طلب الدعم المهني',
      titleEn: 'Consider Speaking with a Professional',
      textAr: 'إذا استمر شعور الثقل أو أثر على عملك وعلاقاتك، فالحديث مع أخصائي نفسي مرخص هو خطوة شجاعة وصحية للغاية.',
      textEn: 'If persistent distress interferes with your work or relationships, speaking with a licensed specialist is a wise, proactive step.',
    },
  ];

  return {
    assessmentId: 'slm_' + Math.random().toString(36).substring(2, 9),
    createdAt: new Date().toISOString(),
    inputLength: text.length,
    level,
    levelTitle: lang === 'en' ? levelTitleEn : levelTitleAr,
    levelTitleAr,
    levelTitleEn,
    levelColor,
    levelSummary: lang === 'en' ? levelSummaryEn : levelSummaryAr,
    levelSummaryAr,
    levelSummaryEn,
    uncertaintyPercentage: 18,
    factors: contributingFactors,
    recommendations,
    disclaimer:
      lang === 'en'
        ? 'This result is an exploratory awareness indicator based on natural language processing, not a certified clinical or psychiatric diagnosis. Conducted in an ephemeral, completely private environment.'
        : 'هذه النتيجة مؤشر استرشادي توعوي مبني على معالجة اللغة الطبيعية، وليست تشخيصاً طبياً أو نفسياً معتمداً. تم إجراء التحليل في بيئة خاصة وآمنة تماماً.',
  };
}
