import {
  FileText,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  Database,
  Cpu,
  Layers,
  Sparkles,
  BarChart2,
  Code,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { projectOverview, taskSpecification } from '../data/projectData';
import { useTranslation } from '@/context/LanguageContext';

/**
 * Project Overview Section: Task Specification Profile, Problem Statement,
 * Proposed Solution, Arabic Concept Details, Scope Checklist, and Dataset/Compute Governance.
 */
export function ProjectOverviewSection() {
  const { t, language } = useTranslation();
  const isEn = language === 'en';

  return (
    <section className="space-y-12">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-surface-border">
        <div>
          <Badge variant="primary" className="mb-2">
            {isEn ? '1. Project Context & Vision' : '1. معلومات ورؤية المشروع'}
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
            {t('about.concept.title')}
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            {t('about.concept.subtitle')}
          </p>
        </div>
      </div>

      {/* Task Specification Profile Banner */}
      <Card
        variant="default"
        padding="lg"
        className="border border-teal-200 bg-gradient-to-br from-teal-50/50 via-surface-card to-surface-card shadow-xs space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-teal-100">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold text-sm font-mono">
              {taskSpecification.taskNumber}
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-text-primary">
                {isEn && taskSpecification.titleEn ? taskSpecification.titleEn : taskSpecification.title}
              </h3>
              <span className="text-xs font-mono text-teal-800 font-semibold block">
                {taskSpecification.titleEn}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted font-medium">
              {isEn ? 'Difficulty Level:' : 'مستوى الصعوبة:'}
            </span>
            <Badge variant="attention" size="sm" className="font-bold">
              {isEn ? 'Intermediate' : taskSpecification.difficulty}
            </Badge>
          </div>
        </div>

        {/* Concept Line */}
        <div className="p-3.5 rounded-xl bg-surface-card border border-surface-border space-y-1">
          <span className="text-xs font-bold text-teal-900 block">
            {isEn ? 'Foundational Concept:' : 'الفكرة الأساسية:'}
          </span>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            {isEn ? taskSpecification.conceptEn || taskSpecification.concept : taskSpecification.concept}
          </p>
        </div>

        {/* 3-Column Specifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Tech List */}
          <div className="p-3 rounded-xl bg-surface-muted/70 border border-surface-border space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-text-primary">
              <Code className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" />
              <span>{isEn ? 'Tech & Architectures:' : 'التقنيات والنماذج:'}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {taskSpecification.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 rounded bg-surface-card border border-surface-border font-mono text-[11px] text-text-secondary"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Outputs */}
          <div className="p-3 rounded-xl bg-surface-muted/70 border border-surface-border space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-text-primary">
              <Sparkles className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" />
              <span>{isEn ? 'Approved Output Scope:' : 'المخرجات المعتمدة:'}</span>
            </div>
            <p className="text-text-secondary leading-relaxed font-medium">
              {isEn ? taskSpecification.outputsEn || taskSpecification.outputs : taskSpecification.outputs}
            </p>
          </div>

          {/* Evaluation Metrics */}
          <div className="p-3 rounded-xl bg-surface-muted/70 border border-surface-border space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-text-primary">
              <BarChart2 className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" />
              <span>{isEn ? 'Evaluation Metrics:' : 'مقاييس التقييم:'}</span>
            </div>
            <p className="font-mono text-text-secondary leading-relaxed text-[11px]">
              {taskSpecification.evaluation}
            </p>
          </div>
        </div>
      </Card>

      {/* Problem & Solution Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Problem Card */}
        <Card variant="default" padding="lg" className="border-s-4 border-s-amber-500 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold shrink-0">
              <AlertCircle className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xs font-mono text-amber-800 font-bold uppercase tracking-wider block">
                Problem Statement
              </span>
              <h3 className="text-lg font-bold text-text-primary">
                {isEn ? 'Challenge Addressed by SALAM' : 'المشكلة التي يعالجها النظام'}
              </h3>
            </div>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">
            {isEn ? projectOverview.problemStatementEn || projectOverview.problemStatement : projectOverview.problemStatement}
          </p>
        </Card>

        {/* Proposed Solution Card */}
        <Card variant="default" padding="lg" className="border-s-4 border-s-teal-600 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold shrink-0">
              <Lightbulb className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xs font-mono text-teal-800 font-bold uppercase tracking-wider block">
                Proposed Solution
              </span>
              <h3 className="text-lg font-bold text-text-primary">
                {isEn ? 'Proposed Solution & Architecture' : 'الحل المقترح ومنظومة العمل'}
              </h3>
            </div>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">
            {isEn ? projectOverview.proposedSolutionEn || projectOverview.proposedSolution : projectOverview.proposedSolution}
          </p>
        </Card>
      </div>

      {/* Detailed Concept Points */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <FileText className="h-5 w-5 text-teal-700" aria-hidden="true" />
            <span>
              {isEn ? 'Core Concept Breakdown (Team Document)' : 'شرح فكرة المشروع باللغة العربية (وثيقة العمل)'}
            </span>
          </h3>
          <span className="text-xs text-text-muted font-mono">
            {isEn ? '6 Key Pillars' : '6 محاور توضيحية'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projectOverview.arabicConceptPoints.map((point, index) => {
            const isRedLine = point.id === 'red-lines';
            return (
              <Card
                key={point.id}
                variant={isRedLine ? 'bordered' : 'default'}
                padding="md"
                className={`flex flex-col justify-between transition-all duration-200 hover:shadow-md ${
                  isRedLine ? 'border-rose-300 bg-rose-50/20' : 'hover:border-teal-300'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-surface-border">
                    <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded">
                      0{index + 1}
                    </span>
                    {isRedLine ? (
                      <Badge variant="elevated" size="sm">
                        {isEn ? 'Red Lines' : 'خطوط حمراء'}
                      </Badge>
                    ) : (
                      <Badge variant="default" size="sm">
                        {isEn ? 'Pillar' : 'محور توضيحي'}
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-bold text-base text-text-primary">
                    {isEn ? point.titleEn || point.title : point.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    {isEn ? point.descriptionEn || point.description : point.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Scope Checklist */}
      <Card variant="default" padding="lg" className="space-y-6 bg-surface-card border border-surface-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
              <Layers className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">
                {isEn ? 'System Scope & Deliverables' : 'نطاق عمل المنظومة (Project Scope)'}
              </h3>
              <p className="text-xs text-text-muted">
                {isEn
                  ? 'Agreed technical criteria and boundary constraints in team specifications'
                  : 'المعايير والحدود الفنية المتفق عليها في وثيقة الفريق'}
              </p>
            </div>
          </div>
          <Badge variant="info">
            {isEn ? '9 Approved Items' : '٩ بنود معتمدة'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(isEn && projectOverview.scopeItemsEn ? projectOverview.scopeItemsEn : projectOverview.scopeItems).map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-muted/60 border border-surface-border text-xs leading-relaxed text-text-secondary"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Dataset & Compute Guidelines Callout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 rounded-2xl bg-surface-card border border-surface-border space-y-3">
          <div className="flex items-center gap-2.5 text-text-primary font-bold text-sm">
            <Database className="h-4 w-4 text-teal-700" aria-hidden="true" />
            <span>
              {isEn ? 'Dataset Governance & Audit Protocol' : 'حوكمة وتدقيق مجموعة البيانات (Dataset Audit)'}
            </span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            {isEn
              ? projectOverview.datasetAndCompute.datasetAuditEn || projectOverview.datasetAndCompute.datasetAudit
              : projectOverview.datasetAndCompute.datasetAudit}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface-card border border-surface-border space-y-3">
          <div className="flex items-center gap-2.5 text-text-primary font-bold text-sm">
            <Cpu className="h-4 w-4 text-teal-700" aria-hidden="true" />
            <span>
              {isEn ? 'Compute & Hardware Strategy' : 'استراتيجية موارد الحوسبة (Compute & Hardware)'}
            </span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            {isEn
              ? projectOverview.datasetAndCompute.computeStrategyEn || projectOverview.datasetAndCompute.computeStrategy
              : projectOverview.datasetAndCompute.computeStrategy}
          </p>
        </div>
      </div>
    </section>
  );
}
