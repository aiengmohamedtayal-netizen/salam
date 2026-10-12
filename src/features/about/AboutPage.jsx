import { useState } from 'react';
import { motion } from 'framer-motion';
import { AcademicHeader } from './components/AcademicHeader';
import { ProjectOverviewSection } from './components/ProjectOverviewSection';
import { TeamSection } from './components/TeamSection';
import { PipelineArchitectureSection } from './components/PipelineArchitectureSection';
import { TechStackSection } from './components/TechStackSection';
import { DevelopmentPlanSection } from './components/DevelopmentPlanSection';
import { SafetyGovernanceSection } from './components/SafetyGovernanceSection';
import { AcademicReferencesSection } from './components/AcademicReferencesSection';
import { fadeUp, safeMotion } from '@/lib/motion';
import { useTranslation } from '@/context/LanguageContext';

/**
 * AboutPage — Comprehensive Academic & Technical System Documentation
 * Grounded in AI317 Team Document (AI317_SALAM_Team_Document_Arabic_Updated.docx)
 * Strictly preserving the SALAM Design System (RTL/LTR, Cairo, Semantic Tokens, WCAG AA).
 * Localized for Arabic and English.
 */
export function AboutPage() {
  const [activeTab, setActiveTab] = useState('all');
  const { t } = useTranslation();

  const SECTIONS_NAV = [
    { id: 'all', label: t('about.tabs.all') },
    { id: 'overview', label: t('about.tabs.overview') },
    { id: 'team', label: t('about.tabs.team') },
    { id: 'pipeline', label: t('about.tabs.pipeline') },
    { id: 'stack', label: t('about.tabs.stack') },
    { id: 'plan', label: t('about.tabs.plan') },
    { id: 'safety', label: t('about.tabs.safety') },
    { id: 'references', label: t('about.tabs.references') },
  ];

  return (
    <div className="py-10 sm:py-16 bg-surface-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* 1. Academic & University Context Header */}
        <AcademicHeader />

        {/* 2. Quick Section Filter / Jump Bar */}
        <div className="sticky top-16 z-30 py-3 -my-3 bg-surface-bg/95 backdrop-blur-md border-y border-surface-border overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 min-w-max pb-1 sm:pb-0 justify-center">
            {SECTIONS_NAV.map((nav) => {
              const isActive = activeTab === nav.id;
              return (
                <button
                  key={nav.id}
                  type="button"
                  onClick={() => setActiveTab(nav.id)}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer select-none ${
                    isActive
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted bg-surface-card border border-surface-border'
                  }`}
                >
                  {nav.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Document Sections (Conditionally filtered or all visible) */}
        <div className="space-y-20">
          {(activeTab === 'all' || activeTab === 'overview') && (
            <motion.div {...safeMotion(fadeUp)}>
              <ProjectOverviewSection />
            </motion.div>
          )}

          {(activeTab === 'all' || activeTab === 'team') && (
            <motion.div {...safeMotion(fadeUp)}>
              <TeamSection />
            </motion.div>
          )}

          {(activeTab === 'all' || activeTab === 'pipeline') && (
            <motion.div {...safeMotion(fadeUp)}>
              <PipelineArchitectureSection />
            </motion.div>
          )}

          {(activeTab === 'all' || activeTab === 'stack') && (
            <motion.div {...safeMotion(fadeUp)}>
              <TechStackSection />
            </motion.div>
          )}

          {(activeTab === 'all' || activeTab === 'plan') && (
            <motion.div {...safeMotion(fadeUp)}>
              <DevelopmentPlanSection />
            </motion.div>
          )}

          {(activeTab === 'all' || activeTab === 'safety') && (
            <motion.div {...safeMotion(fadeUp)}>
              <SafetyGovernanceSection />
            </motion.div>
          )}

          {(activeTab === 'all' || activeTab === 'references') && (
            <motion.div {...safeMotion(fadeUp)}>
              <AcademicReferencesSection />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
