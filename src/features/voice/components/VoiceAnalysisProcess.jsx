import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Cpu, Mic, Activity, Clock } from 'lucide-react';
import { SalamNeuralNetwork } from '@/components/three/SalamNeuralNetwork';
import { useTranslation } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

/**
 * VoiceAnalysisProcess Component
 * Simulated 4-stage processing sequence for the recorded voice sample
 * featuring the live 3D neural network in processing mode.
 *
 * @param {object} props
 * @param {() => void} props.onComplete - Called when stages complete
 * @param {string} [props.className]
 */
export function VoiceAnalysisProcess({ onComplete, className }) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { key: 'step1', label: t('voice.stages.step1'), icon: Mic },
    { key: 'step2', label: t('voice.stages.step2'), icon: Activity },
    { key: 'step3', label: t('voice.stages.step3'), icon: Clock },
    { key: 'step4', label: t('voice.stages.step4'), icon: Cpu },
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 900);
    const timer2 = setTimeout(() => setCurrentStep(2), 1800);
    const timer3 = setTimeout(() => setCurrentStep(3), 2700);
    const timer4 = setTimeout(() => {
      if (typeof onComplete === 'function') {
        onComplete();
      }
    }, 3600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  const progressPercentage = Math.round(((currentStep + 1) / steps.length) * 100);

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 rounded-[var(--radius-xl)] border border-surface-border bg-surface-card shadow-sm space-y-6',
        className
      )}
    >
      {/* 3D Neural Network Animation Cluster */}
      <div className="w-full max-w-sm h-52 relative flex items-center justify-center">
        <SalamNeuralNetwork state="processing" className="w-full h-full" />
      </div>

      {/* Title & Status */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-bold text-text-primary">
          {t('voice.analyzingVoice')}
        </h3>
        <p className="text-xs text-text-muted">
          {steps[currentStep]?.label || t('voice.analyzingVoice')}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md bg-surface-border/50 rounded-full h-2 overflow-hidden">
        <motion.div
          className="bg-gradient-to-r from-teal-500 to-teal-400 h-full rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Step Indicators */}
      <div className="w-full max-w-md grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
        {steps.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;
          const Icon = step.icon;

          return (
            <div
              key={step.key}
              className={cn(
                'flex flex-col items-center p-2 rounded-lg border text-center transition-all duration-200',
                isDone
                  ? 'bg-teal-50 border-teal-200 text-teal-800'
                  : isCurrent
                  ? 'bg-surface-elevated border-teal-500/50 text-teal-700 shadow-sm'
                  : 'bg-surface-card/40 border-surface-border text-text-muted opacity-60'
              )}
            >
              <div className="mb-1">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-teal-600 animate-spin" aria-hidden="true" />
                ) : (
                  <Icon className="w-4 h-4" aria-hidden="true" />
                )}
              </div>
              <span className="text-[11px] font-medium leading-tight">
                {step.label.split('...')[0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
