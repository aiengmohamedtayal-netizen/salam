import { Link } from 'react-router-dom';
import { Icon3D } from '@/components/ui/Icon3D';
import { useTranslation } from '@/context/LanguageContext';

/**
 * Standardized header for SALAM authentication pages.
 * Displays brand identity, page title, and supporting description.
 * @param {object} props
 * @param {string} props.title - Main heading
 * @param {string} props.subtitle - Supporting text
 */
export function AuthHeader({ title, subtitle }) {
  const { t, language } = useTranslation();
  const homePath = language === 'en' ? '/en' : '/ar';

  return (
    <div className="flex flex-col items-center text-center mb-8">
      {/* Brand Identity Link */}
      <Link
        to={homePath}
        className="inline-flex items-center gap-3 group focus-visible:outline-2 focus-visible:outline-primary-500 rounded-xl p-1.5 transition-transform hover:scale-[1.02]"
        aria-label={t('common.brandName')}
      >
        <div className="w-12 h-12 rounded-xl bg-teal-50/80 border border-teal-100 flex items-center justify-center shrink-0 shadow-xs group-hover:border-teal-200 transition-colors">
          <Icon3D
            name="brain"
            size="lg"
            className="w-9 h-9 object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
          />
        </div>
        <div className="flex flex-col text-start">
          <span className="text-2xl font-black tracking-tight text-text-primary group-hover:text-primary-700 transition-colors">
            {t('common.brandName')}
          </span>
          <span className="text-[11px] text-text-muted font-semibold -mt-1 leading-tight">
            {t('common.brandSubtitle')}
          </span>
        </div>
      </Link>

      {/* Page Title & Subtitle */}
      <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight mt-6">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm text-text-secondary mt-2 max-w-sm leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
