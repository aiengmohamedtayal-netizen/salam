import { useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { Brain, Menu, ArrowLeft, Languages } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { MobileMenu } from './MobileMenu';
import { useTranslation } from '@/context/LanguageContext';

export const navItems = [
  { path: '/', labelKey: 'nav.home' },
  { path: '/assessment', labelKey: 'nav.assessment' },
  { path: '/radar', labelKey: 'nav.radar' },
  { path: '/about', labelKey: 'nav.about' },
  { path: '/awareness', labelKey: 'nav.awareness' },
  { path: '/support', labelKey: 'nav.support' },
  { path: '/privacy', labelKey: 'nav.privacy' },
];

/**
 * Top Navbar component with sticky glassmorphism header, brand identity,
 * visible active language switcher (العربية | English), and route preservation.
 */
export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language, isAr, isEn, setLanguage } = useTranslation();

  const getLocalizedPath = (basePath) => {
    const prefix = language === 'en' ? '/en' : '/ar';
    if (basePath === '/') return prefix;
    return `${prefix}${basePath}`;
  };

  const handleSelectLanguage = (targetLang) => {
    if (typeof setLanguage === 'function') {
      setLanguage(targetLang);
    }

    const currentPath = location?.pathname || window.location.pathname || '/';
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
    <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-surface-card/85 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Brand Logo & Title */}
          <Link
            to={getLocalizedPath('/')}
            className="flex items-center gap-3 group focus-visible:outline-2 focus-visible:outline-teal-600 rounded-lg p-1"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm shadow-teal-700/20 group-hover:bg-teal-700 transition-colors shrink-0">
              <Brain className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="flex flex-col text-start">
              <span className="text-xl font-extrabold tracking-tight text-text-primary group-hover:text-teal-700 transition-colors">
                {t('common.brandName')}
              </span>
              <span className="text-[10px] text-text-muted font-medium -mt-1 leading-tight">
                {t('common.brandSubtitle')}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            className="hidden md:flex items-center gap-1 lg:gap-2"
            aria-label={t('nav.home')}
          >
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={getLocalizedPath(item.path)}
                className={({ isActive }) =>
                  cn(
                    'px-3 py-2 text-sm font-semibold rounded-lg transition-colors select-none',
                    isActive
                      ? 'bg-teal-50 text-teal-800 font-bold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted'
                  )
                }
              >
                {t(item.labelKey)}
              </NavLink>
            ))}
          </nav>

          {/* Actions: Segmented Language Switcher, Start Assessment CTA, Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
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

            <Link to={getLocalizedPath('/assessment')} className="hidden sm:inline-flex">
              <Button variant="primary" size="sm" className="shadow-xs gap-1.5">
                <span>{t('nav.startAssessment')}</span>
                <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" aria-hidden="true" />
              </Button>
            </Link>

            {/* Mobile menu trigger button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-teal-600 cursor-pointer"
              aria-label={t('nav.openMenu')}
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        items={navItems}
        currentPath={location.pathname}
        onSelectLanguage={handleSelectLanguage}
      />
    </header>
  );
}
