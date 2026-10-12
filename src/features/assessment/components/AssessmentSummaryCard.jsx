import { CheckCircle2, Edit3, ArrowLeft, ArrowRight, Sparkles, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { STRUCTURED_QUESTIONS } from '@/services/assessmentService';
import { checkAssessmentConsistency, resolveQuestionText } from '../data/adaptiveQuestionBank';
import { useTranslation } from '@/context/LanguageContext';

/**
 * AssessmentSummaryCard — Shows a cohesive overview of initial inputs and adaptive answers
 * before proceeding to Arabic NLP indicator analysis.
 * Strictly non-diagnostic and educational.
 * Localized for Arabic and English.
 *
 * @param {object} props
 * @param {string} props.inputText
 * @param {Record<string, string>} props.initialAnswers
 * @param {Record<string, string>} props.followUpAnswers
 * @param {Array<object>} props.questions
 * @param {(index: number) => void} props.onEditQuestion
 * @param {() => void} props.onBackToQuestions
 * @param {() => void} props.onBackToInput
 * @param {() => void} props.onProceedToAnalysis
 */
export function AssessmentSummaryCard({
  inputText,
  initialAnswers,
  followUpAnswers,
  questions,
  onEditQuestion,
  onBackToQuestions,
  onBackToInput,
  onProceedToAnalysis,
}) {
  const { t, language } = useTranslation();
  const consistency = checkAssessmentConsistency(initialAnswers, followUpAnswers, language);

  // Helper to find label for initial structured questions
  const getInitialAnswerLabel = (questionId, value) => {
    const q = STRUCTURED_QUESTIONS.find((item) => item.id === questionId);
    if (!q) return value;
    const opt = q.options.find((o) => o.value === value);
    return opt ? resolveQuestionText(opt.label, language) : value;
  };

  // Helper to find label for adaptive questions
  const getAdaptiveAnswerLabel = (question, value) => {
    if (!question || !question.options) return value;
    const opt = question.options.find((o) => o.value === value);
    return opt ? resolveQuestionText(opt.label, language) : value || '—';
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="primary" size="md">
            {t('assessment.summary.badge')}
          </Badge>
          <span className="text-xs text-text-muted">
            {t('assessment.summary.completionCount', {
              answered: Object.keys(followUpAnswers).length,
              total: questions.length,
            })}
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-text-primary">
          {t('assessment.summary.title')}
        </h2>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
          {t('assessment.summary.subtitle')}
        </p>
      </div>

      {/* Consistency Note if applicable */}
      {!consistency.isConsistent && consistency.note && (
        <Alert variant="info" title={language === 'en' ? 'Consistency Note' : 'ملاحظة حول اتساق المؤشرات'}>
          <span>{consistency.note}</span>
        </Alert>
      )}

      {/* 1. User Text Snippet Card */}
      <Card variant="default" padding="md" className="space-y-3 bg-white">
        <div className="flex items-center justify-between border-b border-surface-border pb-2.5">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-teal-600 shrink-0" aria-hidden="true" />
            <h3 className="text-sm font-bold text-text-primary">{t('assessment.summary.textSnippetTitle')}</h3>
            <span className="text-xs text-text-muted">
              ({inputText.trim().length} {language === 'en' ? 'chars' : 'حرفاً'})
            </span>
          </div>
          <button
            type="button"
            onClick={onBackToInput}
            className="text-xs text-teal-700 hover:text-teal-900 font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Edit3 className="h-3 w-3" aria-hidden="true" />
            <span>{t('assessment.summary.editSnippet')}</span>
          </button>
        </div>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed line-clamp-3 bg-slate-50/80 p-3 rounded-lg border border-slate-200">
          «{inputText}»
        </p>
      </Card>

      {/* 2. Initial Structured Answers */}
      <Card variant="default" padding="md" className="space-y-3 bg-white">
        <div className="flex items-center justify-between border-b border-surface-border pb-2.5">
          <h3 className="text-sm font-bold text-text-primary">{t('assessment.summary.bioIndicatorsTitle')}</h3>
          <button
            type="button"
            onClick={onBackToInput}
            className="text-xs text-teal-700 hover:text-teal-900 font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Edit3 className="h-3 w-3" aria-hidden="true" />
            <span>{t('assessment.summary.editBio')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {STRUCTURED_QUESTIONS.map((q) => (
            <div
              key={q.id}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1"
            >
              <span className="text-[11px] font-bold text-text-muted block">
                {resolveQuestionText(q.category, language)}
              </span>
              <span className="text-xs font-semibold text-text-primary block">
                {getInitialAnswerLabel(q.id, initialAnswers[q.id])}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* 3. Follow-up Adaptive Questions Summary */}
      <Card variant="default" padding="md" className="space-y-4 bg-white">
        <div className="flex items-center justify-between border-b border-surface-border pb-2.5">
          <div>
            <h3 className="text-sm font-bold text-text-primary">
              {t('assessment.summary.adaptiveQuestionsTitle')}
            </h3>
            <span className="text-xs text-text-muted">
              {t('assessment.summary.adaptiveQuestionsSubtitle')}
            </span>
          </div>
          <button
            type="button"
            onClick={onBackToQuestions}
            className="text-xs text-teal-700 hover:text-teal-900 font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Edit3 className="h-3 w-3" aria-hidden="true" />
            <span>{t('assessment.summary.reviewQuestions')}</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {questions.map((q, idx) => {
            const answeredVal = followUpAnswers[q.id];
            const answerLabel = getAdaptiveAnswerLabel(q, answeredVal);
            const catLabel = resolveQuestionText(q.categoryLabel, language);
            const prompt = resolveQuestionText(q.question, language);

            return (
              <div
                key={q.id}
                className="p-3.5 rounded-xl border border-surface-border hover:border-teal-200 bg-slate-50/50 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                      {catLabel}
                    </span>
                    <span className="text-xs font-bold text-text-primary">
                      {idx + 1}. {prompt}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-teal-900 font-semibold pr-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" aria-hidden="true" />
                    <span>{answerLabel}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditQuestion(idx)}
                  className="shrink-0 text-xs h-7 px-3 text-text-secondary hover:text-teal-900"
                >
                  <Edit3 className="h-3 w-3" aria-hidden="true" />
                  <span>{t('assessment.summary.editAnswer')}</span>
                </Button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 4. Mandatory Non-Diagnostic Ethical Disclaimer */}
      <Alert variant="disclaimer" title={t('assessment.summary.disclaimerTitle')}>
        <span>{t('assessment.summary.disclaimerBody')}</span>
      </Alert>

      {/* 5. Navigation Controls */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-surface-border">
        <Button
          variant="outline"
          size="md"
          onClick={onBackToQuestions}
          className="w-full sm:w-auto text-xs sm:text-sm gap-2"
        >
          <ArrowRight className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" aria-hidden="true" />
          <span>{t('assessment.summary.backToQuestions')}</span>
        </Button>

        <Button
          variant="primary"
          size="lg"
          onClick={onProceedToAnalysis}
          className="w-full sm:w-auto text-sm sm:text-base px-8 gap-2 shadow-sm"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          <span>{t('assessment.summary.proceedToAnalysis')}</span>
          <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
