import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Icon3D } from '@/components/ui/Icon3D';
import { SalamNeuralNetwork } from '@/components/three/SalamNeuralNetwork';
import { fadeUp, safeMotion } from '@/lib/motion';
import { useTranslation } from '@/context/LanguageContext';

export function HomePage() {
  const { t } = useTranslation();

  const pipelineIconNames = [
    'chat',
    'brain',
    'analytics',
    'location',
    'care',
  ];

  const pipelineSteps = t('home.pipeline.steps') || [];

  return (
    <div className="flex flex-col min-h-screen">
      {/* ============================================================
          Hero Section (Enhanced with Three.js 3D Linguistic Network)
          ============================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/70 via-surface-bg to-surface-bg pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-surface-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Hero Main Content (7 cols on desktop) */}
            <div className="lg:col-span-7 text-center lg:text-start space-y-6">
              {/* Top pill badge */}
              <motion.div {...safeMotion(fadeUp)} className="inline-flex justify-center lg:justify-start">
                <Badge variant="primary" size="md" className="gap-2 py-1 px-4 shadow-xs">
                  <Icon3D name="lightbulb" size="xs" className="w-4 h-4 shrink-0" />
                  <span>{t('home.hero.badge')}</span>
                </Badge>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                {...safeMotion(fadeUp)}
                className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-black text-text-primary tracking-tight leading-[1.25]"
              >
                {t('home.hero.titleStart')}{' '}
                <span className="text-teal-700 underline decoration-teal-300 decoration-wavy decoration-2 underline-offset-8">
                  {t('home.hero.titleHighlight')}
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                {...safeMotion(fadeUp)}
                className="text-base sm:text-lg lg:text-xl text-text-secondary leading-relaxed font-normal max-w-2xl mx-auto lg:mx-0"
              >
                {t('home.hero.subtitle')}
              </motion.p>

              {/* Mandatory Non-Medical Disclaimer Box */}
              <motion.div {...safeMotion(fadeUp)} className="text-start max-w-xl mx-auto lg:mx-0 pt-1">
                <Alert variant="disclaimer">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-teal-900">{t('home.hero.disclaimerLabel')}</span>
                    <span className="text-xs text-teal-950 leading-relaxed">
                      {t('home.hero.disclaimerBody')}
                    </span>
                  </div>
                </Alert>
              </motion.div>

              {/* Hero CTAs */}
              <motion.div
                {...safeMotion(fadeUp)}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
              >
                <Link to="/assessment" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-md shadow-teal-700/20 text-lg px-8 gap-2">
                    <span>{t('home.hero.ctaStart')}</span>
                    <ArrowLeft className="h-5 w-5 rtl:rotate-0 ltr:rotate-180" aria-hidden="true" />
                  </Button>
                </Link>
                <Link to="/about" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-7">
                    <span>{t('home.hero.ctaLearn')}</span>
                  </Button>
                </Link>
              </motion.div>

              {/* Privacy trust guarantees */}
              <motion.div
                {...safeMotion(fadeUp)}
                className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-text-secondary"
              >
                <span className="flex items-center gap-1.5">
                  <Icon3D name="shield" size="xs" className="w-4 h-4 shrink-0" />
                  <span>{t('home.hero.trustNoAccount')}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden="true" />
                  <span>{t('home.hero.trustNoStorage')}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon3D name="care" size="xs" className="w-4 h-4 shrink-0" />
                  <span>{t('home.hero.trustSupportive')}</span>
                </span>
              </motion.div>
            </div>

            {/* 3D Neural Network (Frameless floating cluster, standalone) */}
            <motion.div
              {...safeMotion(fadeUp)}
              className="lg:col-span-5 w-full flex items-center justify-center pt-2 lg:pt-0"
            >
              <div className="relative w-full h-[320px] sm:h-[400px] lg:h-[480px] flex items-center justify-center pointer-events-auto">
                <SalamNeuralNetwork state="idle" className="w-full h-full" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================
          Pipeline: How it Works (5 Stages)
          ============================================================ */}
      <section className="py-20 bg-surface-bg border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <Badge variant="primary">{t('home.pipeline.badge')}</Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-text-primary">
              {t('home.pipeline.title')}
            </h2>
            <p className="text-sm sm:text-base text-text-secondary">
              {t('home.pipeline.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {Array.isArray(pipelineSteps) &&
              pipelineSteps.map((item, idx) => {
                const iconName = pipelineIconNames[idx] || 'chat';
                return (
                  <Card
                    key={idx}
                    variant="default"
                    padding="md"
                    className="relative group hover:border-teal-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-black text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md">
                        {item.step}
                      </span>
                      <div className="w-10 h-10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <Icon3D name={iconName} size="md" className="w-10 h-10 object-contain drop-shadow-xs" />
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-text-primary mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {item.desc}
                    </p>
                  </Card>
                );
              })}
          </div>
        </div>
      </section>

      {/* ============================================================
          Key Pillars & Scientific Responsibility
          ============================================================ */}
      <section className="py-20 bg-slate-50/60 border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="primary">{t('home.pillars.badge')}</Badge>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-text-primary leading-tight">
                {t('home.pillars.title')}
              </h2>
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                {t('home.pillars.description')}
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text-primary">{t('home.pillars.item1Title')}</h4>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {t('home.pillars.item1Desc')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text-primary">{t('home.pillars.item2Title')}</h4>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {t('home.pillars.item2Desc')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text-primary">{t('home.pillars.item3Title')}</h4>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {t('home.pillars.item3Desc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual reassurance card */}
            <div className="p-8 rounded-[var(--radius-2xl)] bg-surface-card border border-surface-border shadow-lg space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-surface-border">
                <div className="w-11 h-11 flex items-center justify-center font-bold shrink-0">
                  <Icon3D name="shield" size="lg" className="w-11 h-11 object-contain drop-shadow-sm" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-text-primary">{t('home.pillars.charterTitle')}</h3>
                  <span className="text-xs text-text-muted">{t('home.pillars.charterSubtitle')}</span>
                </div>
              </div>

              <div className="space-y-4 text-xs text-text-secondary leading-relaxed">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                  <Icon3D name="shield" size="xs" className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <strong>{t('home.pillars.rule1Title')}</strong> {t('home.pillars.rule1Desc')}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                  <Icon3D name="clipboard" size="xs" className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <strong>{t('home.pillars.rule2Title')}</strong> {t('home.pillars.rule2Desc')}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                  <Icon3D name="care" size="xs" className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <strong>{t('home.pillars.rule3Title')}</strong> {t('home.pillars.rule3Desc')}
                  </div>
                </div>
              </div>

              <Link to="/privacy" className="block text-center text-xs text-teal-700 font-bold hover:underline">
                {t('home.pillars.privacyLink')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          Call to Action Banner
          ============================================================ */}
      <section className="py-16 bg-teal-900 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {t('home.ctaBanner.title')}
          </h2>
          <p className="text-sm sm:text-base text-teal-100 max-w-xl mx-auto leading-relaxed">
            {t('home.ctaBanner.subtitle')}
          </p>
          <div className="pt-2">
            <Link to="/assessment">
              <Button
                variant="primary"
                size="lg"
                className="bg-white text-teal-900 hover:bg-teal-50 active:bg-teal-100 shadow-xl font-bold text-base px-8 gap-2"
              >
                <span>{t('home.ctaBanner.button')}</span>
                <ArrowLeft className="h-5 w-5 rtl:rotate-0 ltr:rotate-180" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
