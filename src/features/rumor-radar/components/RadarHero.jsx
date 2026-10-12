import { motion } from 'framer-motion';
import { Radar, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { fadeUp, safeMotion } from '@/lib/motion';
import { useTranslation } from '@/context/LanguageContext';

/**
 * Radar Hero / Intro Component
 * Establishes a calm, analytical, and evidence-grounded monitoring posture.
 */
export function RadarHero() {
  const { t, language } = useTranslation();
  const isEn = language === 'en';

  return (
    <div className="text-center max-w-3xl mx-auto space-y-4">
      {/* Top Status & Integrity Pill */}
      <motion.div {...safeMotion(fadeUp)} className="inline-flex justify-center">
        <Badge variant="primary" size="md" className="gap-2 py-1 px-4 shadow-2xs">
          <Radar className="h-4 w-4 text-teal-700 animate-pulse" aria-hidden="true" />
          <span>
            {isEn
              ? 'Monitoring grounded in verifiable indicators & sources'
              : 'الرصد يعتمد على مؤشرات ومصادر قابلة للمراجعة'}
          </span>
        </Badge>
      </motion.div>

      {/* Main Section Headline */}
      <motion.h1
        {...safeMotion(fadeUp)}
        className="text-3xl sm:text-5xl font-black text-text-primary tracking-tight leading-tight"
      >
        {t('radar.hero.title')}
      </motion.h1>

      {/* Supporting Copy */}
      <motion.p
        {...safeMotion(fadeUp)}
        className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-2xl mx-auto"
      >
        {t('radar.hero.subtitle')}
      </motion.p>

      {/* Trust Principles Row */}
      <motion.div
        {...safeMotion(fadeUp)}
        className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-text-muted"
      >
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-teal-600" aria-hidden="true" />
          <span>{isEn ? 'Neutral analytical methodology' : 'منهجية تحليلية محايدة'}</span>
        </span>
        <span>•</span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-teal-600" aria-hidden="true" />
          <span>{isEn ? 'Precise source attribution' : 'إسناد دقيق للمصادر'}</span>
        </span>
        <span>•</span>
        <span>{isEn ? 'Explicit margin of uncertainty' : 'توضيح صريح لهامش عدم اليقين'}</span>
      </motion.div>
    </div>
  );
}
