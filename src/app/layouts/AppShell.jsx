import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar, SidebarCollapse } from '@/components/navigation';
import { Footer } from '@/components/navigation/Footer';
import { useTranslation } from '@/context/LanguageContext';
import { AmalAssistant } from '@/features/assistant';
import { MindfulNotificationIsland } from '@/components/ui/MindfulNotificationIsland';

/**
 * Root Application Shell layout with Navbar, SidebarCollapse on desktop,
 * accessible skip link, route change scroll management, and Footer.
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

      {/* Main Layout Area with Seamless Desktop Sidebar */}
      <div className="flex-1 flex w-full relative">
        <aside
          aria-label={t('nav.openMenu')}
          className="hidden xl:flex shrink-0 sticky top-16 h-[calc(100vh-4rem)] items-start z-30 border-inline-end border-surface-border/70 bg-surface-card/40 backdrop-blur-md px-2.5 py-4 transition-all"
        >
          <SidebarCollapse />
        </aside>

        {/* Content Area */}
        <main id="main-content" className="flex-1 min-w-0 flex flex-col focus:outline-none" tabIndex={-1}>
          <Outlet />
        </main>
      </div>

      {/* Main Footer */}
      <Footer />

      {/* Floating AMAL Assistant (fixed, does not affect the flex column) */}
      <AmalAssistant />

      {/* Suspended Top Mindful Notification Island (Tips & Self-Development) */}
      <MindfulNotificationIsland />
    </div>
  );
}
