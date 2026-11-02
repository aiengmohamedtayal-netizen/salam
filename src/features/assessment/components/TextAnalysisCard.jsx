import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  Loader2,
  RotateCcw,
  Shield,
  Phone,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Activity,
  Info,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/utils';
import { fadeUp, safeMotion } from '@/lib/motion';
import { useTranslation } from '@/context/LanguageContext';

// API boundary keeps provider details and credentials out of the browser UI.
import { analyzeText } from '@/services/amalApi';

/**
 * TextAnalysisCard Component
 * Isolated UI component for analyzing Arabic user reflection text.
 * Strictly decoupled from LLM APIs, prompts, or credentials.
 * Calls ONLY the abstract analyzeText interface.
 */
export function TextAnalysisCard({ className, onComplete }) {
  const { isAr, t } = useTranslation();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [clientError, setClientError] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!isLoading) return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isLoading]);

  const getLoadingStepInfo = (sec) => {
    return {
      text: sec < 1 ? t('assessment.directAnalysis.loadingFirst') : t('assessment.directAnalysis.loadingLater'),
    };
  };

  const samplePrompts = [0, 1, 2].map((index) => ({
    label: t(`assessment.directAnalysis.samples.${index}`),
    text: t(`assessment.directAnalysis.sampleTexts.${index}`),
  }));

  // Visual variants for indicator levels
  const levelConfig = {
    minimal: {
      badgeVariant: 'safe',
      badgeTextAr: 'مؤشرات معتادة ومستقرة',
      badgeTextEn: 'Minimal / Stable Indicators',
      bgClass: 'bg-emerald-50/70 border-emerald-200 text-emerald-950',
      iconColor: 'text-emerald-600',
    },
    low: {
      badgeVariant: 'safe',
      badgeTextAr: 'مؤشرات منخفضة',
      badgeTextEn: 'Low Indicators',
      bgClass: 'bg-teal-50/70 border-teal-200 text-teal-950',
      iconColor: 'text-teal-600',
    },
    moderate: {
      badgeVariant: 'attention',
      badgeTextAr: 'مؤشرات تستحق الانتباه',
      badgeTextEn: 'Moderate Attention Indicators',
      bgClass: 'bg-amber-50/70 border-amber-200 text-amber-950',
      iconColor: 'text-amber-600',
    },
    elevated: {
      badgeVariant: 'elevated',
      badgeTextAr: 'مؤشرات مرتفعة تستحق المتابعة',
      badgeTextEn: 'Elevated Support Indicators',
      bgClass: 'bg-rose-50/70 border-rose-200 text-rose-950',
      iconColor: 'text-rose-600',
    },
  };

  const handleStartAnalysis = async () => {
    if (!inputText || inputText.trim().length === 0) {
      setClientError(t('assessment.directAnalysis.emptyError'));
      return;
    }

    setClientError('');
    setElapsedSeconds(0);
    setIsLoading(true);
    setAnalysisResult(null);

    try {
      // The API saves submitted assessments to the signed-in user's history.
      const result = await analyzeText(inputText);
      setAnalysisResult(result);
      if (typeof onComplete === 'function') {
        onComplete(result);
      }
    } catch (error) {
      const message = error?.code === 'MODEL_UNAVAILABLE'
        ? t('assessment.directAnalysis.modelError')
        : t('assessment.directAnalysis.serviceError');
      setClientError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setInputText('');
    setAnalysisResult(null);
    setClientError('');
  };

  const currentLevelInfo =
    analysisResult?.indicator_level && levelConfig[analysisResult.indicator_level]
      ? levelConfig[analysisResult.indicator_level]
      : levelConfig.minimal;
  const confidenceScore = Number.isFinite(analysisResult?.confidence_score)
    ? analysisResult.confidence_score
    : null;

  return (
    <Card
      variant="default"
      padding="lg"
      className={cn('space-y-6 border border-surface-border bg-surface-card shadow-sm', className)}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600" aria-hidden="true" />
            <h2 className="text-lg font-black text-text-primary">
              {t('assessment.directAnalysis.title')}
            </h2>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            {t('assessment.directAnalysis.subtitle')}
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-semibold text-teal-800 self-start sm:self-center">
          <Activity className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
          <span>{t('assessment.directAnalysis.serviceBadge')}</span>
        </div>
      </div>

      {/* 2. Mandatory Persistent Safety Disclaimer (Visible at all times) */}
      <Alert variant="disclaimer">
        <div className="flex flex-col gap-0.5 text-start">
          <span className="font-bold text-teal-900 text-xs">
            {t('assessment.directAnalysis.disclaimerTitle')}
          </span>
          <span className="text-[11px] text-teal-950 leading-relaxed">
            {t('assessment.directAnalysis.disclaimerBody')}
          </span>
        </div>
      </Alert>

      {/* 3. Sample Prompts */}
      {!analysisResult && (
        <div className="space-y-2">
          <span className="text-xs font-bold text-text-secondary block text-start">
            {t('assessment.directAnalysis.samplesTitle')}
          </span>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputText(p.text);
                  setClientError('');
                }}
                disabled={isLoading}
                className="text-xs px-3 py-1.5 rounded-lg bg-surface-muted/60 border border-surface-border hover:border-teal-400 hover:bg-teal-50/60 text-text-secondary hover:text-teal-900 transition-colors cursor-pointer text-start flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-teal-600 shrink-0" aria-hidden="true" />
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Textarea Input Area */}
      <div className="space-y-2 text-start">
        <div className="flex items-center justify-between">
          <label htmlFor="amal-user-input" className="text-xs font-bold text-text-primary">
            {t('assessment.directAnalysis.inputLabel')}
          </label>
          <span className="text-[11px] text-text-muted">
            {t('assessment.directAnalysis.charCount', { count: inputText.length })}
          </span>
        </div>

        <Textarea
          id="amal-user-input"
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
            if (clientError) setClientError('');
          }}
          placeholder={t('assessment.directAnalysis.placeholder')}
          maxLength={2500}
          disabled={isLoading}
          className="min-h-[140px] text-base leading-relaxed text-start"
        />

        {clientError && (
          <p className="text-xs text-rose-600 font-bold mt-1" role="alert">
            {clientError}
          </p>
        )}
      </div>

      {/* 5. Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-surface-border">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Shield className="w-4 h-4 text-teal-600 shrink-0" aria-hidden="true" />
          <span>{t('assessment.directAnalysis.savedNotice')}</span>
        </div>

        <div className="flex items-center gap-2">
          {inputText && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={isLoading}
              className="gap-1.5 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t('assessment.directAnalysis.clear')}</span>
            </Button>
          )}

          <Button
            variant="primary"
            size="md"
            onClick={handleStartAnalysis}
            disabled={isLoading || !inputText.trim()}
            className="gap-2 px-6 shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>{t('assessment.directAnalysis.analyzing')}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" aria-hidden="true" />
                <span>{t('assessment.directAnalysis.analyze')}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Real-time Model Progress Feedback */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            role="status"
            aria-live="polite"
            className="p-4 rounded-xl bg-teal-50/80 border border-teal-200/80 space-y-2.5 text-start shadow-xs"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-teal-950 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-teal-700 animate-spin shrink-0" />
                <span>{getLoadingStepInfo(elapsedSeconds).text}</span>
              </span>
              <span className="font-mono text-teal-800 text-[11px] bg-teal-100/70 px-2 py-0.5 rounded-full font-semibold">
                {t('assessment.directAnalysis.seconds', { count: elapsedSeconds })}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-teal-800/90 pt-0.5">
              <span>{t('assessment.directAnalysis.sending')}</span>
              <span className="text-[10px] text-teal-700">{t('assessment.directAnalysis.savedDuringAnalysis')}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. Dynamic Result View Section */}
      <AnimatePresence>
        {analysisResult && (
          <motion.div
            {...safeMotion(fadeUp)}
            className="pt-4 border-t border-surface-border space-y-5 text-start"
          >
            {/* Edge Case: Insufficient Input */}
            {analysisResult.status === 'insufficient_input' && (
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-950 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
                  <span className="font-bold text-sm">{t('assessment.directAnalysis.insufficientTitle')}</span>
                </div>
                <p className="text-xs leading-relaxed text-amber-900">
                  {analysisResult.guidance?.summary ||
                    t('assessment.directAnalysis.insufficientBody')}
                </p>
              </div>
            )}

            {/* Edge Case: Out of Scope */}
            {analysisResult.status === 'out_of_scope' && (
              <div className="p-4 rounded-xl bg-surface-muted border border-surface-border text-text-primary space-y-2">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-text-muted shrink-0" aria-hidden="true" />
                  <span className="font-bold text-sm">{t('assessment.directAnalysis.outOfScopeTitle')}</span>
                </div>
                <p className="text-xs leading-relaxed text-text-secondary">
                  {analysisResult.guidance?.summary ||
                    t('assessment.directAnalysis.outOfScopeBody')}
                </p>
              </div>
            )}

            {/* Edge Case: Error */}
            {analysisResult.status === 'error' && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
                  <span className="font-bold text-sm">{t('assessment.directAnalysis.errorTitle')}</span>
                </div>
                <p className="text-xs leading-relaxed text-rose-900">
                  {analysisResult.guidance?.summary ||
                    t('assessment.directAnalysis.errorBody')}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartAnalysis}
                  className="bg-surface-card text-xs border-rose-500/40"
                >
                  {t('assessment.directAnalysis.retry')}
                </Button>
              </div>
            )}

            {/* Success State: OK */}
            {analysisResult.status === 'ok' && (
              <div className="space-y-5">
                {/* Level Card */}
                <div
                  className={cn(
                    'p-4 sm:p-5 rounded-2xl border transition-all space-y-4 shadow-xs',
                    currentLevelInfo.bgClass
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2
                        className={cn('w-5 h-5 shrink-0', currentLevelInfo.iconColor)}
                        aria-hidden="true"
                      />
                      <div>
                        <span className="text-[11px] font-medium block text-text-muted">
                          {t('assessment.directAnalysis.estimateLabel')}
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-text-primary">
                          {isAr ? currentLevelInfo.badgeTextAr : currentLevelInfo.badgeTextEn}
                        </h3>
                      </div>
                    </div>

                    <Badge variant={currentLevelInfo.badgeVariant} size="md">
                      {isAr ? currentLevelInfo.badgeTextAr : currentLevelInfo.badgeTextEn}
                    </Badge>
                  </div>

                  {/* Confidence Estimation */}
                  {confidenceScore !== null && (
                    <div className="space-y-1.5 pt-2 border-t border-black/5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-text-secondary">
                        {t('assessment.directAnalysis.confidenceLabel')}
                      </span>
                      <span className="font-mono font-bold text-text-primary">
                        {Math.round(confidenceScore * 100)}%
                      </span>
                    </div>
                    <Progress
                      value={Math.round(confidenceScore * 100)}
                      className="h-1.5"
                    />
                    </div>
                  )}
                </div>

                {/* Influenced Spans (XAI keywords detected) */}
                {Array.isArray(analysisResult.influenced_spans) &&
                  analysisResult.influenced_spans.length > 0 && (
                    <div className="space-y-2 p-4 rounded-xl bg-surface-muted/40 border border-surface-border">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-teal-600 shrink-0" aria-hidden="true" />
                        <span className="text-xs font-bold text-text-primary">
                          {t('assessment.directAnalysis.influencedTitle')}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {analysisResult.influenced_spans.map((span, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-md text-xs font-semibold bg-surface-card border border-teal-500/30 text-teal-800 shadow-2xs"
                          >
                            «{span}»
                          </span>
                        ))}
                      </div>
                      <span className="text-[10px] text-text-muted block mt-1">
                        {t('assessment.directAnalysis.influencedNote')}
                      </span>
                    </div>
                  )}

                {/* Guidance Summary */}
                {analysisResult.guidance?.summary && (
                  <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200 text-teal-950 space-y-2">
                    <span className="text-xs font-bold block text-teal-900">
                      {t('assessment.directAnalysis.guidanceTitle')}
                    </span>
                    <p className="text-xs sm:text-sm leading-relaxed text-teal-950">
                      {analysisResult.guidance.summary}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 7. Dedicated Support Contact Card (Available on all results) */}
            <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-teal-300 block">
                  {t('assessment.directAnalysis.supportTitle')}
                </span>
                <span className="text-xs text-slate-300 block">
                  {t('assessment.directAnalysis.supportBody')}
                </span>
              </div>
              <a
                href="tel:16328"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors"
              >
                <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t('assessment.directAnalysis.supportAction')}</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
