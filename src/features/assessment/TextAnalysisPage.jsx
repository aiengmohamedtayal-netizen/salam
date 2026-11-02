import { motion } from 'framer-motion';
import { Sparkles, Shield, AlertTriangle, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { TextAnalysisCard } from './components/TextAnalysisCard';
import { SalamNeuralNetwork } from '@/components/three/SalamNeuralNetwork';
import { fadeUp, safeMotion } from '@/lib/motion';
import { useTranslation } from '@/context/LanguageContext';

/**
 * TextAnalysisPage Component
 * Dedicated page for direct Arabic text linguistic analysis using the AMAL NLP adapter.
 */
export function TextAnalysisPage() {
  const { t, isAr } = useTranslation();
  return (
    <motion.main
      {...safeMotion(fadeUp)}
      className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-semibold text-teal-800">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
          <span>{t('assessment.directAnalysis.serviceBadge')}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
          {t('assessment.directAnalysis.title')}
        </h1>

        <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
          {t('assessment.directAnalysis.subtitle')}
        </p>

        {/* Ambient Neural Network Visual */}
        <div className="w-full max-w-sm h-32 mx-auto relative flex items-center justify-center">
          <SalamNeuralNetwork state="idle" className="w-full h-full" />
        </div>
      </div>

      {/* Main Analysis Card */}
      <TextAnalysisCard />

      {/* Scientific & Privacy Assurance Bar */}
      <div className="p-4 rounded-xl bg-surface-elevated border border-surface-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-teal-600 shrink-0" aria-hidden="true" />
          <span>{t('assessment.directAnalysis.savedNotice')}</span>
        </div>
        <div className="flex items-center gap-1.5 text-text-secondary">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />
          <span>{t('assessment.directAnalysis.disclaimerTitle')}</span>
        </div>
      </div>

      {/* Secondary Navigation Help */}
      <div className="flex justify-center items-center gap-3 pt-2">
        <Link to="/assessment">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t('assessment.modes.guided')}</span>
          </Button>
        </Link>
      </div>
    </motion.main>
  );
}
