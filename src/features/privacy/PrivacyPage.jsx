import { motion } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Icon3D } from '@/components/ui/Icon3D';
import { fadeUp, safeMotion } from '@/lib/motion';
import { useTranslation } from '@/context/LanguageContext';

export function PrivacyPage() {
  const { t } = useTranslation();

  const PILLAR_3D_ICONS = ['shield', 'analytics', 'lifebuoy', 'care'];
  const pillarsData = t('privacy.pillars') || [];
  const whatWeUseList = t('privacy.whatWeUseList') || [];
  const whatWeNeverCollectList = t('privacy.whatWeNeverCollectList') || [];

  return (
    <div className="py-12 sm:py-20 bg-surface-bg min-h-screen space-y-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <Badge variant="primary" className="gap-2">
            <Icon3D name="shield" size="xs" className="w-4 h-4 shrink-0" />
            <span>{t('privacy.badge')}</span>
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black text-text-primary">
            {t('privacy.title')}
          </h1>
          <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
            {t('privacy.subtitle')}
          </p>
        </div>

        {/* Reassurance Alert */}
        <motion.div {...safeMotion(fadeUp)}>
          <Alert variant="disclaimer" title={t('privacy.disclaimerTitle')}>
            <span>{t('privacy.disclaimerBody')}</span>
          </Alert>
        </motion.div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {pillarsData.map((p, idx) => {
            const iconName = PILLAR_3D_ICONS[idx % PILLAR_3D_ICONS.length];
            return (
              <Card key={idx} variant="default" padding="lg" className="space-y-3 hover:border-teal-300 hover:shadow-md transition-all duration-200">
                <div className="w-12 h-12 flex items-center justify-center shrink-0">
                  <Icon3D name={iconName} size="lg" className="w-12 h-12 object-contain drop-shadow-xs" />
                </div>
                <h3 className="font-bold text-base text-text-primary">{p.title}</h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  {p.desc}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Detailed Breakdown */}
        <Card variant="default" padding="lg" className="space-y-6">
          <div className="border-b border-surface-border pb-4">
            <h2 className="text-xl font-bold text-text-primary">
              {t('privacy.breakdownTitle')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
            <div className="space-y-3 p-4 rounded-xl bg-emerald-50/50 border border-emerald-200">
              <span className="font-bold text-emerald-950 flex items-center gap-2 text-base">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" aria-hidden="true" />
                <span>{t('privacy.whatWeUseTitle')}</span>
              </span>
              <ul className="space-y-2 text-emerald-900 list-disc list-inside">
                {whatWeUseList.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-rose-50/50 border border-rose-200">
              <span className="font-bold text-rose-950 flex items-center gap-2 text-base">
                <XCircle className="h-5 w-5 text-rose-600 shrink-0" aria-hidden="true" />
                <span>{t('privacy.whatWeNeverCollectTitle')}</span>
              </span>
              <ul className="space-y-2 text-rose-900 list-disc list-inside">
                {whatWeNeverCollectList.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        {/* Ethical AI Commitment */}
        <Card variant="elevated" padding="lg" className="bg-slate-900 text-white space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center font-bold shrink-0 p-1">
              <Icon3D name="shield" size="xs" className="w-6 h-6 object-contain" />
            </div>
            <h3 className="font-bold text-base">{t('privacy.ethicalTitle')}</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {t('privacy.ethicalDesc')}
          </p>
        </Card>
      </div>
    </div>
  );
}
