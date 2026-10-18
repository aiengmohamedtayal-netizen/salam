import { useEffect, useRef } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { prefersReducedMotion } from '@/lib/motion';
import { cn } from '@/lib/utils';

/**
 * VoiceWaveform Component
 * Subtle real-time audio waveform visualizer for recording sessions.
 * Visual indicator ONLY — does NOT measure or imply psychological state.
 *
 * @param {object} props
 * @param {AnalyserNode|null} props.analyser - Web Audio API AnalyserNode
 * @param {boolean} props.isRecording - Whether microphone is currently recording
 * @param {string} [props.className]
 */
export function VoiceWaveform({ analyser, isRecording, className }) {
  const { t } = useTranslation();
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!isRecording || prefersReducedMotion()) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas resolution to match display size
    const width = canvas.width;
    const height = canvas.height;

    // Buffer for analyser data or fallback
    const bufferLength = analyser ? analyser.frequencyBinCount : 32;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);

      if (analyser) {
        analyser.getByteFrequencyData(dataArray);
      } else {
        // Fallback subtle ambient animation if analyser is unavailable
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = Math.floor(Math.sin(Date.now() / 200 + i * 0.3) * 40 + 60);
        }
      }

      ctx.clearRect(0, 0, width, height);

      const numBars = 28;
      const step = Math.floor(bufferLength / numBars) || 1;
      const barWidth = Math.max(3, (width / numBars) - 3);

      for (let i = 0; i < numBars; i++) {
        const value = dataArray[i * step] || 20;
        const percent = Math.min(1, Math.max(0.1, value / 255));
        const barHeight = Math.max(4, percent * (height * 0.85));

        const x = i * (barWidth + 3) + 2;
        const y = (height - barHeight) / 2;

        // Gradient styling matching SALAM teal palette
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, 'rgba(13, 148, 136, 0.9)'); // teal-600
        gradient.addColorStop(1, 'rgba(20, 184, 166, 0.4)'); // teal-500

        ctx.fillStyle = gradient;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth, barHeight, 2);
        } else {
          ctx.rect(x, y, barWidth, barHeight);
        }
        ctx.fill();
      }
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyser, isRecording]);

  return (
    <div className={cn('flex flex-col items-center gap-2 w-full', className)}>
      <div className="w-full h-16 rounded-[var(--radius-lg)] bg-surface-elevated/80 border border-surface-border flex items-center justify-center p-2 overflow-hidden shadow-inner">
        <canvas
          ref={canvasRef}
          width={300}
          height={60}
          className="w-full h-full max-w-xs object-contain"
          aria-hidden="true"
        />
      </div>
      <span className="text-[11px] text-text-muted text-center select-none">
        {t('voice.waveformNote')}
      </span>
    </div>
  );
}
