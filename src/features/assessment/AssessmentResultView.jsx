import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RotateCcw,
  Sparkles,
  HeartHandshake,
  CheckCircle,
  Copy,
  Check,
  Info,
  ExternalLink,
  Edit3,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Progress } from '@/components/ui/Progress';
import { fadeUp, safeMotion } from '@/lib/motion';
import { useTranslation } from '@/context/LanguageContext';

/**
 * AssessmentResultView — Renders the non-diagnostic indicator level, Explainable AI factors,
 * model uncertainty, and support recommendations.
 * Localized for Arabic and English.
 * Supports out-of-scope and insufficient-input (abstention) safe handling.
 *
 * @param {object} props
 * @param {object} props.result
 * @param {() => void} props.onReset
 */
export function AssessmentResultView({ result, onReset }) {
  const [copied, setCopied] = useState(false);
  const { t, language, isAr } = useTranslation();

  const isSpecialState =
    result.level === 'out_of_scope' ||
    result.level === 'insufficient' ||
    result.level === 'abstained';

  const levelBadgeVariants = {
    low: 'safe',
    attention: 'attention',
    elevated: 'elevated',
    out_of_scope: 'neutral',
    insufficient: 'neutral',
    abstained: 'neutral',
  };

  const levelBgColors = {
    low: 'bg-emerald-50/70 border-emerald-200 text-emerald-950',
    attention: 'bg-amber-50/70 border-amber-200 text-amber-950',
    elevated: 'bg-rose-50/70 border-rose-200 text-rose-950',
    out_of_scope: 'bg-slate-50 border-slate-200 text-slate-900',
    insufficient: 'bg-amber-50/50 border-amber-200 text-amber-950',
    abstained: 'bg-amber-50/50 border-amber-200 text-amber-950',
  };

  const levelBadgeText = {
    low: t('assessment.results.levels.low.badge'),
    attention: t('assessment.results.levels.attention.badge'),
    elevated: t('assessment.results.levels.elevated.badge'),
    out_of_scope: t('assessment.outOfScope.badge'),
    insufficient: t('assessment.insufficient.badge'),
    abstained: t('assessment.insufficient.badge'),
  };

  const displayTitle =
    language === 'en'
      ? result.levelTitleEn || t(`assessment.results.levels.${result.level}.title`) || result.levelTitle
      : result.levelTitleAr || t(`assessment.results.levels.${result.level}.title`) || result.levelTitle;

  const displaySummary =
    language === 'en'
      ? result.levelSummaryEn || t(`assessment.results.levels.${result.level}.summary`) || result.levelSummary
      : result.levelSummaryAr || t(`assessment.results.levels.${result.level}.summary`) || result.levelSummary;

  const handleCopySummary = () => {
    const textToCopy = isAr
      ? `نتيجة جلسة سَـــلام التوعوية:
المستوى: ${displayTitle}
الملخص: ${displaySummary}
تنبيه: هذه النتيجة توعوية استرشادية مبنية على الذكاء الاصطناعي وليست تشخيصاً طبياً.`
      : `SALAM Awareness Session Result:
Level: ${displayTitle}
Summary: ${displaySummary}
Notice: This is an educational awareness indicator based on AI, not a clinical diagnosis.`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* 1. Mandatory Top Safety Disclaimer */}
      <motion.div {...safeMotion(fadeUp)}>
        <Alert variant="disclaimer" title={t('assessment.results.topDisclaimerTitle')}>
          <span>{result.disclaimer}</span>
        </Alert>
      </motion.div>

      {/* Special State: Out of Scope */}
      {result.level === 'out_of_scope' && (
        <motion.div {...safeMotion(fadeUp)}>
          <Card
            variant="default"
            padding="lg"
            className="border-2 border-slate-300 shadow-md bg-surface-card space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="neutral" size="md">
                    {t('assessment.outOfScope.badge')}
                  </Badge>
                  <span className="text-xs text-text-muted">{t('assessment.results.exploratoryBadge')}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-text-primary leading-snug">
                  {t('assessment.outOfScope.title')}
                </h2>
              </div>
              <Button variant="outline" size="sm" onClick={onReset} className="self-start sm:self-auto">
                <Edit3 className="h-4 w-4" aria-hidden="true" />
                <span>{t('assessment.outOfScope.editText')}</span>
              </Button>
            </div>

            <p className="text-base text-text-secondary leading-relaxed font-medium">
              {t('assessment.outOfScope.description')}
            </p>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-text-primary flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-teal-600" aria-hidden="true" />
                <span>{t('assessment.outOfScope.scopeTitle')}</span>
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-text-secondary">
                <div className="p-3 rounded-lg bg-white border border-emerald-200">
                  <span className="font-bold text-emerald-800 block mb-1">
                    {isAr ? 'المواضيع المدعومة' : 'Supported Themes'}
                  </span>
                  <span>{t('assessment.outOfScope.supported')}</span>
                </div>
                <div className="p-3 rounded-lg bg-white border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-1">
                    {isAr ? 'خارج النطاق' : 'Outside System Scope'}
                  </span>
                  <span>{t('assessment.outOfScope.notSupported')}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button variant="primary" size="md" onClick={onReset} className="gap-2">
                <Edit3 className="h-4 w-4" aria-hidden="true" />
                <span>{t('assessment.outOfScope.editText')}</span>
              </Button>
              <Link to="/awareness">
                <Button variant="outline" size="md" className="gap-2">
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                  <span>{t('assessment.outOfScope.exploreGuide')}</span>
                </Button>
              </Link>
              <Link to="/">
                <Button variant="ghost" size="md">
                  <span>{t('assessment.outOfScope.backHome')}</span>
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Special State: Insufficient Input / Abstention */}
      {(result.level === 'insufficient' || result.level === 'abstained') && (
        <motion.div {...safeMotion(fadeUp)}>
          <Card
            variant="default"
            padding="lg"
            className="border-2 border-amber-200 shadow-md bg-amber-50/30 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-amber-200/60">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="attention" size="md">
                    {t('assessment.insufficient.badge')}
                  </Badge>
                  <span className="text-xs text-text-muted">{t('assessment.results.exploratoryBadge')}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-text-primary leading-snug">
                  {t('assessment.insufficient.title')}
                </h2>
              </div>
              <Button variant="outline" size="sm" onClick={onReset} className="self-start sm:self-auto bg-white">
                <Edit3 className="h-4 w-4" aria-hidden="true" />
                <span>{t('assessment.insufficient.editText')}</span>
              </Button>
            </div>

            <p className="text-base text-text-secondary leading-relaxed font-medium">
              {t('assessment.insufficient.description')}
            </p>

            <div className="p-4 rounded-xl bg-white/90 border border-amber-200 space-y-3">
              <span className="text-xs font-bold text-amber-950 flex items-center gap-2">
                <Info className="h-4 w-4 text-amber-600" aria-hidden="true" />
                <span>{t('assessment.insufficient.suggestionsTitle')}</span>
              </span>
              <ul className="space-y-2 text-xs text-text-secondary list-disc list-inside">
                <li>{t('assessment.insufficient.suggestion1')}</li>
                <li>{t('assessment.insufficient.suggestion2')}</li>
                <li>{t('assessment.insufficient.suggestion3')}</li>
              </ul>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button variant="primary" size="md" onClick={onReset} className="gap-2">
                <Edit3 className="h-4 w-4" aria-hidden="true" />
                <span>{t('assessment.insufficient.editText')}</span>
              </Button>
              <Link to="/support">
                <Button variant="outline" size="md" className="gap-2 bg-white">
                  <HeartHandshake className="h-4 w-4 text-rose-600" aria-hidden="true" />
                  <span>{t('assessment.insufficient.contactSupport')}</span>
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Standard Indicators: Low, Attention, Elevated */}
      {!isSpecialState && (
        <motion.div {...safeMotion(fadeUp)}>
          <Card
            variant="default"
            padding="lg"
            className={`border-2 shadow-md ${levelBgColors[result.level] || 'bg-surface-card'}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border/50">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={levelBadgeVariants[result.level]} size="md">
                    {levelBadgeText[result.level]}
                  </Badge>
                  <span className="text-xs text-text-muted">{t('assessment.results.exploratoryBadge')}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-text-primary leading-snug">
                  {displayTitle}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopySummary}
                  className="bg-white/80"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                      <span>{t('assessment.results.copiedSuccess')}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" aria-hidden="true" />
                      <span>{t('assessment.results.copySummary')}</span>
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReset}
                  className="bg-white/80"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  <span>{t('assessment.results.resetSession')}</span>
                </Button>
              </div>
            </div>

            <div className="pt-6 space-y-4">
              <p className="text-base sm:text-lg text-text-secondary leading-relaxed font-medium">
                {displaySummary}
              </p>

              {/* Model uncertainty note */}
              <div className="p-3.5 rounded-xl bg-white/70 border border-surface-border/70 flex items-start gap-2.5 text-xs text-text-secondary">
                <Info className="h-4 w-4 text-teal-700 shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  <strong>{t('assessment.results.disclaimerNoteTitle')}</strong>{' '}
                  {language === 'en' ? (
                    <>
                      This analysis carries an estimated uncertainty factor of approx.{' '}
                      <span className="font-bold text-text-primary">%{result.uncertaintyPercentage}</span> due to the inherent richness of human linguistic expression; it should be valued as an exploratory observation rather than a definitive determination.
                    </>
                  ) : (
                    <>
                      يحمل هذا التحليل نسبة عدم يقين تقديرية تبلغ قرابة{' '}
                      <span className="font-bold text-text-primary">%{result.uncertaintyPercentage}</span> نظراً لطبيعة التنوع البشري في التعبير اللغوي؛ ولذلك يُعتد به كملاحظة توعوية وليس حكماً حتمياً.
                    </>
                  )}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* 3. Explainable AI (XAI) Breakdown */}
      {!isSpecialState && result.factors && result.factors.length > 0 && (
        <motion.div {...safeMotion(fadeUp)} className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-text-primary">
                {t('assessment.results.xaiFactorsTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
                {t('assessment.results.xaiFactorsSubtitle')}
              </p>
            </div>
            <Badge variant="primary" size="sm">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              <span>XAI</span>
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.factors.map((factor) => {
              const factorName = language === 'en' ? factor.nameEn || factor.nameAr : factor.nameAr;
              const factorDesc = language === 'en' ? factor.descriptionEn || factor.descriptionAr : factor.descriptionAr;

              return (
                <Card key={factor.id} variant="default" padding="md" className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-sm text-text-primary">{factorName}</h4>
                    <Badge
                      variant={
                        factor.impactLevel === 'high'
                          ? 'elevated'
                          : factor.impactLevel === 'medium'
                          ? 'attention'
                          : 'safe'
                      }
                      size="sm"
                    >
                      {language === 'en' ? `${factor.impact} Impact` : `تأثير ${factor.impact}`}
                    </Badge>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed">
                    {factorDesc}
                  </p>

                  <div className="pt-1">
                    <Progress
                      value={factor.percentageWeight}
                      size="sm"
                      color={
                        factor.impactLevel === 'high'
                          ? 'elevated'
                          : factor.impactLevel === 'medium'
                          ? 'attention'
                          : 'safe'
                      }
                      label={language === 'en' ? 'Relative Weight' : 'الوزن النسبي في التحليل'}
                      showValue
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* 4. Actionable Next Steps & Care Recommendations */}
      {!isSpecialState && result.recommendations && result.recommendations.length > 0 && (
        <motion.div {...safeMotion(fadeUp)} className="space-y-4">
          <h3 className="text-xl font-bold text-text-primary">
            {t('assessment.results.recommendationsTitle')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {result.recommendations.map((rec, idx) => {
              const recTitle = language === 'en' ? rec.titleEn || rec.titleAr : rec.titleAr;
              const recText = language === 'en' ? rec.textEn || rec.textAr : rec.textAr;

              return (
                <Card key={idx} variant="default" padding="md" className="space-y-2 bg-teal-50/30 border-teal-100">
                  <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
                    <CheckCircle className="h-4 w-4 shrink-0 text-teal-600" aria-hidden="true" />
                    <span>{recTitle}</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {recText}
                  </p>
                </Card>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* 5. Safe Referral Gateway */}
      <motion.div {...safeMotion(fadeUp)}>
        <Card variant="elevated" padding="lg" className="bg-slate-900 text-white border-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                <HeartHandshake className="h-5 w-5" aria-hidden="true" />
                <span>
                  {language === 'en'
                    ? 'Need to speak with a licensed specialist?'
                    : 'هل تحتاج للحديث مع مختص معتمد؟'}
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {language === 'en'
                  ? 'Regardless of the result, compassionate human consultation is the most grounded path to unpack distress and establish sustainable coping strategies.'
                  : 'مهما كانت النتيجة، فإن الاستماع الإنساني المتخصص هو الخيار الأعمق والأضمن لتفكيك الضغوط وبناء استراتيجيات تعافي مستدامة.'}
              </p>
            </div>

            <Link to="/support" className="shrink-0 w-full sm:w-auto">
              <Button
                variant="primary"
                size="md"
                className="w-full sm:w-auto bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold gap-2"
              >
                <span>{t('nav.support')}</span>
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
