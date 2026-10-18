import { Mic, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

/**
 * Format seconds into MM:SS format.
 */
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const MAX_RECORDING_SECONDS = 60;

/**
 * VoiceRecorderControls Component
 * Renders the primary recording button, live elapsed timer, and limit progress bar.
 *
 * @param {object} props
 * @param {'idle'|'requesting_permission'|'recording'|'recorded'} props.status
 * @param {number} props.secondsElapsed
 * @param {() => void} props.onStart
 * @param {() => void} props.onStop
 * @param {boolean} [props.disabled]
 * @param {string} [props.className]
 */
export function VoiceRecorderControls({
  status,
  secondsElapsed,
  onStart,
  onStop,
  disabled = false,
  className,
}) {
  const { t } = useTranslation();
  const isRecording = status === 'recording';
  const isRequesting = status === 'requesting_permission';

  const progressPercent = Math.min(100, (secondsElapsed / MAX_RECORDING_SECONDS) * 100);

  return (
    <div className={cn('flex flex-col items-center gap-4 w-full', className)}>
      {/* Timer & Status Indicator */}
      {isRecording && (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span>{t('voice.recording')}</span>
            <span className="font-mono text-sm font-bold text-text-primary ml-1 rtl:ml-0 rtl:mr-1">
              {formatTime(secondsElapsed)} / 01:00
            </span>
          </div>

          {/* Limit Progress Bar */}
          <div className="w-48 h-1.5 bg-surface-border rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-300 rounded-full',
                secondsElapsed > 50 ? 'bg-rose-500' : 'bg-teal-600'
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-3">
        {!isRecording ? (
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={onStart}
            disabled={disabled || isRequesting}
            className="flex items-center gap-2.5 px-6 py-3 rounded-full shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform"
            aria-label={t('voice.startRecording')}
          >
            {isRequesting ? (
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            ) : (
              <Mic className="w-5 h-5" aria-hidden="true" />
            )}
            <span>
              {isRequesting ? t('voice.permissionNotice') : t('voice.startRecording')}
            </span>
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={onStop}
            className="flex items-center gap-2.5 px-6 py-3 rounded-full border-2 border-rose-500/30 text-rose-700 hover:bg-rose-50/50 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform"
            aria-label={t('voice.stopRecording')}
          >
            <Square className="w-4 h-4 fill-current text-rose-600" aria-hidden="true" />
            <span>{t('voice.stopRecording')}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
