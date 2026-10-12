import { CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { developmentPhases } from '../data/projectData';
import { useTranslation } from '@/context/LanguageContext';

/**
 * Development Plan and Team Coordination Section
 * Visualizes the 6-phase chronological milestone progression.
 */
export function DevelopmentPlanSection() {
  const { t, language } = useTranslation();
  const isEn = language === 'en';

  return (
    <section className="space-y-12">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-surface-border">
        <div>
          <Badge variant="primary" className="mb-2">
            {isEn ? '4. Development Roadmap & Phases' : '4. خطة التطوير ومراحل العمل'}
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
            {t('about.plan.title')}
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            {t('about.plan.subtitle')}
          </p>
        </div>
        <Badge variant="info">
          {isEn ? '6 Chronological Milestones' : '٦ مراحل تنفيذية'}
        </Badge>
      </div>

      {/* Timeline Phases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {developmentPhases.map((phaseItem) => {
          return (
            <Card
              key={phaseItem.phase}
              variant="default"
              padding="md"
              className="relative flex flex-col justify-between hover:border-teal-300 hover:shadow-md transition-all duration-200"
            >
              <div className="space-y-3">
                {/* Header: Phase Number & En Title */}
                <div className="flex items-center justify-between pb-3 border-b border-surface-border">
                  <span className="text-xs font-mono font-black text-teal-800 bg-teal-50 px-3 py-1 rounded-md border border-teal-200">
                    {isEn ? phaseItem.phaseEn : `المرحلة ${phaseItem.phase}`}
                  </span>
                  <span className="text-xs font-mono text-text-muted">
                    {phaseItem.phaseEn}
                  </span>
                </div>

                {/* Phase Titles */}
                <div>
                  <h3 className="text-base font-bold text-text-primary">
                    {isEn ? phaseItem.titleEn : phaseItem.title}
                  </h3>
                  <span className="text-xs font-mono text-teal-700 block mt-0.5">
                    {phaseItem.titleEn}
                  </span>
                </div>

                {/* Phase Description */}
                <p className="text-xs text-text-secondary leading-relaxed">
                  {isEn ? phaseItem.descriptionEn || phaseItem.description : phaseItem.description}
                </p>

                {/* Tasks List */}
                <div className="pt-2 border-t border-surface-border space-y-1.5">
                  <span className="text-[11px] font-bold text-teal-900 block">
                    {isEn ? 'Assigned Responsibilities & Tasks:' : 'المسؤوليات والمهام المرتبطة:'}
                  </span>
                  <ul className="space-y-1">
                    {((isEn && phaseItem.tasksEn) ? phaseItem.tasksEn : (phaseItem.tasks || phaseItem.deliverables || [])).map((task, tIdx) => (
                      <li key={tIdx} className="text-[11px] text-text-secondary flex items-start gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Phase Deliverable Banner */}
              <div className="pt-3 border-t border-surface-border mt-4">
                <span className="text-[10px] text-text-muted block">
                  {isEn ? 'Milestone Deliverable:' : 'المخرج المعتمد للمرحلة:'}
                </span>
                <span className="text-xs font-bold text-text-primary block mt-0.5">
                  {isEn ? phaseItem.deliverableEn || phaseItem.deliverable : phaseItem.deliverable}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
