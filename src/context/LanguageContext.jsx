import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { ar } from '@/locales/ar';
import { en } from '@/locales/en';

const dictionaries = { ar, en };

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/en')) {
        return 'en';
      }
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/ar')) {
        return 'ar';
      }
      const saved = localStorage.getItem('salam_lang');
      return saved === 'en' ? 'en' : 'ar';
    } catch {
      return 'ar';
    }
  });

  const direction = language === 'ar' ? 'rtl' : 'ltr';

  // Synchronize document direction and lang attribute whenever language changes
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
    try {
      localStorage.setItem('salam_lang', language);
    } catch {
      // localStorage may be disabled in restricted modes
    }
  }, [language, direction]);

  const setLanguage = useCallback((lang) => {
    if (lang === 'ar' || lang === 'en') {
      setLanguageState(lang);
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => (prev === 'ar' ? 'en' : 'ar'));
  }, []);

  /**
   * Helper to retrieve localized strings with dot notation and parameter interpolation.
   * Example: t('assessment.adaptive.questionCounter', { current: 1, total: 5 })
   */
  const t = useCallback(
    (keyPath, params = {}) => {
      const keys = keyPath.split('.');
      let currentVal = dictionaries[language];

      for (const k of keys) {
        if (currentVal && typeof currentVal === 'object' && k in currentVal) {
          currentVal = currentVal[k];
        } else {
          currentVal = undefined;
          break;
        }
      }

      // Fallback to Arabic if missing in target locale
      if (currentVal === undefined) {
        let fallbackVal = dictionaries.ar;
        for (const k of keys) {
          if (fallbackVal && typeof fallbackVal === 'object' && k in fallbackVal) {
            fallbackVal = fallbackVal[k];
          } else {
            fallbackVal = undefined;
            break;
          }
        }
        currentVal = fallbackVal !== undefined ? fallbackVal : keyPath;
      }

      if (typeof currentVal === 'string' && params && typeof params === 'object') {
        let interpolated = currentVal;
        Object.entries(params).forEach(([paramKey, paramVal]) => {
          interpolated = interpolated.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
        });
        return interpolated;
      }

      return currentVal;
    },
    [language]
  );

  const contextValue = useMemo(
    () => ({
      language,
      direction,
      isAr: language === 'ar',
      isEn: language === 'en',
      setLanguage,
      toggleLanguage,
      t,
    }),
    [language, direction, setLanguage, toggleLanguage, t]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function useTranslation() {
  return useLanguage();
}
