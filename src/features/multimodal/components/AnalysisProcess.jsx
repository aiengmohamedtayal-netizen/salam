import { Loader2 } from 'lucide-react';
import { SalamNeuralNetwork } from '@/components/three/SalamNeuralNetwork';
import { useTranslation } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

/** Displays an in-flight API request without implying that inference stages completed. */
export function AnalysisProcess({ className }) {
  const { t } = useTranslation();

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center p-8 rounded-[var(--radius-xl)] border border-surface-border bg-surface-card shadow-sm space-y-6',
        className
      )}
    >
      <div className="w-full max-w-sm h-52 relative flex items-center justify-center">
        <SalamNeuralNetwork state="processing" className="w-full h-full" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-bold text-text-primary">{t('multimodal.analyzingCta')}</h3>
        <p className="text-xs text-text-muted">{t('multimodal.apiWaiting')}</p>
      </div>
      <Loader2 className="h-5 w-5 animate-spin text-teal-700" aria-hidden="true" />
    </div>
  );
}
