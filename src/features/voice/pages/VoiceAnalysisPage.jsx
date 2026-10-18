import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Shield, AlertTriangle } from 'lucide-react';
import { VoiceAnalysisCard } from '../components/VoiceAnalysisCard';
import { VoiceAnalysisProcess } from '../components/VoiceAnalysisProcess';
import { VoiceResultPlaceholder } from '../components/VoiceResultPlaceholder';
import { SalamNeuralNetwork } from '@/components/three/SalamNeuralNetwork';
import { useTranslation } from '@/context/LanguageContext';
import { fadeUp, safeMotion } from '@/lib/motion';

/**
 * VoiceAnalysisPage Component
 * Full dedicated page for exploratory voice biomarker signal analysis.
 */
export function VoiceAnalysisPage() {
  const { t } = useTranslation();

  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [duration, setDuration] = useState(0);
  const [viewState, setViewState] = useState('input'); // 'input' | 'analyzing' | 'result'

  const handleAudioChange = (blob, url, recDuration) => {
    setAudioBlob(blob);
    setAudioUrl(url);
    setDuration(recDuration);
  };

  const handleStartAnalysis = () => {
    if (!audioUrl) return;
    setViewState('analyzing');
  };

  const handleAnalysisComplete = () => {
    setViewState('result');
  };

  const handleReset = () => {
    if (audioUrl && audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setViewState('input');
  };

  return (
    <motion.main
      {...safeMotion(fadeUp)}
      className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8"
    >
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-semibold text-teal-800">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
          <span>{t('voice.badge')}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
          {t('voice.title')}
        </h1>

        <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
          {t('voice.subtitle')}
        </p>

        {/* Floating 3D Ambient Visual Layer */}
        <div className="w-full max-w-sm h-36 mx-auto relative flex items-center justify-center">
          <SalamNeuralNetwork state={viewState === 'analyzing' ? 'processing' : 'idle'} className="w-full h-full" />
        </div>
      </div>

      {/* Main Flow State Views */}
      <AnimatePresence mode="wait">
        {viewState === 'input' && (
          <motion.div
            key="input-view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <VoiceAnalysisCard
              audioBlob={audioBlob}
              audioUrl={audioUrl}
              duration={duration}
              onAudioChange={handleAudioChange}
              onAnalyze={handleStartAnalysis}
            />

            {/* Scientific & Privacy Assurance Bar */}
            <div className="p-4 rounded-[var(--radius-xl)] bg-surface-elevated border border-surface-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-600 shrink-0" aria-hidden="true" />
                <span>{t('voice.privacyNotice')}</span>
              </div>
              <div className="flex items-center gap-1.5 text-text-secondary">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />
                <span>{t('voice.disclaimerShort')}</span>
              </div>
            </div>
          </motion.div>
        )}

        {viewState === 'analyzing' && (
          <motion.div
            key="analyzing-view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <VoiceAnalysisProcess onComplete={handleAnalysisComplete} />
          </motion.div>
        )}

        {viewState === 'result' && (
          <motion.div
            key="result-view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <VoiceResultPlaceholder duration={duration} onReset={handleReset} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
