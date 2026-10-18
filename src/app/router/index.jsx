import { lazy, Suspense } from 'react';
import { createBrowserRouter, Link, useRouteError } from 'react-router-dom';
import { AppShell } from '@/app/layouts/AppShell';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
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
const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('@/features/auth/pages/RegisterPage').then((m) => ({
    default: m.RegisterPage,
  }))
);
const MultimodalAnalysisPage = lazy(() =>
  import('@/features/multimodal/pages/MultimodalAnalysisPage').then((m) => ({
    default: m.MultimodalAnalysisPage,
  }))
);
const VoiceAnalysisPage = lazy(() =>
  import('@/features/voice/pages/VoiceAnalysisPage').then((m) => ({
    default: m.VoiceAnalysisPage,
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

/**
 * Route error boundary with SALAM ErrorState feedback.
 */
function RouteErrorBoundary() {
  const error = useRouteError();
  const { language } = useTranslation();
  const isEn = language === 'en';

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <ErrorState
        title={isEn ? 'An unexpected error occurred' : 'حدث خطأ غير متوقع'}
        message={
          error?.statusText ||
          error?.message ||
          (isEn
            ? 'We encountered a momentary issue. Your inputs remain secure.'
            : 'واجهنا تعثراً مؤقتاً في عرض هذه الصفحة. يمكنك العودة للصفحة الرئيسية أو إعادة المحاولة.')
        }
        onRetry={() => window.location.reload()}
        retryLabel={isEn ? 'Reload Page' : 'إعادة تحميل الصفحة'}
        secondaryAction={
          <Link to="/">
            <Button variant="outline" size="md">
              {isEn ? 'Return Home' : 'العودة للرئيسية'}
            </Button>
          </Link>
        }
      />
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
  {
    path: 'multimodal',
    element: (
      <Suspense fallback={<PageLoader />}>
        <MultimodalAnalysisPage />
      </Suspense>
    ),
  },
  {
    path: 'voice',
    element: (
      <Suspense fallback={<PageLoader />}>
        <VoiceAnalysisPage />
      </Suspense>
    ),
  },
  { path: '*', element: <NotFoundPage /> },
];

const authRoutes = [
  {
    path: '/ar/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/ar/register',
    element: (
      <Suspense fallback={<PageLoader />}>
        <RegisterPage />
      </Suspense>
    ),
  },
  {
    path: '/en/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/en/register',
    element: (
      <Suspense fallback={<PageLoader />}>
        <RegisterPage />
      </Suspense>
    ),
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/register',
    element: (
      <Suspense fallback={<PageLoader />}>
        <RegisterPage />
      </Suspense>
    ),
  },
];

/**
 * Application routing table supporting /ar, /en, and root navigation.
 */
export const router = createBrowserRouter([
  ...authRoutes.map((route) => ({
    ...route,
    errorElement: <RouteErrorBoundary />,
  })),
  {
    path: '/ar',
    element: <AppShell />,
    errorElement: <RouteErrorBoundary />,
    children: routeChildren,
  },
  {
    path: '/en',
    element: <AppShell />,
    errorElement: <RouteErrorBoundary />,
    children: routeChildren,
  },
  {
    path: '/',
    element: <AppShell />,
    errorElement: <RouteErrorBoundary />,
    children: routeChildren,
  },
]);
