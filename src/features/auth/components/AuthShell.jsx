import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { fadeUp, safeMotion } from '@/lib/motion';
import { cn } from '@/lib/utils';

/**
 * Shared AuthShell layout for SALAM Login and Create Account pages.
 * Provides a focused, calm, trustworthy environment with top navigation bar
 * (Back to Home, language toggle) and subtle ambient background depth.
 * @param {object} props
 * @param {React.ReactNode} props.children
 */
export function AuthShell({ children }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t, language, isAr, isEn, setLanguage } = useTranslation();

  // Synchronize language state with route prefix
  useEffect(() => {
    if (pathname.startsWith('/en') && language !== 'en') {
      if (typeof setLanguage === 'function') setLanguage('en');
    } else if (pathname.startsWith('/ar') && language !== 'ar') {
      if (typeof setLanguage === 'function') setLanguage('ar');
    }
  }, [pathname, language, setLanguage]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  const homePath = language === 'en' ? '/en' : '/ar';

  const handleSelectLanguage = (targetLang) => {
    if (typeof setLanguage === 'function') {
      setLanguage(targetLang);
    }

    const currentPath = pathname || '/';
    let targetPath = currentPath;

    if (currentPath.startsWith('/ar')) {
      targetPath = currentPath.replace(/^\/ar/, targetLang === 'en' ? '/en' : '/ar');
    } else if (currentPath.startsWith('/en')) {
      targetPath = currentPath.replace(/^\/en/, targetLang === 'ar' ? '/ar' : '/en');
    } else {
      const cleanPath = currentPath === '/' ? '' : currentPath;
      targetPath = targetLang === 'en' ? `/en${cleanPath}` : `/ar${cleanPath}`;
    }

    if (!targetPath) targetPath = targetLang === 'en' ? '/en' : '/ar';
    navigate(targetPath);
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-bg text-text-primary antialiased relative selection:bg-teal-100 selection:text-teal-900 overflow-x-hidden">
      {/* Accessible skip link */}
      <a
        href="#auth-form-card"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-teal-700 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none"
      >
        {t('common.skipToContent')}
      </a>

      {/* Controlled subtle ambient background depth */}
      <div
        className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-teal-500/5 via-teal-500/[0.02] to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Focused Navigation Bar */}
      <header className="relative z-10 w-full border-b border-surface-border/60 bg-surface-card/75 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Back to Home Link */}
          <Link
            to={homePath}
            className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-2 focus-visible:outline-primary-500 rounded-lg py-1 px-2 -ms-2"
          >
            {isAr ? (
              <ArrowRight className="w-4 h-4 rtl:rotate-0" aria-hidden="true" />
            ) : (
              <ArrowLeft className="w-4 h-4 ltr:rotate-0" aria-hidden="true" />
            )}
            <span>{t('auth.backToHome')}</span>
          </Link>

          {/* Segmented Visible Active Language Switcher (العربية | English) */}
          <div
            className="inline-flex items-center p-0.5 rounded-lg border border-surface-border bg-surface-muted/70 text-xs font-bold"
            role="group"
            aria-label={t('common.language')}
          >
            <button
              type="button"
              onClick={() => handleSelectLanguage('ar')}
              className={cn(
                'px-2.5 py-1 rounded-md transition-all cursor-pointer select-none',
                isAr
                  ? 'bg-teal-700 text-white shadow-xs font-black'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-card'
              )}
              aria-pressed={isAr}
            >
              العربية
            </button>
            <span className="text-surface-border px-0.5 select-none" aria-hidden="true">
              |
            </span>
            <button
              type="button"
              onClick={() => handleSelectLanguage('en')}
              className={cn(
                'px-2.5 py-1 rounded-md transition-all cursor-pointer select-none',
                isEn
                  ? 'bg-teal-700 text-white shadow-xs font-black'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-card'
              )}
              aria-pressed={isEn}
            >
              English
            </button>
          </div>
        </div>
      </header>

      {/* Main Centered Content */}
      <main
        id="auth-form-card"
        className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12 relative z-10 w-full"
      >
        <motion.div
          className="w-full max-w-md mx-auto"
          {...safeMotion(fadeUp)}
        >
          {children}
        </motion.div>
      </main>

      {/* Focused Trust & Privacy Footer */}
      <footer className="relative z-10 w-full py-6 border-t border-surface-border/60 bg-surface-card/40 backdrop-blur-xs text-center px-4">
        <div className="max-w-md mx-auto space-y-2">
          <div className="inline-flex items-center justify-center gap-1.5 text-xs text-text-muted">
            <ShieldCheck className="w-3.5 h-3.5 text-primary-600 shrink-0" aria-hidden="true" />
            <span>{t('auth.secureNotice')}</span>
          </div>
          <p className="text-[11px] text-text-muted/80">
            {t('footer.copyright')}
          </p>
        </div>
      </footer>
    </div>
  );
}
