import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Icon3D } from '@/components/ui/Icon3D';
import { PROFESSIONAL_REFERRAL_GUIDE } from '@/data/awarenessContent';
import { fadeUp, safeMotion } from '@/lib/motion';
import { useTranslation } from '@/context/LanguageContext';

export function SupportPage() {
  const { t, language } = useTranslation();
  const isEn = language === 'en';

  const guideTitle = isEn && PROFESSIONAL_REFERRAL_GUIDE.titleEn
    ? PROFESSIONAL_REFERRAL_GUIDE.titleEn
    : PROFESSIONAL_REFERRAL_GUIDE.title;

  const guideDesc = isEn && PROFESSIONAL_REFERRAL_GUIDE.descriptionEn
    ? PROFESSIONAL_REFERRAL_GUIDE.descriptionEn
    : PROFESSIONAL_REFERRAL_GUIDE.description;

  const guideSigns = isEn && PROFESSIONAL_REFERRAL_GUIDE.signsEn
    ? PROFESSIONAL_REFERRAL_GUIDE.signsEn
    : PROFESSIONAL_REFERRAL_GUIDE.signs;

  const guideExpect = isEn && PROFESSIONAL_REFERRAL_GUIDE.whatToExpectEn
    ? PROFESSIONAL_REFERRAL_GUIDE.whatToExpectEn
    : PROFESSIONAL_REFERRAL_GUIDE.whatToExpect;

  return (
    <div className="py-12 sm:py-20 bg-surface-bg min-h-screen space-y-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <Badge variant="primary" className="gap-2">
            <Icon3D name="care" size="xs" className="w-4 h-4 shrink-0" />
            <span>{t('support.badge')}</span>
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black text-text-primary">
            {t('support.title')}
          </h1>
          <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
            {t('support.subtitle')}
          </p>
        </div>

        {/* Primary Alert Banner */}
        <motion.div {...safeMotion(fadeUp)}>
          <Alert variant="warning" title={t('support.warningTitle')}>
            <span>{t('support.warningBody')}</span>
          </Alert>
        </motion.div>

        {/* When to Seek Help Card */}
        <Card variant="default" padding="lg" className="space-y-6">
          <div className="flex items-start gap-4 pb-4 border-b border-surface-border">
            <div className="w-11 h-11 flex items-center justify-center shrink-0">
              <Icon3D name="care" size="lg" className="w-11 h-11 object-contain drop-shadow-xs" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
                {guideTitle}
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                {guideDesc}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-bold text-text-primary block">
              {t('support.whenSignsLabel')}
            </span>
            <div className="grid grid-cols-1 gap-2.5">
              {guideSigns.map((sign, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-text-secondary leading-relaxed"
                >
                  <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </div>
                  <span>{sign}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* What to Expect in a Session */}
        <Card variant="default" padding="lg" className="space-y-6 bg-teal-50/30 border-teal-200">
          <div className="space-y-2 pb-4 border-b border-teal-200/60">
            <div className="flex items-center gap-2.5 text-teal-900 font-bold text-lg">
              <Icon3D name="location" size="md" className="w-7 h-7 shrink-0 drop-shadow-xs" />
              <h3>{t('support.whatToExpectTitle')}</h3>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              {t('support.whatToExpectSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {guideExpect.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white border border-teal-100 shadow-2xs space-y-1"
              >
                <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center text-xs font-bold mb-2">
                  0{idx + 1}
                </div>
                <p className="text-xs sm:text-sm text-text-primary leading-relaxed font-medium">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Practical Checklist before booking */}
        <Card variant="default" padding="lg" className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-surface-border">
            <Icon3D name="clipboard" size="md" className="w-7 h-7 shrink-0 drop-shadow-xs" />
            <h3 className="text-base font-bold text-text-primary">
              {t('support.checklistTitle')}
            </h3>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-text-secondary leading-relaxed list-disc list-inside">
            <li>{t('support.checklistItem1')}</li>
            <li>{t('support.checklistItem2')}</li>
            <li>{t('support.checklistItem3')}</li>
          </ul>
        </Card>

        {/* Return to Assessment CTA */}
        <div className="text-center pt-4">
          <Link to="/assessment">
            <Button variant="primary" size="lg" className="text-base px-8 gap-2">
              <span>{t('support.backToAssessment')}</span>
              <ArrowLeft className="h-4 w-4 ltr:rotate-0 rtl:rotate-180" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
