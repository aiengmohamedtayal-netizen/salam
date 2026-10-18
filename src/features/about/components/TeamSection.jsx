import {
  Crown,
  CheckCircle2,
  Briefcase,
  Wrench,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Icon3D } from '@/components/ui/Icon3D';
import { teamMembers } from '../data/projectData';
import { useTranslation } from '@/context/LanguageContext';

/**
 * Team Structure and Responsibilities Component
 * Strictly faithful to the Team Document:
 * Localized for Arabic and English.
 */
export function TeamSection() {
  const { isAr } = useTranslation();

  const getRole3DIcon = (member) => {
    if (member.isLeader) return 'care';
    if (member.roleEn.includes('Frontend')) return 'robot';
    if (member.roleEn.includes('Backend')) return 'shield';
    if (member.roleEn.includes('Model') || member.roleEn.includes('AI')) return 'brain';
    return 'clipboard';
  };

  return (
    <section className="space-y-12">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-surface-border">
        <div>
          <Badge variant="primary" className="mb-2 gap-2">
            <Icon3D name="community" size="xs" className="w-4 h-4 shrink-0" />
            <span>{isAr ? '2. هيكل الفريق والمسؤوليات' : '2. Team Structure & Roles'}</span>
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
            {isAr ? 'أعضاء الفريق والمهام المعتمدة' : 'Team Members & Assigned Roles'}
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            {isAr
              ? 'توزيع الأدوار والمسؤوليات التخصصية وفق متطلبات مقرر AI317 ووثيقة الفريق الرسمية.'
              : 'Distribution of specialized roles and responsibilities in accordance with AI317 course requirements.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info" size="md">
            {isAr ? '٦ أعضاء (٥ محددون + عضو قيد التأكيد)' : '6 Members (5 Assigned + 1 In Progress)'}
          </Badge>
        </div>
      </div>

      {/* Team Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => {
          const isLeader = member.isLeader;
          const isPlaceholder = member.isPlaceholder;

          return (
            <Card
              key={member.id + member.name}
              variant={isLeader ? 'bordered' : 'default'}
              padding="none"
              className={`flex flex-col justify-between overflow-hidden transition-all duration-200 hover:shadow-lg ${
                isLeader
                  ? 'border-teal-500/80 shadow-teal-700/5'
                  : isPlaceholder
                  ? 'border-dashed border-slate-300 bg-slate-50/50'
                  : 'hover:border-teal-300'
              }`}
            >
              {/* Card Header: Role & Identification */}
              <div
                className={`p-5 border-b border-surface-border ${
                  isLeader ? 'bg-teal-50/50' : isPlaceholder ? 'bg-slate-100/60' : 'bg-surface-card'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 p-1 ${
                      isLeader
                        ? 'bg-teal-50 border border-teal-200 shadow-xs'
                        : isPlaceholder
                        ? 'bg-slate-100 border border-slate-200 text-slate-700'
                        : 'bg-teal-50/60 border border-teal-100'
                    }`}
                  >
                    <Icon3D name={getRole3DIcon(member)} size="sm" className="w-8 h-8 object-contain" />
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {isLeader && (
                      <Badge variant="primary" size="sm" className="font-bold gap-1">
                        <Crown className="h-3 w-3 text-amber-600" aria-hidden="true" />
                        <span>{isAr ? 'قائدة الفريق' : 'Team Leader'}</span>
                      </Badge>
                    )}
                    {isPlaceholder && (
                      <Badge variant="attention" size="sm">
                        {isAr ? 'قيد التحديد' : 'TBD'}
                      </Badge>
                    )}
                    <span className="text-[11px] font-mono text-text-muted bg-surface-muted px-2 py-0.5 rounded-md border border-surface-border">
                      ID: {isAr ? member.id : member.idEn || member.id}
                    </span>
                  </div>
                </div>

                {/* Name & English Subtitle */}
                <div>
                  <h3 className="text-lg font-black text-text-primary leading-snug">
                    {isAr ? member.name : member.nameEn || member.name}
                  </h3>
                  <span className="text-xs font-mono text-text-muted block mt-0.5">
                    {isAr ? member.nameEn : member.name}
                  </span>
                </div>

                {/* Primary Project Role */}
                <div className="mt-3 pt-3 border-t border-surface-border/80 flex items-center gap-2">
                  <Briefcase className="h-3.5 w-3.5 text-teal-700 shrink-0" aria-hidden="true" />
                  <span className="text-xs font-bold text-teal-900 leading-tight">
                    {isAr ? member.role : member.roleEn || member.role}
                  </span>
                </div>
              </div>

              {/* Card Body: Ownership -> Responsibilities -> Skills */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Ownership Block */}
                  <div className="p-3 rounded-xl bg-surface-muted/70 border border-surface-border space-y-1">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                      {isAr ? 'نطاق المسؤولية والملكية (Ownership)' : 'Ownership Domain'}
                    </span>
                    <p className="text-xs text-text-primary font-medium leading-relaxed">
                      {isAr ? member.ownership : member.ownershipEn || member.ownership}
                    </p>
                  </div>

                  {/* Core Responsibilities List */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-text-secondary block">
                      {isAr ? 'المهام والمسؤوليات الأساسية:' : 'Core Responsibilities:'}
                    </span>
                    <ul className="space-y-1.5 text-xs text-text-secondary leading-relaxed">
                      {(isAr ? member.responsibilities : member.responsibilitiesEn || member.responsibilities).map((resp, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2
                            className="h-3.5 w-3.5 text-teal-600 shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Skills & Capabilities Footer */}
                <div className="pt-3 border-t border-surface-border mt-4">
                  <div className="flex items-center gap-1.5 text-[11px] text-text-muted font-medium mb-1">
                    <Wrench className="h-3 w-3 text-slate-500" aria-hidden="true" />
                    <span>{isAr ? 'الكفاءات والمهارات المقترحة:' : 'Target Competencies & Skills:'}</span>
                  </div>
                  <p className="text-xs font-mono text-slate-700 bg-slate-100/80 px-2.5 py-1.5 rounded-lg border border-slate-200/80 leading-relaxed">
                    {isAr ? member.skills : member.skillsEn || member.skills}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Skills Transparency Note */}
      <div className="p-4 rounded-xl bg-surface-card border border-surface-border flex items-start gap-3 text-xs text-text-secondary leading-relaxed">
        <Icon3D name="community" size="xs" className="w-5 h-5 shrink-0 mt-0.5" />
        <p>
          <strong>{isAr ? 'ملاحظة توثيقية:' : 'Documentation Note:'}</strong>{' '}
          {isAr
            ? 'المهارات المذكورة أعلاه هي كفاءات وقدرات مقترحة موائمة لكل دور وليست ادعاءات قطعية بشأن الخبرة الفردية السابقة. يقوم كل عضو بتعديل هذا الحقل بما يعكس مهاراته وخبراته الفعلية قبل التسليم النهائي.'
            : 'The skills listed above are proposed target competencies aligned with each respective role rather than prior clinical or enterprise claims. Each member refines their profile prior to final submission.'}
        </p>
      </div>
    </section>
  );
}
