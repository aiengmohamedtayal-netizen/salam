import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Icon3D } from '@/components/ui/Icon3D';
import { academicMetadata } from '../data/projectData';
import { fadeUp, safeMotion } from '@/lib/motion';
import { useTranslation } from '@/context/LanguageContext';

/**
 * Academic Context and Project Header Component
 * Grounded in University requirements, AI317 Course, and Academic Supervision.
 * Localized for Arabic and English.
 */
export function AcademicHeader() {
  const { isAr } = useTranslation();

  return (
    <motion.header {...safeMotion(fadeUp)} className="space-y-6 text-center max-w-4xl mx-auto">
      {/* Top Academic Credential Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <Badge variant="primary" size="md" className="gap-2 py-1 px-3.5 shadow-2xs font-semibold">
          <Icon3D name="graduation" size="xs" className="w-5 h-5 shrink-0" />
          <span>{isAr ? academicMetadata.university : 'Delta University for Science and Technology'}</span>
        </Badge>
        <span className="text-text-muted text-xs hidden sm:inline">•</span>
        <Badge variant="default" size="md" className="gap-2 py-1 px-3.5 font-medium">
          <Icon3D name="books" size="xs" className="w-5 h-5 shrink-0" />
          <span>{isAr ? academicMetadata.faculty : academicMetadata.department}</span>
        </Badge>
        <span className="text-text-muted text-xs hidden sm:inline">•</span>
        <Badge variant="info" size="md" className="gap-2 py-1 px-3.5 font-bold">
          <Icon3D name="lightbulb" size="xs" className="w-5 h-5 shrink-0" />
          <span>
            {isAr
              ? `مقرر ${academicMetadata.courseCode}`
              : `Course ${academicMetadata.courseCode}`}
          </span>
        </Badge>
      </div>

      {/* Main Title & Subtitle */}
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-5xl font-black text-text-primary tracking-tight leading-tight">
          {isAr ? academicMetadata.projectTitle : academicMetadata.projectTitleEn}
        </h1>
        <p className="text-xs sm:text-sm font-mono text-text-muted">
          {isAr ? academicMetadata.projectTitleEn : academicMetadata.projectTitle}
        </p>
      </div>

      {/* Supervisor and Course Pill */}
      <div className="inline-flex flex-wrap items-center justify-center gap-4 py-2.5 px-5 rounded-2xl bg-surface-card border border-surface-border shadow-xs text-xs sm:text-sm">
        <div className="flex items-center gap-2 text-teal-900 font-bold">
          <Icon3D name="community" size="xs" className="w-4 h-4 shrink-0" />
          <span>{isAr ? `إشراف: ${academicMetadata.supervisor}` : academicMetadata.supervisorTitle}</span>
        </div>
        <span className="w-1.5 h-1.5 rounded-full bg-surface-border-strong hidden sm:block" aria-hidden="true" />
        <span className="text-text-secondary">
          {isAr ? academicMetadata.courseName : academicMetadata.courseNameEn}
        </span>
      </div>
    </motion.header>
  );
}
