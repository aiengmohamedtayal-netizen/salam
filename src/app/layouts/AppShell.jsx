import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/navigation/Footer';
import { useTranslation } from '@/context/LanguageContext';

/**
 * Root Application Shell layout with Navbar, accessible skip link, route change scroll management, and Footer.
 */
export function AppShell() {
  const { pathname } = useLocation();
  const { t, language, setLanguage } = useTranslation();

  // Synchronize language state with route prefix
  useEffect(() => {
    if (pathname.startsWith('/en') && language !== 'en') {
      if (typeof setLanguage === 'function') setLanguage('en');
    } else if (pathname.startsWith('/ar') && language !== 'ar') {
      if (typeof setLanguage === 'function') setLanguage('ar');
    }
  }, [pathname, language, setLanguage]);

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-surface-bg text-text-primary antialiased">
      {/* Accessible skip link for keyboard/screen reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-teal-700 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none"
      >
        {t('common.skipToContent')}
      </a>

      {/* Main Top Navigation */}
      <Navbar />

      {/* Content Area */}
      <main id="main-content" className="flex-1 flex flex-col focus:outline-none" tabIndex={-1}>
        <Outlet />
      </main>

      {/* Main Footer */}
      <Footer />
    </div>
  );
}
