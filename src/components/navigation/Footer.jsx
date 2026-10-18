import { Link } from 'react-router-dom';
import { Icon3D } from '@/components/ui/Icon3D';
import { useTranslation } from '@/context/LanguageContext';

/**
 * Site-wide Footer with refined information architecture, calm visual density,
 * integrated support panel, and mandatory non-medical disclaimer.
 */
export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950 text-slate-300 transition-colors">
      {/* 1. Top Section: Clean, dignified non-medical disclaimer banner */}
      <div className="border-b border-slate-800/80 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs leading-relaxed">
            <div className="flex items-center gap-2 shrink-0 text-teal-400 font-bold">
              <Icon3D name="shield" size="xs" className="w-5 h-5 shrink-0" />
              <span>{t('footer.disclaimerAlertTitle')}</span>
            </div>
            <p className="flex-1 text-slate-300/90 leading-relaxed">
              {t('footer.disclaimerText')}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Sitemap & Information (12-column balanced grid) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Column A: Brand & Mission (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-4">
            <Link
              to="/"
              className="inline-flex items-center gap-3 group focus-visible:outline-2 focus-visible:outline-teal-500 rounded-lg p-0.5"
            >
              <div className="w-9 h-9 flex items-center justify-center shrink-0">
                <Icon3D name="brain" size="md" className="w-9 h-9 object-contain drop-shadow-sm" />
              </div>
              <div className="flex flex-col text-start">
                <span className="text-xl font-black text-white tracking-tight group-hover:text-teal-300 transition-colors">
                  {t('common.brandName')}
                </span>
                <span className="text-[11px] text-slate-400 font-medium -mt-0.5">
                  {t('common.brandSubtitle')}
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              {t('footer.brandDescription')}
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-teal-300/90">
              <Icon3D name="shield" size="xs" className="w-4 h-4 shrink-0" />
              <span>{t('footer.privacyGuarantee')}</span>
            </div>
          </div>

          {/* Column B: Navigation Links (2 cols on lg) */}
          <nav className="lg:col-span-2 space-y-3" aria-label={t('footer.quickLinks')}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li>
                <Link to="/" className="hover:text-teal-300 transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/assessment" className="hover:text-teal-300 transition-colors">
                  {t('nav.assessment')}
                </Link>
              </li>
              <li>
                <Link to="/radar" className="hover:text-teal-300 transition-colors">
                  {t('nav.radar')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-teal-300 transition-colors">
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link to="/awareness" className="hover:text-teal-300 transition-colors">
                  {t('nav.awareness')}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-teal-300 transition-colors">
                  {t('nav.privacy')}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Column C: Scientific & Academic (3 cols on lg) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              {t('footer.systemAndScience')}
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li>
                <Link to="/about" className="hover:text-teal-300 transition-colors">
                  {t('footer.academicDoc')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-teal-300 transition-colors">
                  {t('footer.nlpPipeline')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-teal-300 transition-colors">
                  {t('footer.teamAndSupervision')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-teal-300 transition-colors">
                  {t('footer.ethicalCharter')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-teal-300 transition-colors">
                  {t('footer.academicReferences')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column D: Support & Hotlines (3 cols on lg) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              {t('footer.urgentSupport')}
            </h3>
            <div className="space-y-3 text-xs sm:text-sm text-slate-400">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <Icon3D name="lifebuoy" size="md" className="w-9 h-9 shrink-0 drop-shadow-sm" />
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-teal-400 block">
                    {t('footer.emergencyHotline')}
                  </span>
                  <span className="text-sm font-black text-white tracking-wide block">
                    {t('footer.emergencyHotlineNum')}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t('footer.supportAdvice')}
              </p>
              <div>
                <Link
                  to="/support"
                  className="text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors inline-block"
                >
                  {t('footer.viewSupportGuide')}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="text-center sm:text-start leading-relaxed">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
