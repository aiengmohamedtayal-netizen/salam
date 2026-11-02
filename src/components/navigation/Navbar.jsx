import { useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, ArrowLeft, Sun, Moon, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Icon3D } from '@/components/ui/Icon3D';
import { cn } from '@/lib/utils';
import { MobileMenu } from './MobileMenu';
import { useTranslation } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

export const navItems = [
  { path: '/', labelKey: 'nav.home' },
  { path: '/assessment', labelKey: 'nav.assessment' },
  { path: '/analysis', labelKey: 'nav.textAnalysis' },
  { path: '/multimodal', labelKey: 'nav.multimodal' },
  { path: '/voice', labelKey: 'nav.voice' },
  { path: '/radar', labelKey: 'nav.radar' },
  { path: '/about', labelKey: 'nav.about' },
  { path: '/awareness', labelKey: 'nav.awareness' },
  { path: '/support', labelKey: 'nav.support' },
  { path: '/privacy', labelKey: 'nav.privacy' },
  { path: '/settings', labelKey: 'nav.settings' },
];

/**
 * Top Navbar component with sticky glassmorphism header, brand identity,
 * visible active language switcher (العربية | English), and route preservation.
 */
export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language, isAr, isEn, setLanguage } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      setLogoutError('');
      navigate(language === 'en' ? '/en/login' : '/ar/login');
    } catch {
      setLogoutError(t('auth.errors.generalFailure'));
    }
  };

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
    <>
    <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-surface-card/85 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Brand Logo & Title */}
          <Link
            to={getLocalizedPath('/')}
            className="flex items-center gap-2.5 sm:gap-3 shrink-0 group focus-visible:outline-2 focus-visible:outline-teal-600 rounded-lg p-1"
          >
            <div className="w-10 h-10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Icon3D name="brain" size="lg" className="w-10 h-10 object-contain drop-shadow-md" />
            </div>
            <div className="flex flex-col text-start shrink-0 min-w-0">
              <span className="text-xl font-extrabold tracking-tight text-text-primary group-hover:text-teal-700 transition-colors leading-none">
                {t('common.brandName')}
              </span>
              <span className="text-[10px] text-text-muted font-medium mt-1 leading-tight whitespace-nowrap hidden 2xl:block">
                {t('common.brandSubtitle')}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            className="hidden 2xl:flex items-center gap-0"
            aria-label={t('nav.home')}
          >
            {navItems.slice(0, 6).map((item) => (
              <NavLink
                key={item.path}
                to={getLocalizedPath(item.path)}
                className={({ isActive }) =>
                  cn(
                    'px-1.5 py-1.5 text-xs font-semibold rounded-lg transition-colors select-none whitespace-nowrap shrink-0',
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
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 lg:gap-3">
            {/* Segmented Visible Active Language Switcher (العربية | English) */}
            <div className="hidden sm:flex items-center gap-1.5">
              <Icon3D name="language" size="sm" className="w-6 h-6 shrink-0 hidden sm:inline-block drop-shadow-xs" />
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

            {/* Accessible Theme Toggle (Light / Dark) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="hidden sm:inline-flex p-2 rounded-lg border border-surface-border bg-surface-muted/70 text-text-secondary hover:text-text-primary hover:bg-surface-card transition-colors focus-visible:outline-2 focus-visible:outline-teal-600 cursor-pointer select-none"
              aria-label={isDark ? t('theme.enableLight') : t('theme.enableDark')}
              title={isDark ? t('theme.switchToLight') : t('theme.switchToDark')}
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-400 transition-transform hover:rotate-45" aria-hidden="true" />
              ) : (
                <Moon className="h-4 w-4 text-slate-700 transition-transform hover:-rotate-12" aria-hidden="true" />
              )}
            </button>

            <div className="hidden 2xl:flex items-center gap-2">
              {user ? (
                <>
                  <Link
                    to={getLocalizedPath('/settings')}
                    aria-label={t('nav.settings')}
                    title={t('nav.settings')}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-surface-border text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary focus-visible:outline-2 focus-visible:outline-primary-600"
                  >
                    <Settings2 className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleLogout} className="whitespace-nowrap">
                    {t('auth.logout')}
                  </Button>
                  {logoutError && <span role="alert" className="text-xs text-rose-700">{logoutError}</span>}
                </>
              ) : (
                <>
                  <Link to={language === 'en' ? '/en/login' : '/ar/login'}>
                    <Button variant="outline" size="sm">{t('auth.loginCta')}</Button>
                  </Link>
                  <Link to={language === 'en' ? '/en/register' : '/ar/register'}>
                    <Button variant="primary" size="sm">{t('auth.registerCta')}</Button>
                  </Link>
                </>
              )}
            </div>

            <Link to={getLocalizedPath('/assessment')} className="hidden sm:inline-flex 2xl:hidden">
              <Button variant="primary" size="sm" className="shadow-xs gap-1.5 whitespace-nowrap shrink-0">
                <span>{t('nav.startAssessment')}</span>
                <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" aria-hidden="true" />
              </Button>
            </Link>

            {/* Mobile menu trigger button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-teal-600 cursor-pointer"
              aria-label={t('nav.openMenu')}
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

    </header>
    {/* Keep the fixed drawer outside the backdrop-filter header's containing block. */}
    <MobileMenu
      open={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
      items={navItems}
      currentPath={location.pathname}
      onSelectLanguage={handleSelectLanguage}
      user={user}
      onLogout={handleLogout}
    />
    </>
  );
}
