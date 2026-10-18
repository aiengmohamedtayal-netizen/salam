import { useState, useRef, useEffect, useCallback } from 'react';
import { AlertCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { VoiceWaveform } from './VoiceWaveform';
import { VoiceRecorderControls } from './VoiceRecorderControls';
import { AudioPreview } from './AudioPreview';
import { useTranslation } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

const MAX_DURATION_SECONDS = 60;
const MIN_DURATION_SECONDS = 2;

/**
 * VoiceRecorder Component
 * Complete browser-only audio recording capability using MediaRecorder and Web Audio API.
 * Performs rigorous resource cleanup (microphones, audio contexts, object URLs).
 *
 * @param {object} props
 * @param {Blob|null} props.audioBlob
 * @param {string|null} props.audioUrl
 * @param {number} props.duration
 * @param {(blob: Blob|null, url: string|null, duration: number) => void} props.onChange
 * @param {string} [props.className]
 */
export function VoiceRecorder({
  audioBlob: _audioBlob,
  audioUrl,
  duration = 0,
  onChange,
  className,
}) {
  const { t } = useTranslation();

  const [status, setStatus] = useState(audioUrl ? 'recorded' : 'idle');
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);
  const [limitNotice, setLimitNotice] = useState(false);
  const [analyser, setAnalyser] = useState(null);

  // References to browser resources for clean release
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const audioChunksRef = useRef([]);
  const startTimeRef = useRef(0);

  // Stop tracks and release microphone
  const cleanupStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAnalyser(null);
  }, []);

  // Clear timers
  const clearTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  // Stop recording handler
  const handleStopRecording = useCallback(() => {
    clearTimer();

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // Safe ignore
      }
    }
  }, [clearTimer]);

  // Start recording
  const handleStartRecording = async () => {
    setErrorMessage(null);
    setLimitNotice(false);

    // 1. Browser feature check
    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia ||
      typeof window.MediaRecorder === 'undefined'
    ) {
      setErrorMessage(t('voice.errors.unsupported'));
      return;
    }

    setStatus('requesting_permission');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;

      // Setup Web Audio API Analyser for real-time waveform
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);

          audioContextRef.current = audioCtx;
          setAnalyser(analyser);
        }
      } catch {
        // AudioContext failure is non-fatal; visual fallback will run
      }

      // Configure MediaRecorder
      let options = {};
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options = { mimeType: 'audio/webm;codecs=opus' };
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        options = { mimeType: 'audio/ogg;codecs=opus' };
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/mp4' };
      }

      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        cleanupStream();

        const recordedDuration = Math.round((Date.now() - startTimeRef.current) / 1000);

        if (recordedDuration < MIN_DURATION_SECONDS) {
          setErrorMessage(t('voice.errors.tooShort'));
          setStatus('idle');
          setSecondsElapsed(0);
          return;
        }

        const mime = recorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mime });

        // Revoke previous URL if any
        if (audioUrl && audioUrl.startsWith('blob:')) {
          URL.revokeObjectURL(audioUrl);
        }

        const newUrl = URL.createObjectURL(blob);
        onChange(blob, newUrl, recordedDuration);
        setStatus('recorded');
      };

      recorder.start(250); // Collect slice every 250ms
      startTimeRef.current = Date.now();
      setStatus('recording');
      setSecondsElapsed(0);

      // Start duration counter
      timerIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setSecondsElapsed(elapsed);

        // Auto stop at max limit
        if (elapsed >= MAX_DURATION_SECONDS) {
          setLimitNotice(true);
          handleStopRecording();
        }
      }, 250);
    } catch (err) {
      cleanupStream();
      setStatus('idle');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage(t('voice.errors.permissionDenied'));
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage(t('voice.errors.noMicrophone'));
      } else {
        setErrorMessage(t('voice.errors.unsupported'));
      }
    }
  };

  // Re-record action
  const handleReRecord = () => {
    if (audioUrl && audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(audioUrl);
    }
    onChange(null, null, 0);
    setStatus('idle');
    setSecondsElapsed(0);
    setErrorMessage(null);
    setLimitNotice(false);
  };

  // Delete recording action
  const handleDelete = () => {
    if (audioUrl && audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(audioUrl);
    }
    onChange(null, null, 0);
    setStatus('idle');
    setSecondsElapsed(0);
    setErrorMessage(null);
    setLimitNotice(false);
  };

  // Complete cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
      cleanupStream();
      if (audioUrl && audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [clearTimer, cleanupStream, audioUrl]);

  return (
    <div className={cn('flex flex-col gap-4 w-full', className)}>
      {/* Recording in progress or idle */}
      {status !== 'recorded' ? (
        <div className="flex flex-col items-center justify-center p-6 rounded-[var(--radius-xl)] border border-surface-border bg-surface-card/60 space-y-4">
          {/* Animated Waveform when recording */}
          {status === 'recording' && (
            <VoiceWaveform
              analyser={analyser}
              isRecording={status === 'recording'}
            />
          )}

          {/* Recorder Controls */}
          <VoiceRecorderControls
            status={status}
            secondsElapsed={secondsElapsed}
            onStart={handleStartRecording}
            onStop={handleStopRecording}
          />

          {/* Privacy Note */}
          <div className="flex items-center gap-1.5 text-xs text-text-muted text-center pt-2">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" aria-hidden="true" />
            <span>{t('voice.privacyNotice')}</span>
          </div>
        </div>
      ) : (
        /* Recorded Audio Preview */
        <AudioPreview
          audioUrl={audioUrl}
          duration={duration}
          onReRecord={handleReRecord}
          onDelete={handleDelete}
        />
      )}

      {/* Max duration limit alert */}
      {limitNotice && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 font-medium">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" aria-hidden="true" />
          <span>{t('voice.limitReached')}</span>
        </div>
      )}

      {/* Friendly validation / error feedback */}
      {errorMessage && (
        <div
          className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
