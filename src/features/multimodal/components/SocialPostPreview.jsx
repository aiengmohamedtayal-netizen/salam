import { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Repeat2, Bookmark, Share2, Sparkles, User, Play, Pause, Volume2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
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
 * SocialPostPreview Component
 * A generic, platform-neutral social media post mockup showing how
 * the user's provided text, image, and voice sample render together in a feed.
 *
 * @param {object} props
 * @param {string} props.text
 * @param {string|null} props.imageUrl
 * @param {string|null} [props.audioUrl]
 * @param {number} [props.audioDuration]
 * @param {string} [props.className]
 */
export function SocialPostPreview({ text, imageUrl, audioUrl, audioDuration = 0, className }) {
  const { t } = useTranslation();
  const hasContent = (text && text.trim().length > 0) || Boolean(imageUrl) || Boolean(audioUrl);

  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const togglePlayAudio = (e) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  };

  return (
    <Card
      variant="default"
      padding="none"
      className={cn(
        'overflow-hidden border border-surface-border bg-surface-card transition-all duration-300',
        className
      )}
    >
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between border-b border-surface-border/50 bg-surface-elevated/40">
        <div className="flex items-center gap-3">
          {/* Generic Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center text-white shadow-sm shrink-0">
            <User className="w-5 h-5" aria-hidden="true" />
          </div>

          <div className="flex flex-col text-start">
            <span className="text-sm font-bold text-text-primary">
              {t('multimodal.previewHandle')}
            </span>
            <span className="text-xs text-text-muted">
              {t('multimodal.previewTime')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-card border border-surface-border text-[11px] text-text-muted font-medium">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
          <span>{t('multimodal.postPreviewTitle')}</span>
        </div>
      </div>

      {/* Post Content */}
      <div className="p-4 space-y-3">
        {text && text.trim().length > 0 ? (
          <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
            {text}
          </p>
        ) : !imageUrl && !audioUrl ? (
          <div className="py-8 text-center text-xs text-text-muted italic px-4 border border-dashed border-surface-border rounded-[var(--radius-lg)]">
            {t('multimodal.previewEmpty')}
          </div>
        ) : null}

        {/* Attached Image */}
        {imageUrl && (
          <div className="rounded-[var(--radius-lg)] overflow-hidden border border-surface-border bg-black/5 max-h-72 flex items-center justify-center">
            <img
              src={imageUrl}
              alt="Social post media attachment"
              className="w-full h-auto max-h-72 object-contain"
            />
          </div>
        )}

        {/* Attached Voice Note Audio Bar */}
        {audioUrl && (
          <div className="p-3 rounded-[var(--radius-lg)] border border-teal-500/20 bg-teal-500/5 flex items-center justify-between gap-3">
            <audio ref={audioRef} src={audioUrl} preload="metadata" />
            <button
              type="button"
              onClick={togglePlayAudio}
              className="w-8 h-8 rounded-full bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center shadow-xs shrink-0 transition-colors"
              aria-label={isPlaying ? t('voice.pause') : t('voice.play')}
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current ml-0.5 rtl:ml-0 rtl:mr-0.5" aria-hidden="true" />
              )}
            </button>

            {/* Audio Waveform Graphic Mockup */}
            <div className="flex-1 flex items-center gap-1 h-6 px-1">
              {[40, 70, 30, 90, 60, 40, 80, 50, 65, 35, 85, 45, 95, 60, 30, 70, 50, 40, 80, 60].map((h, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex-1 rounded-full transition-colors',
                    isPlaying ? 'bg-teal-600 animate-pulse' : 'bg-teal-500/40'
                  )}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>

            <div className="flex items-center gap-1 text-[11px] font-mono text-teal-800 shrink-0">
              <Volume2 className="w-3 h-3 text-teal-600" aria-hidden="true" />
              <span>{formatTime(currentTime)} / {formatTime(audioDuration)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Decorative Mock Interaction Bar */}
      {hasContent && (
        <div className="px-4 py-2.5 border-t border-surface-border/50 bg-surface-elevated/20 flex items-center justify-between text-text-muted text-xs">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1 hover:text-rose-600 transition-colors cursor-default">
              <Heart className="w-4 h-4" aria-hidden="true" />
              <span>24</span>
            </span>
            <span className="flex items-center gap-1 hover:text-teal-600 transition-colors cursor-default">
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              <span>6</span>
            </span>
            <span className="flex items-center gap-1 hover:text-sky-600 transition-colors cursor-default">
              <Repeat2 className="w-4 h-4" aria-hidden="true" />
              <span>3</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Bookmark className="w-4 h-4 hover:text-amber-600 transition-colors cursor-default" aria-hidden="true" />
            <Share2 className="w-4 h-4 hover:text-text-primary transition-colors cursor-default" aria-hidden="true" />
          </div>
        </div>
      )}
    </Card>
  );
}
