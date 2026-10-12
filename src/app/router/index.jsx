import { lazy, Suspense } from 'react';
import { createBrowserRouter, Link } from 'react-router-dom';
import { AppShell } from '@/app/layouts/AppShell';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/Button';

// Route-level lazy loading for optimal bundle size and performance
const HomePage = lazy(() =>
  import('@/features/home/HomePage').then((m) => ({ default: m.HomePage }))
);
const AssessmentPage = lazy(() =>
  import('@/features/assessment/AssessmentPage').then((m) => ({
    default: m.AssessmentPage,
  }))
);
const AboutPage = lazy(() =>
  import('@/features/about/AboutPage').then((m) => ({ default: m.AboutPage }))
);
const AwarenessPage = lazy(() =>
  import('@/features/awareness/AwarenessPage').then((m) => ({
    default: m.AwarenessPage,
  }))
);
const SupportPage = lazy(() =>
  import('@/features/support/SupportPage').then((m) => ({
    default: m.SupportPage,
  }))
);
const PrivacyPage = lazy(() =>
  import('@/features/privacy/PrivacyPage').then((m) => ({
    default: m.PrivacyPage,
  }))
);
const RumorRadarPage = lazy(() =>
  import('@/features/rumor-radar/pages/RumorRadarPage').then((m) => ({
    default: m.RumorRadarPage,
  }))
);

import { useTranslation } from '@/context/LanguageContext';

/**
 * Route loading fallback wrapper.
 */
function PageLoader() {
  const { t } = useTranslation();
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-8">
      <LoadingState title={t('common.loadingPage')} message={t('common.waitMoment')} />
    </div>
  );
}

/**
 * 404 Not Found Page
 */
function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className="py-24 text-center px-4 max-w-md mx-auto space-y-6">
      <span className="text-6xl font-black text-teal-800">{t('notFound.code')}</span>
      <h1 className="text-2xl font-bold text-text-primary">{t('notFound.title')}</h1>
      <p className="text-sm text-text-secondary leading-relaxed">
        {t('notFound.message')}
      </p>
      <Link to="/">
        <Button variant="primary" size="md">
          {t('notFound.backHome')}
        </Button>
      </Link>
    </div>
  );
}

const routeChildren = [
  {
    index: true,
    element: (
      <Suspense fallback={<PageLoader />}>
        <HomePage />
      </Suspense>
    ),
  },
  {
    path: 'assessment',
    element: (
      <Suspense fallback={<PageLoader />}>
        <AssessmentPage />
      </Suspense>
    ),
  },
  {
    path: 'about',
    element: (
      <Suspense fallback={<PageLoader />}>
        <AboutPage />
      </Suspense>
    ),
  },
  {
    path: 'awareness',
    element: (
      <Suspense fallback={<PageLoader />}>
        <AwarenessPage />
      </Suspense>
    ),
  },
  {
    path: 'support',
    element: (
      <Suspense fallback={<PageLoader />}>
        <SupportPage />
      </Suspense>
    ),
  },
  {
    path: 'privacy',
    element: (
      <Suspense fallback={<PageLoader />}>
        <PrivacyPage />
      </Suspense>
    ),
  },
  {
    path: 'radar',
    element: (
      <Suspense fallback={<PageLoader />}>
        <RumorRadarPage />
      </Suspense>
    ),
  },
  { path: '*', element: <NotFoundPage /> },
];

/**
 * Application routing table supporting /ar, /en, and root navigation.
 */
export const router = createBrowserRouter([
  {
    path: '/ar',
    element: <AppShell />,
    children: routeChildren,
  },
  {
    path: '/en',
    element: <AppShell />,
    children: routeChildren,
  },
  {
    path: '/',
    element: <AppShell />,
    children: routeChildren,
  },
]);
