import { CheckCircle2, RotateCcw, AlertTriangle, Phone, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ModalityBadge } from './ModalityBadge';
import { ExplanationPanel } from './ExplanationPanel';
import { useTranslation } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

/**
 * MultimodalResult Component
 * Displays the exploratory evaluation findings, Explainability (XAI) panel,
 * and essential ethical disclaimers.
 *
 * @param {object} props
 * @param {'textOnly'|'imageOnly'|'multimodal'} props.modality
 * @param {() => void} props.onReset
 * @param {string} [props.className]
 */
export function MultimodalResult({ modality = 'multimodal', onReset, className }) {
  const { t } = useTranslation();

  return (
    <div className={cn('space-y-6', className)}>
      {/* Top Status Card */}
      <Card
        variant="default"
        padding="md"
        className="border border-surface-border bg-surface-card space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">
                {t('multimodal.results.title')}
              </h3>
              <p className="text-xs text-text-muted">
                {t('multimodal.results.statusReady')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-xs text-text-muted">{t('multimodal.results.modalityUsed')}</span>
            <ModalityBadge modality={modality} />
          </div>
        </div>

        {/* Pending Backend Disclaimer Banner */}
        <div className="p-3.5 rounded-[var(--radius-lg)] bg-teal-500/10 border border-teal-500/20 text-xs text-teal-800 leading-relaxed flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" aria-hidden="true" />
          <p>{t('multimodal.results.pendingBackend')}</p>
        </div>

        {/* Observed Indicators Summary */}
        <div className="space-y-3 pt-1">
          <h4 className="text-xs font-bold text-text-primary">
            {t('multimodal.results.detectedSignalsTitle')}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Text Markers */}
            <div className="p-3 rounded-lg border border-surface-border bg-surface-elevated/40 space-y-1">
              <span className="text-xs font-bold text-teal-700 block">
                {t('multimodal.results.textMarkers')}
              </span>
              <p className="text-[11px] text-text-secondary leading-normal">
                {t('multimodal.results.textMarkersDesc')}
              </p>
            </div>

            {/* Visual Markers */}
            <div className="p-3 rounded-lg border border-surface-border bg-surface-elevated/40 space-y-1">
              <span className="text-xs font-bold text-sky-700 block">
                {t('multimodal.results.visualMarkers')}
              </span>
              <p className="text-[11px] text-text-secondary leading-normal">
                {t('multimodal.results.visualMarkersDesc')}
              </p>
            </div>

            {/* Fusion Markers */}
            <div className="p-3 rounded-lg border border-surface-border bg-surface-elevated/40 space-y-1">
              <span className="text-xs font-bold text-amber-700 block">
                {t('multimodal.results.fusionMarkers')}
              </span>
              <p className="text-[11px] text-text-secondary leading-normal">
                {t('multimodal.results.fusionMarkersDesc')}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Explainability (XAI) Panel */}
      <ExplanationPanel modality={modality} />

      {/* Safety & Hotline Guidance Callout */}
      <div className="p-4 rounded-[var(--radius-xl)] bg-amber-500/10 border border-amber-500/30 space-y-2">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />
          <span>تنبيه علمي وأخلاقي</span>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed">
          {t('multimodal.results.disclaimerNotice')}
        </p>
        <div className="flex items-center gap-2 pt-1 text-xs text-teal-800 font-semibold">
          <Phone className="w-3.5 h-3.5 text-teal-700 shrink-0" aria-hidden="true" />
          <span>{t('multimodal.results.hotlineAdvice')}</span>
        </div>
      </div>

      {/* Reset Action */}
      <div className="flex justify-center pt-2">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={onReset}
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          <span>{t('multimodal.resetCta')}</span>
        </Button>
      </div>
    </div>
  );
}
