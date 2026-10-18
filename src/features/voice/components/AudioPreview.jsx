import { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Trash2, Volume2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

/**
 * Format seconds into MM:SS format.
 */
function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * AudioPreview Component
 * Accessible playback player for recorded voice clips with time scrubbing,
 * re-record, and deletion actions.
 *
 * @param {object} props
 * @param {string} props.audioUrl - Blob Object URL
 * @param {number} props.duration - Recording duration in seconds
 * @param {() => void} props.onReRecord - Callback to re-record
 * @param {() => void} props.onDelete - Callback to delete recording
 * @param {string} [props.className]
 */
export function AudioPreview({
  audioUrl,
  duration = 0,
  onReRecord,
  onDelete,
  className,
}) {
  const { t } = useTranslation();
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setAudioDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => {
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    const newTime = parseFloat(e.target.value);
    if (audio) {
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  return (
    <div
      className={cn(
        'p-4 rounded-[var(--radius-xl)] border border-surface-border bg-surface-card shadow-sm space-y-3',
        className
      )}
    >
      {/* Hidden HTML5 Audio Element */}
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Status Bar */}
      <div className="flex items-center justify-between text-xs pb-2 border-b border-surface-border/60">
        <div className="flex items-center gap-2 text-emerald-700 font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{t('voice.recordingComplete')}</span>
        </div>
        <div className="flex items-center gap-1.5 text-text-muted font-mono">
          <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
          <span>
            {formatTime(currentTime)} / {formatTime(audioDuration || duration)}
          </span>
        </div>
      </div>

      {/* Playback Controls & Scrubber */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={togglePlay}
          className="w-10 h-10 rounded-full p-0 flex items-center justify-center shrink-0 shadow-sm"
          aria-label={isPlaying ? t('voice.pause') : t('voice.play')}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-current" aria-hidden="true" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5 rtl:ml-0 rtl:mr-0.5" aria-hidden="true" />
          )}
        </Button>

        {/* Progress Bar / Range Input */}
        <div className="flex-1 flex flex-col justify-center">
          <input
            type="range"
            min="0"
            max={audioDuration || duration || 1}
            step="0.05"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-surface-border rounded-lg appearance-none cursor-pointer accent-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            aria-label="Audio playback position"
          />
        </div>
      </div>

      {/* Action Buttons: Re-record & Delete */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReRecord}
          className="h-8 px-2.5 text-xs text-text-secondary hover:text-teal-700 flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{t('voice.reRecord')}</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="h-8 px-2.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{t('voice.deleteRecording')}</span>
        </Button>
      </div>
    </div>
  );
}
