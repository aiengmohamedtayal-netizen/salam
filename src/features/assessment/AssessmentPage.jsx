import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain,
  Sparkles,
  Lock,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Send,
  Loader2,
  Phone,
  HeartHandshake,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { FormField } from '@/components/forms/FormField';
import { FormActions } from '@/components/forms/FormActions';
import { ErrorState } from '@/components/feedback/ErrorState';
import { AssessmentResultView } from './AssessmentResultView';
import { AdaptiveAssessmentUI } from './components/AdaptiveAssessmentUI';
import {
  ANALYSIS_STAGES,
  STRUCTURED_QUESTIONS,
  validateAssessmentInput,
  analyzeTextAssessment,
} from '@/services/assessmentService';
import { resolveQuestionText } from './data/adaptiveQuestionBank';
import { fadeUp, safeMotion } from '@/lib/motion';
import { useTranslation } from '@/context/LanguageContext';

export function AssessmentPage() {
  const { t, language } = useTranslation();

  // Step state: 'onboarding' | 'input' | 'adaptive' | 'analyzing' | 'results' | 'error'
  const [step, setStep] = useState('onboarding');
  const [consentGiven, setConsentGiven] = useState(false);

  // Form states
  const [inputText, setInputText] = useState('');
  const [answers, setAnswers] = useState({
    q_sleep: 'fluctuating',
    q_energy: 'moderate',
    q_social: 'selective',
  });
  const [finalCombinedAnswers, setFinalCombinedAnswers] = useState(null);
  const [validationError, setValidationError] = useState('');

  // Analysis progress & result states
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [resultData, setResultData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const samplePrompts = t('assessment.input.samples') || [];

  // Handler: Start from Onboarding
  const handleProceedFromOnboarding = () => {
    if (!consentGiven) {
      setValidationError(t('assessment.onboarding.consentError'));
      return;
    }
    setValidationError('');
    setStep('input');
  };

  // Handler: Transition to Adaptive Questions Flow
  const handleProceedToAdaptive = () => {
    const validation = validateAssessmentInput(inputText, language);
    if (!validation.isValid) {
      setValidationError(validation.error);
      return;
    }

    setValidationError('');
    setStep('adaptive');
  };

  // Handler: Start Analysis with combined inputs
  const handleStartAnalysis = async (allAnswers) => {
    const answersToUse = allAnswers || finalCombinedAnswers || answers;
    setFinalCombinedAnswers(answersToUse);
    setValidationError('');
    setStep('analyzing');
    setCurrentStageIndex(0);

    try {
      const result = await analyzeTextAssessment(
        inputText,
        answersToUse,
        (stageIdx) => {
          setCurrentStageIndex(stageIdx);
        },
        language
      );
      setResultData(result);
      setStep('results');
    } catch {
      setErrorMessage(t('assessment.error.generic'));
      setStep('error');
    }
  };

  // Handler: Reset flow
  const handleReset = () => {
    setInputText('');
    setResultData(null);
    setValidationError('');
    setFinalCombinedAnswers(null);
    setStep('input');
  };

  return (
    <div className="py-8 sm:py-14 bg-surface-bg min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* ==========================================================
            PERSISTENT CRISIS & SUPPORT BAR (Always accessible)
            ========================================================== */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center gap-2">
            <HeartHandshake className="h-4 w-4 text-teal-400 shrink-0" aria-hidden="true" />
            <span className="font-medium text-slate-200">{t('assessment.quickCrisisBar.label')}</span>
            <span className="hidden md:inline-block px-2 py-0.5 rounded-full bg-teal-900/80 text-[11px] text-teal-300 font-semibold border border-teal-800">
              {t('assessment.quickCrisisBar.hotlineBadge')}
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="tel:16328"
              className="font-bold text-teal-400 hover:text-teal-300 underline underline-offset-4 flex items-center gap-1.5 focus:outline-hidden"
            >
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t('assessment.quickCrisisBar.hotlineAction')}</span>
            </a>
            <span className="text-slate-600">|</span>
            <Link
              to="/support"
              className="text-slate-300 hover:text-white flex items-center gap-1 text-[11px] sm:text-xs"
            >
              <span>{t('assessment.quickCrisisBar.supportCenterAction')}</span>
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* ==========================================================
            STEP 1: ONBOARDING & INFORMED CONSENT
            ========================================================== */}
        {step === 'onboarding' && (
          <motion.div {...safeMotion(fadeUp)} className="space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <Badge variant="primary">{t('assessment.onboarding.badge')}</Badge>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-text-primary">
                {t('assessment.onboarding.title')}
              </h1>
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                {t('assessment.onboarding.subtitle')}
              </p>
            </div>

            <Card variant="default" padding="lg" className="space-y-6 shadow-sm">
              <div className="space-y-4">
                <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
                  <Clock className="h-5 w-5 text-teal-600 shrink-0" aria-hidden="true" />
                  <span>{t('assessment.onboarding.expectTitle')}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-text-secondary">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-bold text-text-primary flex items-center gap-1.5 text-sm">
                      <Clock className="h-4 w-4 text-teal-600 shrink-0" aria-hidden="true" />
                      <span>{t('assessment.onboarding.card1Title')}</span>
                    </span>
                    <span>{t('assessment.onboarding.card1Desc')}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-bold text-text-primary flex items-center gap-1.5 text-sm">
                      <Lock className="h-4 w-4 text-teal-600 shrink-0" aria-hidden="true" />
                      <span>{t('assessment.onboarding.card2Title')}</span>
                    </span>
                    <span>{t('assessment.onboarding.card2Desc')}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-bold text-text-primary flex items-center gap-1.5 text-sm">
                      <Sparkles className="h-4 w-4 text-teal-600 shrink-0" aria-hidden="true" />
                      <span>{t('assessment.onboarding.card3Title')}</span>
                    </span>
                    <span>{t('assessment.onboarding.card3Desc')}</span>
                  </div>
                </div>
              </div>

              {/* Crucial Ethical Disclaimer */}
              <Alert variant="disclaimer" title={t('assessment.onboarding.disclaimerTitle')}>
                <span>{t('assessment.onboarding.disclaimerBody')}</span>
              </Alert>

              {/* Consent Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-3 p-4 rounded-xl bg-teal-50/50 border border-teal-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => {
                      setConsentGiven(e.target.checked);
                      if (e.target.checked) setValidationError('');
                    }}
                    className="mt-1 h-4 w-4 rounded text-teal-600 border-surface-border focus:ring-teal-500 cursor-pointer"
                  />
                  <div className="text-xs text-text-primary leading-relaxed">
                    <span className="font-bold block">
                      {t('assessment.onboarding.consentCheckboxTitle')}
                    </span>
                    <span className="text-text-secondary">
                      {t('assessment.onboarding.consentCheckboxSubtitle')}
                    </span>
                  </div>
                </label>
                {validationError && (
                  <p className="text-xs text-rose-600 font-bold mt-2" role="alert">
                    {validationError}
                  </p>
                )}
              </div>

              <FormActions align="end">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleProceedFromOnboarding}
                  className="w-full sm:w-auto text-base px-8 gap-2"
                >
                  <span>{t('assessment.onboarding.proceedButton')}</span>
                  <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" aria-hidden="true" />
                </Button>
              </FormActions>
            </Card>
          </motion.div>
        )}

        {/* ==========================================================
            STEP 2: ASSESSMENT INPUT EXPERIENCE
            ========================================================== */}
        {step === 'input' && (
          <motion.div {...safeMotion(fadeUp)} className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-surface-border">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-text-primary">
                  {t('assessment.input.title')}
                </h1>
                <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
                  {t('assessment.input.subtitle')}
                </p>
              </div>
              <Badge variant="info" size="sm">
                {t('assessment.input.badgeEncrypted')}
              </Badge>
            </div>

            {/* Example Prompt Chips */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-text-secondary block">
                {t('assessment.input.samplePromptsTitle')}
              </span>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(samplePrompts) &&
                  samplePrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setInputText(prompt.text);
                        setValidationError('');
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg bg-surface-card border border-surface-border hover:border-teal-400 hover:bg-teal-50/50 text-text-secondary hover:text-teal-900 transition-colors cursor-pointer text-start inline-flex items-center gap-1.5"
                    >
                      <Sparkles className="h-3 w-3 text-teal-600 shrink-0" aria-hidden="true" />
                      <span>{prompt.label}</span>
                    </button>
                  ))}
              </div>
            </div>

            {/* Primary Textarea Input */}
            <Card variant="default" padding="lg" className="space-y-6">
              <FormField
                label={t('assessment.input.textareaLabel')}
                required
                helperText={t('assessment.input.textareaHelper')}
                error={validationError}
              >
                <Textarea
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  placeholder={t('assessment.input.textareaPlaceholder')}
                  maxLength={2500}
                  showCount
                  className="min-h-[160px] text-base leading-relaxed"
                />
              </FormField>

              {/* Optional Structured Quick Questions */}
              <div className="pt-4 border-t border-surface-border space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-text-primary">
                    {t('assessment.input.quickQuestionsTitle')}
                  </h3>
                  <span className="text-xs text-text-muted">
                    {t('assessment.input.quickQuestionsSubtitle')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {STRUCTURED_QUESTIONS.map((q) => {
                    const categoryLabel = resolveQuestionText(q.category, language);
                    return (
                      <div
                        key={q.id}
                        className="p-3.5 rounded-xl bg-slate-50/70 border border-surface-border space-y-2"
                      >
                        <span className="text-xs font-bold text-text-primary block">
                          {categoryLabel}
                        </span>
                        <select
                          value={answers[q.id]}
                          onChange={(e) =>
                            setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                          }
                          className="w-full text-xs p-2 rounded-lg bg-white border border-surface-border text-text-primary focus:outline-none focus:ring-1 focus:ring-teal-500"
                        >
                          {q.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {resolveQuestionText(opt.label, language)}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Form Action Controls */}
              <FormActions align="between" stickyMobile>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => {
                    setInputText('');
                    setValidationError('');
                  }}
                  disabled={!inputText}
                >
                  {t('assessment.input.clearButton')}
                </Button>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleProceedToAdaptive}
                  className="gap-2 px-8"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  <span>{t('assessment.input.submitButton')}</span>
                </Button>
              </FormActions>
            </Card>
          </motion.div>
        )}

        {/* ==========================================================
            STEP 3: SMART ADAPTIVE QUESTIONS & SUMMARY
            ========================================================== */}
        {step === 'adaptive' && (
          <AdaptiveAssessmentUI
            inputText={inputText}
            initialAnswers={answers}
            onComplete={handleStartAnalysis}
            onBackToInput={() => setStep('input')}
          />
        )}

        {/* ==========================================================
            STEP 4: AI ANALYSIS PROGRESS STATE
            ========================================================== */}
        {step === 'analyzing' && (
          <motion.div {...safeMotion(fadeUp)} className="space-y-6 max-w-lg mx-auto py-8">
            <Card variant="elevated" padding="lg" className="text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 mx-auto">
                <Brain className="h-8 w-8 animate-pulse" aria-hidden="true" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-text-primary">
                  {t('assessment.analyzing.title')}
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  {t('assessment.analyzing.subtitle')}
                </p>
              </div>

              {/* Truthful Stage Progression */}
              <div className="space-y-3 text-start">
                {ANALYSIS_STAGES.map((stage, idx) => {
                  const isCompleted = idx < currentStageIndex;
                  const isCurrent = idx === currentStageIndex;
                  const stageTitle = resolveQuestionText(stage.title, language);
                  const stageDesc = resolveQuestionText(stage.description, language);

                  return (
                    <div
                      key={stage.id}
                      className={`p-3 rounded-xl border text-xs transition-all duration-300 flex items-start gap-3 ${
                        isCurrent
                          ? 'bg-teal-50/80 border-teal-300 text-teal-950 font-bold shadow-xs'
                          : isCompleted
                          ? 'bg-emerald-50/40 border-emerald-200 text-emerald-950 opacity-90'
                          : 'bg-slate-50/50 border-slate-200 text-slate-400 opacity-60'
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                        ) : isCurrent ? (
                          <Loader2 className="h-4 w-4 text-teal-600 animate-spin" aria-hidden="true" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="block">{stageTitle}</span>
                        <span className="text-[11px] font-normal opacity-80 block mt-0.5">
                          {stageDesc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <span className="text-[11px] text-text-muted block">
                {t('assessment.analyzing.waitNote')}
              </span>
            </Card>
          </motion.div>
        )}

        {/* ==========================================================
            STEP 5: RESULTS & EXPLAINABLE AI
            ========================================================== */}
        {step === 'results' && resultData && (
          <AssessmentResultView result={resultData} onReset={handleReset} />
        )}

        {/* ==========================================================
            STEP 6: ERROR STATE (With persistent safety & hotlines)
            ========================================================== */}
        {step === 'error' && (
          <div className="space-y-6">
            <ErrorState
              title={t('assessment.error.title')}
              message={errorMessage || t('assessment.error.generic')}
              onRetry={() => handleStartAnalysis(finalCombinedAnswers)}
              retryLabel={t('assessment.error.retry')}
              secondaryAction={
                <Button variant="outline" size="md" onClick={() => setStep('input')}>
                  {t('assessment.error.backToInput')}
                </Button>
              }
            />

            {/* Mandatory Top Safety Disclaimer even during technical failure */}
            <Alert variant="disclaimer" title={t('assessment.onboarding.disclaimerTitle')}>
              <span>{t('assessment.onboarding.disclaimerBody')}</span>
            </Alert>

            {/* Unbroken Human Support Guarantee Card */}
            <Card variant="default" padding="lg" className="border-teal-200 bg-teal-50/40 space-y-4">
              <div className="flex items-center gap-2 text-teal-900 font-bold text-base">
                <HeartHandshake className="h-5 w-5 text-teal-700 shrink-0" aria-hidden="true" />
                <span>{t('assessment.errorFallbackSupport.title')}</span>
              </div>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                {t('assessment.errorFallbackSupport.body')}
              </p>

              <div className="p-4 rounded-xl bg-white border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-text-muted block">
                    {t('assessment.errorFallbackSupport.hotlineLabel')}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-teal-900 font-mono tracking-wider">
                      {t('assessment.errorFallbackSupport.hotlineNumber')}
                    </span>
                    <Badge variant="safe" size="sm">
                      {t('assessment.errorFallbackSupport.hotlineAvailable')}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a href="tel:16328">
                    <Button variant="primary" size="md" className="gap-2 bg-teal-700 hover:bg-teal-800">
                      <Phone className="h-4 w-4" aria-hidden="true" />
                      <span>{t('assessment.quickCrisisBar.hotlineAction')}</span>
                    </Button>
                  </a>
                  <Link to="/support">
                    <Button variant="outline" size="md">
                      <span>{t('assessment.quickCrisisBar.supportCenterAction')}</span>
                    </Button>
                  </Link>
                </div>
              </div>

              <span className="text-xs text-teal-800 font-medium block">
                {t('assessment.errorFallbackSupport.preservedNote')}
              </span>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
