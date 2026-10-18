import { useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Icon3D } from '@/components/ui/Icon3D';
import { cn } from '@/lib/utils';
import { backdropFade, safeMotion } from '@/lib/motion';
import { useTranslation } from '@/context/LanguageContext';

/**
 * Mobile Navigation Drawer component with direction-aware sliding animation and localization.
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {Array<{ path: string, labelKey: string }>} props.items
 * @param {string} props.currentPath
 */
export function MobileMenu({ open, onClose, items, currentPath, onSelectLanguage }) {
  const { t, language, isAr, isEn, direction } = useTranslation();

  const getLocalizedPath = (basePath) => {
    const prefix = language === 'en' ? '/en' : '/ar';
    if (basePath === '/') return prefix;
    return `${prefix}${basePath}`;
  };

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [open, onClose]);

  const slideDrawer = {
    initial: { x: direction === 'rtl' ? '100%' : '-100%' },
    animate: { x: 0 },
    exit: { x: direction === 'rtl' ? '100%' : '-100%' },
    transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 md:hidden flex justify-start"
          role="dialog"
          aria-modal="true"
          aria-label={t('nav.openMenu')}
        >
          {/* Backdrop */}
          <motion.div
            {...safeMotion(backdropFade)}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Drawer content */}
          <motion.div
            {...safeMotion(slideDrawer)}
            className="relative z-10 w-4/5 max-w-sm h-full bg-surface-card border-e border-surface-border p-6 shadow-2xl flex flex-col justify-between overflow-y-auto"
          >
            {/* Drawer Top Header */}
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-surface-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 flex items-center justify-center shrink-0">
                    <Icon3D name="brain" size="md" className="w-9 h-9 object-contain drop-shadow-sm" />
                  </div>
                  <div>
                    <span className="text-lg font-black text-text-primary">{t('common.brandName')}</span>
                    <span className="block text-[10px] text-text-muted">{t('common.brandSubtitle')}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors focus-visible:outline-2 focus-visible:outline-teal-600 cursor-pointer"
                  aria-label={t('nav.closeMenu')}
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              {/* Segmented Visible Active Language Switcher in Mobile Drawer */}
              <div className="pt-4 pb-2">
                <div className="flex items-center justify-between p-1.5 rounded-xl border border-surface-border bg-slate-50">
                  <div className="flex items-center gap-2 text-xs font-bold text-text-primary px-2">
                    <Icon3D name="language" size="xs" className="w-5 h-5 shrink-0" />
                    <span>{t('common.language')}</span>
                  </div>
                  <div className="inline-flex items-center p-0.5 rounded-lg bg-surface-card border border-surface-border text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectLanguage) onSelectLanguage('ar');
                      }}
                      className={cn(
                        'px-2.5 py-1 rounded-md transition-all cursor-pointer select-none',
                        isAr
                          ? 'bg-teal-700 text-white shadow-xs font-black'
                          : 'text-text-secondary hover:text-text-primary'
                      )}
                    >
                      العربية
                    </button>
                    <span className="text-surface-border px-0.5 select-none" aria-hidden="true">
                      |
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectLanguage) onSelectLanguage('en');
                      }}
                      className={cn(
                        'px-2.5 py-1 rounded-md transition-all cursor-pointer select-none',
                        isEn
                          ? 'bg-teal-700 text-white shadow-xs font-black'
                          : 'text-text-secondary hover:text-text-primary'
                      )}
                    >
                      English
                    </button>
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col gap-1 py-4" aria-label={t('nav.home')}>
                {items.map((item) => {
                  const localizedPath = getLocalizedPath(item.path);
                  const isActive = currentPath === localizedPath || currentPath === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={localizedPath}
                      onClick={onClose}
                      className={cn(
                        'flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold transition-colors',
                        isActive
                          ? 'bg-teal-50 text-teal-800 font-bold'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted'
                      )}
                    >
                      <span>{t(item.labelKey)}</span>
                      <ArrowLeft className="h-4 w-4 opacity-50 rtl:rotate-0 ltr:rotate-180" aria-hidden="true" />
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Actions & Safety Reminder */}
            <div className="pt-6 border-t border-surface-border space-y-4">
              <Link to={getLocalizedPath('/assessment')} onClick={onClose} className="w-full block">
                <Button variant="primary" size="lg" fullWidth className="gap-2">
                  <span>{t('nav.startAssessment')}</span>
                  <ArrowLeft className="h-5 w-5 rtl:rotate-0 ltr:rotate-180" aria-hidden="true" />
                </Button>
              </Link>

              <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-100 flex items-start gap-2.5 text-xs text-teal-900 leading-relaxed">
                <Icon3D name="shield" size="xs" className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{t('common.disclaimerShort')}</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
