import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUp, Mic, Pause, Play, Sparkles, X } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

/**
 * VoiceInput (AI Voice) Animated Component
 * Rebuilt from DesignBookmark Motion Study & Kokonut UI (MIT)
 * https://designbookmark.com/motion#ai-voice
 * https://kokonutui.com/docs/ai/ai-voice
 *
 * Adapted for AMAL design system:
 * - AMAL Orchid & Deep Purple color palette
 * - Cairo typography with bilingual Arabic / English copy
 * - Accurate 48-bar dynamic speech simulator & playback scrubber
 * - Crossfading icons with optical blur & spring transforms
 */

const BAR_COUNT = 48;
const BAR_IDS = Array.from({ length: BAR_COUNT + 1 }, (_, i) => `bar-${i}`);
const BAR_PITCH = 5; // px (3px width + 2px gap)
const SAMPLE_MS = 70;
const REST_LEVEL = 0.12;

const STILL_LEVELS = BAR_IDS.map(
  (_, i) => 0.25 + 0.5 * Math.abs(Math.sin(i * 0.55) * Math.cos(i * 0.21))
);

const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
const EDGE_MASK = 'linear-gradient(to right, transparent, black 16%, black 90%, transparent)';

function createVoiceSimulator() {
  let speaking = false;
  let switchAt = 0;
  let gate = 0;
  return (time) => {
    if (time >= switchAt) {
      speaking = !speaking;
      switchAt = time + (speaking ? 700 + Math.random() * 1600 : 180 + Math.random() * 500);
    }
    gate += ((speaking ? 1 : 0) - gate) * 0.35;
    const t = time / 1000;
    const syllable = Math.abs(Math.sin(t * Math.PI * 4.4 + Math.sin(t * 1.7) * 2));
    const grain = 0.65 + Math.random() * 0.35;
    return REST_LEVEL + gate * syllable * grain * (1 - REST_LEVEL);
  };
}

function condense(take) {
  if (take.length === 0) {
    return STILL_LEVELS.slice(0, BAR_COUNT);
  }
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    const from = Math.floor((i / BAR_COUNT) * take.length);
    const to = Math.max(from + 1, Math.floor(((i + 1) / BAR_COUNT) * take.length));
    return Math.max(REST_LEVEL, ...take.slice(from, to));
  });
}

const formatTime = (seconds) => {
  const whole = Math.floor(seconds);
  const mins = Math.floor(whole / 60);
  const secs = whole % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const setScales = (bars, levels) => {
  bars.forEach((bar, i) => {
    if (bar) {
      bar.style.transform = `scaleY(${(levels[i] ?? REST_LEVEL).toFixed(3)})`;
    }
  });
};

const FACE_CLASS =
  'absolute transition-[opacity,filter,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-opacity';
const faceState = (visible) =>
  visible ? 'scale-100 opacity-100 blur-0' : 'scale-50 opacity-0 blur-[3px] pointer-events-none';

function ButtonFaces({ visible }) {
  const icon = 'h-6 w-6 text-primary-900 dark:text-primary-100';
  return (
    <>
      <Mic aria-hidden="true" className={cn(FACE_CLASS, icon, faceState(visible.mic))} />
      <span
        aria-hidden="true"
        className={cn(
          FACE_CLASS,
          'h-5 w-5 rounded-[5px] bg-rose-600 dark:bg-rose-500 shadow-sm',
          faceState(visible.stop)
        )}
      />
      <Play
        aria-hidden="true"
        className={cn(FACE_CLASS, icon, 'fill-current translate-x-[1px]', faceState(visible.play))}
      />
      <Pause
        aria-hidden="true"
        className={cn(FACE_CLASS, icon, 'fill-current', faceState(visible.pause))}
      />
    </>
  );
}

function ReviewActions({ onDiscard, onSend, isAr }) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      className="flex items-center gap-2"
      exit={{ opacity: 0, filter: 'blur(2px)' }}
      initial={{ opacity: 0, y: 4, filter: 'blur(2px)' }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
    >
      <button
        className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-text-secondary hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors duration-150 cursor-pointer"
        onClick={onDiscard}
        type="button"
      >
        <X aria-hidden="true" className="w-3.5 h-3.5" />
        <span>{isAr ? 'إلغاء' : 'Discard'}</span>
      </button>

      <button
        className="flex h-8 items-center gap-1.5 rounded-lg bg-primary-700 hover:bg-primary-800 text-white px-3 text-xs font-bold shadow-md hover:shadow-lg transition-all duration-150 cursor-pointer"
        onClick={onSend}
        type="button"
      >
        <span>{isAr ? 'تحليل العينة الصوتية' : 'Analyze Audio'}</span>
        <ArrowUp aria-hidden="true" className="w-3.5 h-3.5 rotate-45 rtl:-rotate-45" />
      </button>
    </motion.div>
  );
}

export function VoiceInput({
  className,
  demo = true,
  level,
  onListeningChange,
  onStop,
  onSend,
  onDiscard,
  realAudioStream = null,
}) {
  const { language } = useTranslation();
  const isAr = language !== 'en';

  const [mode, setMode] = useState('idle'); // 'idle' | 'recording' | 'review'
  const [isDemo, setIsDemo] = useState(demo);
  const [seconds, setSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const rootRef = useRef(null);
  const mainRef = useRef(null);
  const rowRef = useRef(null);
  const ringRef = useRef(null);
  const playedRef = useRef(null);
  const barRefs = useRef([]);
  const playedBarRefs = useRef([]);
  const takeRef = useRef([]);
  const startedAtRef = useRef(0);
  const levelRef = useRef(level);

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  const recording = mode === 'recording';
  const reviewing = mode === 'review';
  const announce = !isDemo;

  // Real-time Waveform Rendering Loop
  useEffect(() => {
    const bars = barRefs.current;
    const row = rowRef.current;
    const ring = ringRef.current;
    const root = rootRef.current;
    if (!(recording && row && ring && root)) {
      return;
    }
    takeRef.current = [];

    if (shouldReduceMotion) {
      setScales(bars, STILL_LEVELS);
      takeRef.current = STILL_LEVELS.slice();
      return;
    }

    const simulate = createVoiceSimulator();
    const samples = BAR_IDS.map(() => REST_LEVEL);
    let phase = 0;
    let smooth = 0;
    let last = performance.now();
    let frame = 0;

    const tick = (now) => {
      const dt = Math.min(now - last, 100);
      last = now;
      phase += dt / SAMPLE_MS;
      while (phase >= 1) {
        phase -= 1;
        const live = levelRef.current;
        const sample =
          live === undefined
            ? simulate(now)
            : Math.max(REST_LEVEL, Math.min(1, live));
        samples.shift();
        samples.push(sample);
        takeRef.current.push(sample);
      }
      row.style.transform = `translateX(${(-phase * BAR_PITCH).toFixed(2)}px)`;
      setScales(bars, samples);

      // Breathing ring behind main button
      const latest = samples.at(-1) ?? REST_LEVEL;
      smooth += (latest - smooth) * 0.18;
      const lift = Math.max(0, smooth - REST_LEVEL);
      ring.style.transform = `scale(${(1 + lift * 0.28).toFixed(3)})`;
      ring.style.opacity = (0.35 + lift * 0.85).toFixed(3);
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      cancelAnimationFrame(frame);
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        start();
      } else {
        cancelAnimationFrame(frame);
      }
    });
    observer.observe(root);
    start();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      if (ring) {
        ring.style.transform = 'scale(1)';
        ring.style.opacity = '0';
      }
    };
  }, [recording, shouldReduceMotion]);

  // Review mode: condensed waveform
  useEffect(() => {
    const row = rowRef.current;
    if (recording || !row) return;
    row.style.transform = 'translateX(0px)';
    const levels = reviewing ? condense(takeRef.current) : BAR_IDS.map(() => REST_LEVEL);
    setScales(barRefs.current, levels);
    setScales(playedBarRefs.current, levels);
  }, [recording, reviewing]);

  // Recording elapsed timer
  useEffect(() => {
    if (!recording) return;
    setSeconds(0);
    startedAtRef.current = Date.now();
    const id = setInterval(() => {
      setSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 250);
    return () => clearInterval(id);
  }, [recording]);

  // Playback sweeping playhead
  useEffect(() => {
    const played = playedRef.current;
    if (!(playing && played)) return;

    const length = Math.max(duration, 1) * 1000;
    const startedAt = performance.now();
    let frame = 0;
    let shownSecond = -1;

    const tick = (now) => {
      const progress = Math.min((now - startedAt) / length, 1);
      played.style.clipPath = `inset(0 ${((1 - progress) * 100).toFixed(2)}% 0 0)`;

      const position = progress * Math.max(duration, 1);
      if (Math.floor(position) !== shownSecond || progress >= 1) {
        shownSecond = Math.floor(position);
        setPlayhead(Math.max(position, Number.EPSILON));
      }
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setPlaying(false);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, duration]);

  // Handlers
  const startRecording = (notify = true) => {
    setPlaying(false);
    setMode('recording');
    if (notify) {
      onListeningChange?.(true);
    }
  };

  const stopRecording = (notify = true) => {
    const taken = Math.max(
      (Date.now() - startedAtRef.current) / 1000,
      takeRef.current.length * (SAMPLE_MS / 1000)
    );
    setDuration(taken);
    setPlayhead(0);
    if (playedRef.current) {
      playedRef.current.style.clipPath = 'inset(0 100% 0 0)';
    }
    setMode('review');
    if (notify) {
      onListeningChange?.(false);
      onStop?.(taken);
    }
  };

  const finish = (sent, notify = true) => {
    setPlaying(false);
    setMode('idle');
    if (!notify) return;
    mainRef.current?.focus();
    if (sent) {
      onSend?.(duration);
    } else {
      onDiscard?.();
    }
  };

  const togglePlay = () => {
    if (!playing && playedRef.current) {
      playedRef.current.style.clipPath = 'inset(0 100% 0 0)';
    }
    setPlaying((p) => !p);
  };

  // Demo auto-run loop
  const hasPlayed = playhead > 0;
  const demoStepRef = useRef(() => undefined);
  useEffect(() => {
    demoStepRef.current = () => {
      if (mode === 'idle') {
        startRecording(false);
      } else if (mode === 'recording') {
        stopRecording(false);
      } else if (hasPlayed) {
        finish(true, false);
      } else {
        togglePlay();
      }
    };
  });

  useEffect(() => {
    if (!isDemo || playing) return;
    const delays = {
      idle: 1300,
      recording: 3500,
      review: hasPlayed ? 950 : 550,
    };
    const id = setTimeout(() => demoStepRef.current(), delays[mode]);
    return () => clearTimeout(id);
  }, [isDemo, mode, hasPlayed, playing]);

  const endDemo = () => {
    if (isDemo) {
      setIsDemo(false);
      setPlaying(false);
      setMode('idle');
    }
  };

  const handleMainClick = () => {
    if (isDemo) {
      endDemo();
      startRecording();
    } else if (recording) {
      stopRecording();
    } else if (reviewing) {
      togglePlay();
    } else {
      startRecording();
    }
  };

  const faces = {
    mic: mode === 'idle',
    stop: recording,
    play: reviewing && !playing,
    pause: reviewing && playing,
  };

  const timerValue =
    mode === 'review'
      ? formatTime(playing || playhead > 0 ? playhead : duration)
      : formatTime(mode === 'recording' ? seconds : 0);

  const mainAriaLabel =
    mode === 'recording'
      ? (isAr ? 'إيقاف التسجيل' : 'Stop recording')
      : mode === 'review'
      ? (playing ? (isAr ? 'إيقاف مؤقت' : 'Pause playback') : (isAr ? 'تشغيل المقطع' : 'Play recording'))
      : (isAr ? 'بدء التسجيل الصوتي' : 'Start recording');

  return (
    <div
      className={cn('w-full py-4 select-none', className)}
      onPointerDownCapture={endDemo}
      ref={rootRef}
    >
      <div className="relative mx-auto flex w-full max-w-md flex-col items-center gap-3">
        {/* Main Microphone Action Button with Voice Breathing Pulse */}
        <div className="relative">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-2.5 rounded-2xl bg-primary-500/20 dark:bg-primary-400/25 opacity-0 blur-sm will-change-transform transition-all"
            ref={ringRef}
          />
          <button
            aria-label={mainAriaLabel}
            aria-pressed={recording && announce}
            className={cn(
              'relative flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-200 ease-out cursor-pointer',
              'border border-surface-border shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              mode === 'idle'
                ? 'bg-surface-card hover:bg-primary-50 dark:hover:bg-primary-950/40 text-primary-700 dark:text-primary-300'
                : mode === 'recording'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
                : 'bg-primary-100/70 dark:bg-primary-900/50 border-primary-300 dark:border-primary-700'
            )}
            onClick={handleMainClick}
            ref={mainRef}
            type="button"
          >
            <ButtonFaces visible={faces} />
          </button>
        </div>

        {/* Live Timer & Recording Status Lamp */}
        <span
          className={cn(
            'relative font-mono text-sm font-semibold tabular-nums transition-colors duration-300',
            mode === 'idle'
              ? 'text-text-muted'
              : 'text-text-primary'
          )}
        >
          {/* Steady REC Lamp */}
          <span
            aria-hidden="true"
            className={cn(
              'absolute top-1/2 -right-3.5 size-2 -translate-y-1/2 rounded-full bg-rose-500 transition-opacity duration-150',
              recording ? 'opacity-100 shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'opacity-0'
            )}
          />
          {timerValue}
        </span>

        {/* Dynamic 48-Bar Waveform Display */}
        <div
          aria-hidden="true"
          className="relative h-9 w-64 overflow-hidden rounded-md bg-surface-base/40 p-1"
          style={{
            maskImage: recording ? EDGE_MASK : undefined,
            WebkitMaskImage: recording ? EDGE_MASK : undefined,
          }}
          dir="ltr"
        >
          {/* Scrolling Live Waveform Row */}
          <div className="flex h-full items-center gap-[2px]" ref={rowRef}>
            {BAR_IDS.map((id, i) => (
              <span
                key={id}
                ref={(el) => {
                  barRefs.current[i] = el;
                }}
                className={cn(
                  'h-full w-[3px] shrink-0 rounded-full',
                  recording
                    ? 'bg-primary-600 dark:bg-primary-400'
                    : 'bg-primary-300/40 dark:bg-primary-800/40 transition-transform duration-500 motion-reduce:transition-none'
                )}
                style={{
                  transform: `scaleY(${REST_LEVEL})`,
                  transitionDelay: recording ? undefined : `${(BAR_COUNT - i) * 6}ms`,
                  transitionTimingFunction: EASE_OUT,
                }}
              />
            ))}
          </div>

          {/* Swept Playhead Waveform in Review Mode */}
          <div
            ref={playedRef}
            className={cn(
              'absolute inset-0 p-1 flex items-center gap-[2px] transition-opacity duration-200 pointer-events-none',
              reviewing ? 'opacity-100' : 'opacity-0'
            )}
            style={{ clipPath: 'inset(0 100% 0 0)' }}
          >
            {BAR_IDS.map((id, i) => (
              <span
                key={id}
                ref={(el) => {
                  playedBarRefs.current[i] = el;
                }}
                className="h-full w-[3px] shrink-0 rounded-full bg-primary-800 dark:bg-primary-200"
                style={{ transform: `scaleY(${REST_LEVEL})` }}
              />
            ))}
          </div>
        </div>

        {/* Dynamic Contextual Text & Review Action Bar */}
        <div className="relative flex h-8 items-center justify-center">
          <AnimatePresence initial={false} mode="popLayout">
            {reviewing ? (
              <ReviewActions
                key="actions"
                isAr={isAr}
                onDiscard={() => finish(false)}
                onSend={() => finish(true)}
              />
            ) : (
              <motion.span
                key="caption"
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, filter: 'blur(2px)' }}
                initial={{ opacity: 0, filter: 'blur(2px)' }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className="text-xs font-medium text-text-secondary flex items-center gap-1.5"
              >
                {recording ? (
                  <>
                    <span className="size-1.5 rounded-full bg-primary-600 animate-pulse" />
                    <span>{isAr ? 'جارٍ الاستماع لمؤشرات النبرة...' : 'Listening to voice tone...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-primary-500" />
                    <span>{isAr ? 'اضغط على الميكروفون لبدء التسجيل' : 'Click microphone to record'}</span>
                  </>
                )}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Accessible screen reader status announcements */}
        <output aria-live={announce ? 'polite' : 'off'} className="sr-only">
          {announce && recording ? (isAr ? 'جارٍ التسجيل' : 'Recording') : ''}
          {announce && reviewing ? (isAr ? 'التسجيل جاهز للتحليل' : 'Recording ready to analyze') : ''}
        </output>
      </div>
    </div>
  );
}

export default VoiceInput;
