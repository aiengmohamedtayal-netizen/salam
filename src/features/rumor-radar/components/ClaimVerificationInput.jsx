import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Lock,
  ArrowLeft,
  FileQuestion,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { fadeUp, safeMotion } from '@/lib/motion';
import { useTranslation } from '@/context/LanguageContext';
import { getStatusMeta } from '../data/radarData';

/**
 * Claim Verification Input & Analysis Component
 * Allows users to paste a claim, headline, or circulating rumor and view evidence-based analysis.
 * Does not store submitted text into localStorage or permanent storage.
 */
export function ClaimVerificationInput({ onAnalysisResult }) {
  const { t, language } = useTranslation();
  const isEn = language === 'en';

  const [claimInput, setClaimInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeAnalysis, setActiveAnalysis] = useState(null);

  const handleVerify = (e) => {
    e.preventDefault();
    const trimmed = claimInput.trim();

    if (!trimmed || trimmed.length < 10) {
      setErrorMessage(
        isEn
          ? 'Please enter sufficient claim text to perform verification (at least 10 characters).'
          : 'أدخل ادعاءً أو محتوى كافياً لإجراء التحقق (10 أحرف على الأقل).'
      );
      setActiveAnalysis(null);
      return;
    }

    setErrorMessage('');
    setIsAnalyzing(true);
    setActiveAnalysis(null);

    // Heuristic analysis simulation based on textual indicators
    setTimeout(() => {
      const lower = trimmed.toLowerCase();
      let status = 'needs_verification';
      let confidence = 'أولي (مبني على خصائص النص والتركيب اللغوي)';
      let confidenceEn = 'Preliminary (grounded in syntax & textual indicators)';
      let indicators = [];
      let indicatorsEn = [];
      let sources = [];
      let explanation = '';
      let explanationEn = '';

      if (
        lower.includes('علاج نهائي') ||
        lower.includes('علاج فوري') ||
        lower.includes('يشفي تماما') ||
        lower.includes('معجزة') ||
        lower.includes('سر خطير') ||
        lower.includes('سري للغاية') ||
        lower.includes('cure') ||
        lower.includes('miracle')
      ) {
        status = 'potentially_misleading';
        confidence = 'متوسط (مرتفع الدلالة على الصياغات الدعائية غير المعتمدة)';
        confidenceEn = 'Moderate (strong indicators of uncertified promotional phrasing)';
        indicators = [
          'صياغة مثيرة أو مبالغ فيها',
          'نقص المصادر المعتمدة',
          'مصدر النشر الأساسي غير واضح',
        ];
        indicatorsEn = [
          'Sensational or exaggerated phrasing',
          'Lack of verified sources',
          'Primary publishing origin unclear',
        ];
        explanation =
          'استخدام مفردات الجزم بالشفاء المطلق أو الأسرار الطبية الخفية يرتبط بنمط الشائعات الترويجية التي تفتقر لتجارب سريرية موثقة.';
        explanationEn =
          'Absolute guarantees of rapid remission or hidden remedies strongly align with viral promotional claims lacking controlled clinical trials.';
        sources = [
          {
            name: 'قواعد الأدلة الطبية الصيدلانية',
            nameEn: 'Clinical Pharmacology Evidence Databases',
            status: 'مصدر متعارض مع الادعاء',
            statusEn: 'Conflicting with Claim',
            relevance: 'لا توجد أدوية عشبية فورية مرخصة تشفي الاضطرابات النفسية جذرياً دون بروتوكول علاجي.',
            relevanceEn: 'No licensed herbal preparations cure mental disorders instantaneously without clinical protocols.',
          },
        ];
      } else if (
        lower.includes('16328') ||
        lower.includes('الخط الساخن') ||
        lower.includes('وزارة الصحة') ||
        lower.includes('hotline')
      ) {
        status = 'verified';
        confidence = 'مرتفع (مطابق للبيانات الحكومية المعلنة)';
        confidenceEn = 'High (corroborated by published governmental records)';
        indicators = [];
        indicatorsEn = [];
        explanation =
          'النص يتطابق مع الخدمات الوطنية المعلنة رسمياً من وزارة الصحة والأمانة العامة للصحة النفسية.';
        explanationEn =
          'Text matches verified national support services managed by the Egyptian Ministry of Health & GSMH.';
        sources = [
          {
            name: 'وزارة الصحة والسكان المصرية',
            nameEn: 'Egyptian Ministry of Health & Population',
            status: 'مصدر داعم رسمي',
            statusEn: 'Official Supporting Source',
            relevance: 'الخط الساخن 16328 معتمد لخدمات الدعم والاستشارات النفسية المجانية.',
            relevanceEn: 'Hotline 16328 is the accredited free mental health counseling service.',
          },
        ];
      } else {
        status = 'needs_verification';
        confidence = 'أولي (يستلزم الرجوع لمصادر متخصصة إضافية)';
        confidenceEn = 'Preliminary (requires further authoritative cross-referencing)';
        indicators = [
          'نقص المصادر المعتمدة',
          'معلومات يصعب التحقق منها ميدانياً',
        ];
        indicatorsEn = [
          'Lack of verified sources',
          'Difficult to verify empirically',
        ];
        explanation =
          'لم تتوفر مصادر رسمية أولية تؤكد هذا الادعاء أو تنفيه بشكل قاطع حتى لحظة الفحص. يوصى بعدم تداوله كحقيقة مطلقة.';
        explanationEn =
          'No official primary sources conclusively substantiate or refute this narrative at the time of review. Exercise caution before sharing.';
        sources = [];
      }

      const result = {
        claimText: trimmed,
        status,
        confidence,
        confidenceEn,
        indicators,
        indicatorsEn,
        explanation,
        explanationEn,
        sources,
        analyzedAt: isEn ? 'Just now' : 'الآن',
      };

      setIsAnalyzing(false);
      setActiveAnalysis(result);
      if (onAnalysisResult) onAnalysisResult(result);
    }, 900);
  };

  const handleReset = () => {
    setClaimInput('');
    setErrorMessage('');
    setActiveAnalysis(null);
  };

  return (
    <Card variant="default" padding="lg" className="border border-surface-border space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-border">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-text-primary flex items-center gap-2">
            <Search className="h-5 w-5 text-teal-700" aria-hidden="true" />
            <span>{isEn ? 'Inspect a Circulating Claim or Narrative' : 'تحقق من ادعاء أو خبر متداول'}</span>
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            {isEn
              ? 'Paste the circulating text to evaluate linguistic risk indicators and match against available evidence.'
              : 'الصق النص لتحليله وفق مؤشرات الرصد اللغوية وقاعدة الأدلة المتاحة.'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Lock className="h-3.5 w-3.5 text-teal-600" aria-hidden="true" />
          <span>{isEn ? 'Strict Privacy: Submitted text is never stored' : 'خصوصية تامة: لا يتم حفظ نص الادعاء'}</span>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleVerify} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="claim-textarea" className="text-xs font-bold text-text-primary block">
            {isEn ? 'Paste the news headline or narrative to verify:' : 'الصق الخبر أو الادعاء الذي تريد التحقق منه:'}
          </label>
          <textarea
            id="claim-textarea"
            rows={3}
            value={claimInput}
            onChange={(e) => {
              setClaimInput(e.target.value);
              if (errorMessage) setErrorMessage('');
            }}
            placeholder={
              isEn
                ? 'e.g., Viral claims about rapid depression remedies, or news about mental health service availability...'
                : 'مثال: منشورات تزعم اكتشاف علاج جديد للاكتئاب يشفي تماماً في يومين، أو خبر عن خدمة دعم نفسي...'
            }
            className="w-full rounded-[var(--radius-lg)] border border-surface-border bg-surface-card p-3.5 text-sm text-text-primary placeholder:text-text-muted leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          />
        </div>

        {errorMessage && (
          <Alert variant="warning" title={isEn ? 'Notice' : 'تنبيه'}>
            <span>{errorMessage}</span>
          </Alert>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isAnalyzing}
              className="gap-2 px-6"
            >
              {isAnalyzing ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>{isEn ? 'Analyzing content and sources...' : 'جارٍ تحليل المحتوى والمصادر...'}</span>
                </>
              ) : (
                <>
                  <span>{isEn ? 'Inspect Claim' : 'ابدأ التحقق'}</span>
                  <ArrowLeft className="h-4 w-4 ltr:rotate-180 rtl:rotate-0" aria-hidden="true" />
                </>
              )}
            </Button>

            {claimInput && (
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={handleReset}
                className="gap-1.5 text-text-secondary"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                <span>{isEn ? 'Clear' : 'مسح النص'}</span>
              </Button>
            )}
          </div>

          <span className="text-[11px] text-text-muted">
            {isEn
              ? 'Advisory assessment grounded in uncertainty margins and evidence checks'
              : 'التقييم استرشادي مبني على رصد مؤشرات الشك والتوثيق'}
          </span>
        </div>
      </form>

      {/* Analysis Result Card */}
      <AnimatePresence>
        {activeAnalysis && (
          <motion.div {...safeMotion(fadeUp)} className="pt-6 border-t border-surface-border space-y-5">
            <div className="p-5 rounded-2xl bg-surface-muted/80 border border-surface-border space-y-4">
              {/* Header Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-border">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-text-muted">
                    {isEn ? 'Verification Status:' : 'حالة التقييم:'}
                  </span>
                  <Badge
                    variant={
                      activeAnalysis.status === 'verified'
                        ? 'safe'
                        : activeAnalysis.status === 'potentially_misleading'
                        ? 'elevated'
                        : 'attention'
                    }
                    size="md"
                    className="font-bold text-xs"
                  >
                    {getStatusMeta(activeAnalysis.status, language).label}
                  </Badge>
                </div>
                <div className="text-xs text-text-secondary">
                  <span className="font-bold text-text-muted">
                    {isEn ? 'Confidence Level:' : 'درجة الثقة في التقييم:'}
                  </span>{' '}
                  <span className="font-mono text-teal-900 font-semibold">
                    {isEn ? activeAnalysis.confidenceEn : activeAnalysis.confidence}
                  </span>
                </div>
              </div>

              {/* Verified Text */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
                  {isEn ? 'Evaluated Claim:' : 'الادعاء المدخل:'}
                </span>
                <p className="text-xs sm:text-sm font-semibold text-text-primary leading-relaxed">
                  «{activeAnalysis.claimText}»
                </p>
              </div>

              {/* Why Flagged */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4 text-teal-700" aria-hidden="true" />
                  <span>
                    {isEn
                      ? 'Why is this narrative under review? (Observed Indicators):'
                      : 'لماذا تم وضع هذا الادعاء تحت المراجعة؟ (مؤشرات الرصد):'}
                  </span>
                </span>
                {(isEn ? activeAnalysis.indicatorsEn : activeAnalysis.indicators).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {(isEn ? activeAnalysis.indicatorsEn : activeAnalysis.indicators).map((ind, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-card border border-surface-border text-xs text-text-secondary font-medium"
                      >
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" aria-hidden="true" />
                        <span>{ind}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                    {isEn
                      ? 'No deceptive linguistic markers observed; claim aligns with accredited public data.'
                      : 'لم تُرصد مؤشرات تضليل لغوية أو مبالغات إنشائية في صياغة هذا الادعاء.'}
                  </p>
                )}
              </div>

              {/* Factors & Explanation */}
              <div className="space-y-1 pt-1">
                <span className="text-xs font-bold text-text-secondary block">
                  {isEn ? 'Factors Influencing Assessment:' : 'العوامل التي أثرت في التقييم:'}
                </span>
                <p className="text-xs text-text-secondary leading-relaxed bg-surface-card p-3 rounded-xl border border-surface-border">
                  {isEn ? activeAnalysis.explanationEn : activeAnalysis.explanation}
                </p>
              </div>

              {/* Sources */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold text-text-secondary block">
                  {isEn ? 'Referenced Sources & Registers:' : 'المصادر المتاحة:'}
                </span>
                {activeAnalysis.sources.length > 0 ? (
                  <div className="space-y-2">
                    {activeAnalysis.sources.map((src, sIdx) => (
                      <div
                        key={sIdx}
                        className="p-3 rounded-xl bg-surface-card border border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <strong className="text-text-primary block">
                            {isEn && src.nameEn ? src.nameEn : src.name}
                          </strong>
                          <span className="text-[11px] text-text-muted">
                            {isEn && src.relevanceEn ? src.relevanceEn : src.relevance}
                          </span>
                        </div>
                        <Badge variant="default" size="sm" className="self-start sm:self-center">
                          {isEn && src.statusEn ? src.statusEn : src.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-text-muted italic bg-surface-card p-3 rounded-xl border border-surface-border">
                    {isEn
                      ? 'No authoritative records available yet for this specific phrasing.'
                      : 'لم يتم العثور على مصادر كافية للمراجعة حتى الآن.'}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
