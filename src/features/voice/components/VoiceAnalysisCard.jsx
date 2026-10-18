import { Sparkles, Mic, Play } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { VoiceRecorder } from './VoiceRecorder';
import { useTranslation } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

/**
 * VoiceAnalysisCard Component
 * Complete standalone recording and analysis container for acoustic features.
 *
 * @param {object} props
 * @param {Blob|null} props.audioBlob
 * @param {string|null} props.audioUrl
 * @param {number} props.duration
 * @param {(blob: Blob|null, url: string|null, duration: number) => void} props.onAudioChange
 * @param {() => void} props.onAnalyze
 * @param {boolean} [props.isLoading]
 * @param {string} [props.className]
 */
export function VoiceAnalysisCard({
  audioBlob,
  audioUrl,
  duration,
  onAudioChange,
  onAnalyze,
  isLoading = false,
  className,
}) {
  const { t } = useTranslation();
  const hasRecording = Boolean(audioUrl && duration >= 2);

  return (
    <Card
      variant="default"
      padding="lg"
      className={cn('space-y-6 border border-surface-border bg-surface-card', className)}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-teal-600" aria-hidden="true" />
            <h3 className="text-base font-bold text-text-primary">
              {t('voice.cardTitle')}
            </h3>
          </div>
          <p className="text-xs text-text-muted">
            {t('voice.cardSubtitle')}
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-semibold text-teal-800 self-start sm:self-center">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
          <span>{hasRecording ? t('voice.recordingComplete') : t('voice.badge')}</span>
        </div>
      </div>

      {/* Voice Recorder Component */}
      <VoiceRecorder
        audioBlob={audioBlob}
        audioUrl={audioUrl}
        duration={duration}
        onChange={onAudioChange}
      />

      {/* Action CTA */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-surface-border">
        <p className="text-xs text-text-muted">
          {t('voice.disclaimerShort')}
        </p>

        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={onAnalyze}
          disabled={!hasRecording || isLoading}
          className="w-full sm:w-auto flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4 fill-current" aria-hidden="true" />
          <span>{isLoading ? t('voice.analyzingVoice') : t('voice.analyzeVoice')}</span>
        </Button>
      </div>
    </Card>
  );
}
