/**
 * @file assessmentService.js
 * Domain service for Arabic NLP mental health awareness and early indicator estimation.
 * STRICT SAFETY RULE: This service NEVER produces a medical or psychiatric diagnosis.
 * All outputs represent educational/exploratory indicators ("مؤشرات أولية استرشادية").
 * Fully bilingual (Arabic & English).
 */

import { analyzeGuidedAssessment } from './amalApi';

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
  const isCodeOrMarkup =
    /<[a-z][\s\S]*>|(\b(function|def|import|var|let|const|class|console\.log|SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|curl|npm|git)\b)|({[\s\S]*})/i.test(
      trimmed
    );
  const isPureUrl = /^(https?:\/\/|www\.)\S+$/i.test(trimmed);

  if (isCodeOrMarkup || isPureUrl) {
    return {
      isValid: false,
      reason: 'out_of_scope',
      error:
        lang === 'en'
          ? 'The input appears to be technical code or an external link. AMAL is specifically tailored for reflective personal thoughts and emotional self-expression.'
          : 'يبدو أن النص المدخل كود برمجي أو رابط إلكتروني. نظام أمل مخصص حصرياً للتعبير عن المشاعر والتجارب الإنسانية والاسترشاد بالمؤشرات النفسية.',
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
 * Submit an Arabic/English reflection and optional questionnaire responses to the AMAL API.
 * The API abstains from returning an estimate until a reviewed inference model is configured.
 *
 * @param {string} text
 * @param {Record<string, string>} [answers]
 * @param {(stageIndex: number) => void} [onProgress]
 * @param {string} [lang='ar']
 * @returns {Promise<object>}
 */
export async function analyzeTextAssessment(text, answers = {}, onProgress, lang = 'ar') {
  return await analyzeGuidedAssessment(text, answers, onProgress, lang);
}
