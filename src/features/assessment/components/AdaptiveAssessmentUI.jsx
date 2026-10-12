import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { AssessmentSummaryCard } from './AssessmentSummaryCard';
import { buildAdaptiveQuestionQueue, resolveQuestionText } from '../data/adaptiveQuestionBank';
import { fadeUp, safeMotion } from '@/lib/motion';
import { useTranslation } from '@/context/LanguageContext';

/**
 * AdaptiveAssessmentUI — Multi-step intelligent question flow that adapts based on user's prior answers.
 * Strictly non-diagnostic and educational.
 * Localized for Arabic and English.
 *
 * @param {object} props
 * @param {string} props.inputText - User's written reflection
 * @param {Record<string, string>} props.initialAnswers - { q_sleep, q_energy, q_social }
 * @param {(finalAnswers: Record<string, string>) => void} props.onComplete - Callback when user proceeds to analysis
 * @param {() => void} props.onBackToInput - Callback to return to the initial text input step
 */
export function AdaptiveAssessmentUI({
  inputText = '',
  initialAnswers = {},
  onComplete,
  onBackToInput,
}) {
  const { t, language } = useTranslation();

  // Store adaptive follow-up responses in React state
  const [followUpAnswers, setFollowUpAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [validationError, setValidationError] = useState('');
  const [isSummaryView, setIsSummaryView] = useState(false);

  // Deterministically generate curated questions based on initial inputs
  const questions = useMemo(() => {
    return buildAdaptiveQuestionQueue(inputText, initialAnswers, followUpAnswers);
  }, [inputText, initialAnswers, followUpAnswers]);

  const currentQuestion = questions[currentIndex] || questions[0];
  const totalQuestions = questions.length;
  const currentAnswer = followUpAnswers[currentQuestion?.id];

  const progressValue = Math.round(((currentIndex + (currentAnswer ? 1 : 0)) / totalQuestions) * 100);

  // Handle option select
  const handleSelectOption = (optionValue) => {
    setFollowUpAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionValue,
    }));
    if (validationError) {
      setValidationError('');
    }
  };

  // Handle Next button
  const handleNext = () => {
    if (!currentAnswer) {
      setValidationError(t('assessment.adaptive.validationError'));
      return;
    }

    setValidationError('');

    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsSummaryView(true);
    }
  };

  // Handle Previous button
  const handlePrevious = () => {
    setValidationError('');
    if (isSummaryView) {
      setIsSummaryView(false);
      setCurrentIndex(totalQuestions - 1);
      return;
    }

    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      onBackToInput();
    }
  };

  // Edit question from summary
  const handleEditQuestion = (index) => {
    setIsSummaryView(false);
    setCurrentIndex(index);
    setValidationError('');
  };

  // Proceed to final analysis
  const handleProceed = () => {
    onComplete({
      ...initialAnswers,
      ...followUpAnswers,
    });
  };

  const currentCategoryLabel = resolveQuestionText(currentQuestion?.categoryLabel, language);
  const currentQuestionPrompt = resolveQuestionText(currentQuestion?.question, language);

  return (
    <motion.div {...safeMotion(fadeUp)} className="space-y-6 max-w-2xl mx-auto">
      {isSummaryView ? (
        <AssessmentSummaryCard
          inputText={inputText}
          initialAnswers={initialAnswers}
          followUpAnswers={followUpAnswers}
          questions={questions}
          onEditQuestion={handleEditQuestion}
          onBackToQuestions={() => {
            setIsSummaryView(false);
            setCurrentIndex(totalQuestions - 1);
          }}
          onBackToInput={onBackToInput}
          onProceedToAnalysis={handleProceed}
        />
      ) : (
        <div className="space-y-6">
          {/* Header & Meta */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Badge variant="primary" size="md">
                {t('assessment.adaptive.badge')}
              </Badge>
              <span className="text-xs font-bold text-text-secondary bg-slate-100 px-2.5 py-1 rounded-full">
                {t('assessment.adaptive.questionCounter', {
                  current: currentIndex + 1,
                  total: totalQuestions,
                })}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-text-primary">
              {t('assessment.adaptive.title')}
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary">
              {t('assessment.adaptive.subtitle')}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5 bg-white p-3 rounded-xl border border-surface-border">
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span className="font-semibold">{t('assessment.adaptive.progressLabel')}</span>
              <span className="font-bold text-teal-800">{progressValue}%</span>
            </div>
            <Progress value={progressValue} color="primary" size="sm" />
          </div>

          {/* Question Card */}
          <Card variant="default" padding="lg" className="space-y-6 bg-white shadow-xs">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                  {currentCategoryLabel}
                </span>
                <span className="text-xs text-text-muted">
                  {t('assessment.adaptive.contextualBadge')}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-text-primary leading-relaxed">
                {currentQuestionPrompt}
              </h2>
            </div>

            {/* Radio-style Selectable Option Cards */}
            <div
              role="radiogroup"
              aria-label={currentQuestionPrompt}
              className="space-y-2.5"
            >
              {currentQuestion?.options.map((option) => {
                const isSelected = currentAnswer === option.value;
                const optionLabel = resolveQuestionText(option.label, language);

                return (
                  <div
                    key={option.id}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onClick={() => handleSelectOption(option.value)}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        handleSelectOption(option.value);
                      }
                    }}
                    className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none flex items-center justify-between gap-3 text-start focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/70 shadow-sm ring-1 ring-teal-500/30'
                        : 'border-surface-border bg-surface-card hover:border-teal-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'border-teal-600 bg-teal-600'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span
                        className={`text-xs sm:text-sm leading-relaxed ${
                          isSelected
                            ? 'font-bold text-teal-950'
                            : 'font-medium text-text-primary'
                        }`}
                      >
                        {optionLabel}
                      </span>
                    </div>

                    {isSelected && (
                      <CheckCircle2
                        className="h-4 w-4 text-teal-600 shrink-0"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Validation Error Message */}
            {validationError && (
              <div
                className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold"
                role="alert"
              >
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Informative Micro-Notice */}
            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200 text-[11px] text-text-muted flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{t('assessment.adaptive.privacyNote')}</span>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-surface-border">
              <Button
                variant="outline"
                size="md"
                onClick={handlePrevious}
                className="gap-2 text-xs sm:text-sm text-text-secondary"
              >
                <ArrowRight className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" aria-hidden="true" />
                <span>
                  {currentIndex === 0
                    ? t('assessment.adaptive.backToInputButton')
                    : t('assessment.adaptive.prevButton')}
                </span>
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleNext}
                  className="gap-2 px-6 text-xs sm:text-sm"
                >
                  <span>
                    {currentIndex === totalQuestions - 1
                      ? t('assessment.adaptive.reviewSummaryButton')
                      : t('assessment.adaptive.nextButton')}
                  </span>
                  <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </motion.div>
  );
}
