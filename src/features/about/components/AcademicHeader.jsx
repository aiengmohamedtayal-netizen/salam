import { motion } from 'framer-motion';
import { GraduationCap, Award, BookOpen, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { academicMetadata } from '../data/projectData';
import { fadeUp, safeMotion } from '@/lib/motion';
import { useTranslation } from '@/context/LanguageContext';

/**
 * Academic Context and Project Header Component
 * Grounded in University requirements, AI317 Course, and Academic Supervision.
 * Localized for Arabic and English.
 */
export function AcademicHeader() {
  const { t, isAr } = useTranslation();

  return (
    <motion.header {...safeMotion(fadeUp)} className="space-y-6 text-center max-w-4xl mx-auto">
      {/* Top Academic Credential Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <Badge variant="primary" size="md" className="gap-2 py-1 px-3.5 shadow-2xs font-semibold">
          <GraduationCap className="h-4 w-4 text-teal-700 shrink-0" aria-hidden="true" />
          <span>{isAr ? academicMetadata.university : 'Delta University for Science and Technology'}</span>
        </Badge>
        <span className="text-text-muted text-xs hidden sm:inline">•</span>
        <Badge variant="default" size="md" className="gap-2 py-1 px-3.5 font-medium">
          <BookOpen className="h-4 w-4 text-slate-600 shrink-0" aria-hidden="true" />
          <span>{isAr ? academicMetadata.faculty : academicMetadata.department}</span>
        </Badge>
        <span className="text-text-muted text-xs hidden sm:inline">•</span>
        <Badge variant="info" size="md" className="gap-2 py-1 px-3.5 font-bold">
          <Award className="h-4 w-4 text-sky-700 shrink-0" aria-hidden="true" />
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
          <UserCheck className="h-4 w-4 text-teal-700 shrink-0" aria-hidden="true" />
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
