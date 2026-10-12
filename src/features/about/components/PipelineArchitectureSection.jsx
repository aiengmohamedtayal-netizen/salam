import { Eye, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useTranslation } from '@/context/LanguageContext';

/**
 * Pipeline Architecture and Explainability (XAI) Component
 * Visualizes the 7-stage end-to-end pipeline:
 * Input -> Arabic NLP -> Feature Extraction -> ML Model -> Indicator -> XAI -> Awareness / Guidance
 */
export function PipelineArchitectureSection() {
  const { t, language } = useTranslation();
  const isEn = language === 'en';

  const PIPELINE_FLOW = [
    {
      num: '01',
      title: 'مدخلات المستخدم',
      titleEn: 'Input Validation',
      desc: isEn
        ? 'Validating text length, ensuring Arabic character presence, and filtering out-of-scope or inadequate inputs.'
        : 'فحص طول النص، ومطابقة اللغة العربية، واستبعاد النصوص غير الكافية أو خارج النطاق.',
    },
    {
      num: '02',
      title: 'معالجة اللهجة والفصحى',
      titleEn: 'Arabic NLP & Normalization',
      desc: isEn
        ? 'Normalizing characters, parsing Egyptian dialectal idioms, and preserving negation and contextual semantics.'
        : 'تطبيع الحروف، وتفكيك العبارات الاصطلاحية المصرية، والتعامل مع النفي والسياق.',
    },
    {
      num: '03',
      title: 'استخلاص السمات',
      titleEn: 'Feature Extraction',
      desc: isEn
        ? 'Extracting distress-indicative lexicon densities and emotional tone representations via character and word n-grams.'
        : 'حساب كثافة المفردات الدالة على الإجهاد، وتحليل نبرة المشاعر عبر n-grams.',
    },
    {
      num: '04',
      title: 'نموذج التعلم الآلي',
      titleEn: 'ML Model Estimation',
      desc: isEn
        ? 'Interpretable baseline model (Logistic Regression) compared against advanced transformer candidate (MARBERTv2).'
        : 'النموذج الأساسي (Logistic Regression) ومقارنته بالمحول المتقدم (MARBERTv2).',
    },
    {
      num: '05',
      title: 'تقدير المؤشر',
      titleEn: 'Indicator & Certainty Band',
      desc: isEn
        ? 'Estimating attention levels with calibrated uncertainty intervals and an ethical abstention option.'
        : 'حساب مستوى الحاجة للتوعية مع إبراز هامش عدم اليقين وإتاحة خيار الامتناع.',
    },
    {
      num: '06',
      title: 'التفسير الدلالي (XAI)',
      titleEn: 'Explainable AI',
      desc: isEn
        ? 'Word-span attribution mapping influential expressions to the indicator without asserting clinical causation.'
        : 'إسناد المقاطع والكلمات المؤثرة (Word-span Attribution) دون ادعاء السببية المطلقة.',
    },
    {
      num: '07',
      title: 'التوجيه ومصادر الدعم',
      titleEn: 'Awareness & Support',
      desc: isEn
        ? 'Presenting curated self-care steps alongside verified, accredited human support hotlines.'
        : 'عرض إرشادات الوعي الذاتي ومصادر الدعم المتخصص المراجعة والمعتمدة مسبقاً.',
    },
  ];

  return (
    <section className="space-y-12">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-surface-border">
        <div>
          <Badge variant="primary" className="mb-2">
            {isEn ? '2. Pipeline & XAI Architecture' : 'خط المعالجة والذكاء الاصطناعي'}
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
            {t('about.pipeline.title')}
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            {t('about.pipeline.subtitle')}
          </p>
        </div>
        <Badge variant="info">
          {isEn ? '7 Sequential Stages' : '٧ خطوات متتالية'}
        </Badge>
      </div>

      {/* Visual Workflow Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PIPELINE_FLOW.map((step, idx) => {
          return (
            <Card
              key={idx}
              variant="default"
              padding="sm"
              className="relative flex flex-col justify-between hover:border-teal-300 hover:shadow-xs transition-all duration-150"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-black text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {step.num}
                  </span>
                  <span className="text-[10px] font-mono text-text-muted">
                    {step.titleEn}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-text-primary">
                  {isEn ? step.titleEn : step.title}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {idx < PIPELINE_FLOW.length - 1 && (
                <div className="pt-2 text-start text-teal-600 hidden lg:block">
                  <ArrowLeft className="h-3.5 w-3.5 ltr:rotate-180 rtl:rotate-0" aria-hidden="true" />
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Deep-Dive Explainable AI Card */}
      <Card variant="elevated" padding="lg" className="bg-slate-900 text-white space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center font-bold">
            <Eye className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-lg font-bold">
              {isEn
                ? 'Explainable Artificial Intelligence (XAI) Philosophy'
                : 'مفهوم الذكاء الاصطناعي المفسَّر (Explainable AI - XAI)'}
            </h3>
            <span className="text-xs text-slate-400">
              {isEn
                ? 'Eliminating the "black-box" dilemma in mental health awareness systems'
                : 'القضاء على مشكلة «الصندوق الأسود» في التطبيقات النفسية التوعوية'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            {isEn
              ? 'In conventional AI tools, users often receive scores without visibility into how conclusions were drawn, causing ambiguity or undue anxiety. In SALAM, mathematical feature attributions are translated into intuitive, non-stigmatizing linguistic explanations.'
              : 'في معظم أنظمة الذكاء الاصطناعي التقليدية، يتلقى المستخدم تقييماً دون معرفة الكيفية التي تم بها استنتاجه، مما يخلق شعوراً بالغموض أو القلق. في «سَـــلام»، نحرص على ترجمة قيم التأثير الرياضية إلى لغة عربية مفهومة.'}
          </p>
          <p>
            {isEn
              ? 'We explain which linguistic expressions were associated with elevated indicators, how tone patterns contributed to the estimate, and what uncertainty margin exists, strictly avoiding clinical diagnostic claims.'
              : 'نوضح للمستخدم أي الكلمات كانت الأكثر دلالة على الإجهاد، وكيف ساهمت نبرة العزلة في رفع المؤشر، وما هو هامش عدم اليقين الطبيعي في التحليل، مع تجنب أي ادعاء بالتشخيص السريري.'}
          </p>
        </div>

        <div className="pt-2 flex flex-wrap gap-4 text-xs text-teal-300">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            <span>{isEn ? 'No opaque black boxes' : 'لا حسابات غامضة أو صناديق سوداء'}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            <span>{isEn ? 'Transparent word contributions' : 'أوزان واضحة لمساهمة الكلمات'}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            <span>{isEn ? 'Uncertainty band for ethical safety' : 'حزام عدم اليقين لضمان الشفافية'}</span>
          </span>
        </div>
      </Card>
    </section>
  );
}
