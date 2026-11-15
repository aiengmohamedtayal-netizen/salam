import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Check, Download, Globe2, KeyRound, Languages, LockKeyhole,
  LogOut, Moon, Palette, ShieldCheck, Sun, Trash2, UserRound,
} from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { PasswordField } from '@/features/auth/components/PasswordField';
import { PasswordStrength } from '@/components/ui/PasswordStrength';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

function getCsrfToken() {
  return document.cookie.split('; ').find((cookie) => cookie.startsWith('amal_csrf='))?.split('=').slice(1).join('=') || '';
}

async function parseResponse(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body?.detail?.code || 'API_ERROR');
    error.code = body?.detail?.code || 'API_ERROR';
    throw error;
  }
  return body;
}

function SectionHeading({ icon: Icon, title, description }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-200">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <h2 className="text-lg font-bold text-text-primary">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-text-secondary">{description}</p>
      </div>
    </div>
  );
}

const THEME_PALETTES = [
  {
    id: 'default',
    nameKey: 'settings.paletteDefault',
    descKey: 'settings.paletteDefaultDesc',
    primary: '#a169cf',
    hover: '#8953b7',
    tint: 'rgba(161, 105, 207, 0.16)',
  },
  {
    id: 'whatsapp',
    nameKey: 'settings.paletteWhatsapp',
    descKey: 'settings.paletteWhatsappDesc',
    primary: '#25d366',
    hover: '#075e54',
    tint: 'rgba(37, 211, 102, 0.16)',
  },
  {
    id: 'facebook',
    nameKey: 'settings.paletteFacebook',
    descKey: 'settings.paletteFacebookDesc',
    primary: '#1877f2',
    hover: '#166fe5',
    tint: 'rgba(24, 119, 242, 0.16)',
  },
];

export function SettingsPage() {
  const { t, language, setLanguage } = useTranslation();
  const { theme, setTheme, colorPalette = 'default', setColorPalette } = useTheme();
  const { user, updateProfile, changePassword, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState(user?.name || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileNotice, setProfileNotice] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [securityNotice, setSecurityNotice] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(false);
  const [historyBusy, setHistoryBusy] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [historyNotice, setHistoryNotice] = useState(null);
  const [logoutBusy, setLogoutBusy] = useState(false);
  const [logoutError, setLogoutError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE}/api/v1/assessments`, {
      credentials: 'include',
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(parseResponse)
      .then((body) => setAssessments(Array.isArray(body.assessments) ? body.assessments : []))
      .catch(() => {
        if (!controller.signal.aborted) setHistoryError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setHistoryLoading(false);
      });
    return () => controller.abort();
  }, []);

  const handleLanguageChange = (nextLanguage) => {
    setLanguage(nextLanguage);
    const localizedPath = location.pathname.replace(/^\/(ar|en)(?=\/|$)/, `/${nextLanguage}`);
    navigate(`${localizedPath}${location.search}`, { replace: true });
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    setProfileNotice(null);
    setProfileSaving(true);
    try {
      await updateProfile(name.trim());
      setProfileNotice({ type: 'success', message: t('settings.profileSaved') });
    } catch {
      setProfileNotice({ type: 'error', message: t('settings.actionFailed') });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSave = async (event) => {
    event.preventDefault();
    setSecurityNotice(null);
    if (newPassword.length < 8) {
      setSecurityNotice({ type: 'error', message: t('settings.passwordTooShort') });
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityNotice({ type: 'error', message: t('settings.passwordMismatch') });
      return;
    }
    setPasswordSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSecurityNotice({ type: 'success', message: t('settings.passwordSaved') });
    } catch (error) {
      const message = error.code === 'CURRENT_PASSWORD_INVALID'
        ? t('settings.currentPasswordInvalid')
        : error.code === 'PASSWORD_NOT_AVAILABLE'
          ? t('settings.googlePasswordUnavailable')
          : t('settings.actionFailed');
      setSecurityNotice({ type: 'error', message });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleExport = () => {
    const exportData = {
      exported_at: new Date().toISOString(),
      account: { name: user?.name, email: user?.email },
      assessments,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'amal-account-data.json';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleClearHistory = async () => {
    setHistoryBusy(true);
    setHistoryNotice(null);
    try {
      const response = await fetch(`${API_BASE}/api/v1/assessments`, {
        method: 'DELETE',
        credentials: 'include',
        cache: 'no-store',
        headers: { 'X-CSRF-Token': getCsrfToken() },
      });
      await parseResponse(response);
      setAssessments([]);
      setHistoryError(false);
      setClearDialogOpen(false);
      setHistoryNotice({ type: 'success', message: t('settings.historyCleared') });
    } catch {
      setHistoryNotice({ type: 'error', message: t('settings.actionFailed') });
    } finally {
      setHistoryBusy(false);
    }
  };

  const handleLogout = async () => {
    setLogoutError(false);
    setLogoutBusy(true);
    try {
      await logout();
      navigate(language === 'en' ? '/en/login' : '/ar/login', { replace: true });
    } catch {
      setLogoutError(true);
      setLogoutBusy(false);
    }
  };

  const sectionLinks = [
    ['#profile', <UserRound key="profile" className="h-4 w-4" aria-hidden="true" />, t('settings.profile')],
    ['#preferences', <Palette key="preferences" className="h-4 w-4" aria-hidden="true" />, t('settings.preferences')],
    ['#security', <LockKeyhole key="security" className="h-4 w-4" aria-hidden="true" />, t('settings.security')],
    ['#privacy', <ShieldCheck key="privacy" className="h-4 w-4" aria-hidden="true" />, t('settings.privacyData')],
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link to={language === 'en' ? '/en/assessment' : '/ar/assessment'} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-primary-700">
            <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" aria-hidden="true" />
            {t('settings.backToApp')}
          </Link>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary-700">{t('settings.eyebrow')}</p>
          <h1 className="text-3xl font-black tracking-tight text-text-primary sm:text-4xl">{t('settings.title')}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-base">{t('settings.subtitle')}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {logoutError && <span role="alert" className="text-xs text-error">{t('settings.actionFailed')}</span>}
          <Button variant="outline" onClick={handleLogout} loading={logoutBusy} className="gap-2">
            <LogOut className="h-4 w-4" aria-hidden="true" />
            {t('auth.logout')}
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)] lg:items-start">
        <nav aria-label={t('settings.sections')} className="flex gap-2 overflow-x-auto rounded-2xl border border-surface-border bg-surface-card p-2 lg:sticky lg:top-24 lg:flex-col lg:overflow-visible">
          {sectionLinks.map(([href, icon, label]) => (
            <a key={href} href={href} className="inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary">
              {icon}<span>{label}</span>
            </a>
          ))}
        </nav>

        <div className="space-y-6">
          <Card id="profile" padding="lg" className="scroll-mt-24 border border-surface-border bg-surface-card">
            <SectionHeading icon={UserRound} title={t('settings.profile')} description={t('settings.profileDescription')} />
            {profileNotice && <Alert className="mb-4" variant={profileNotice.type}>{profileNotice.message}</Alert>}
            <form onSubmit={handleProfileSave} className="grid gap-4 sm:grid-cols-2">
              <Input id="settings-name" label={t('auth.nameLabel')} value={name} onChange={(event) => setName(event.target.value)} required maxLength={100} />
              <Input id="settings-email" type="email" label={t('auth.emailLabel')} value={user?.email || ''} readOnly disabled helperText={t('settings.emailFixed')} />
              <div className="sm:col-span-2">
                <Button type="submit" loading={profileSaving} disabled={!name.trim() || name.trim() === user?.name}>{t('settings.saveProfile')}</Button>
              </div>
            </form>
          </Card>

          <Card id="preferences" padding="lg" className="scroll-mt-24 border border-surface-border bg-surface-card">
            <SectionHeading icon={Palette} title={t('settings.preferences')} description={t('settings.preferencesDescription')} />
            <div className="divide-y divide-surface-border">
              <div className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? <Moon className="h-5 w-5 text-primary-600" aria-hidden="true" /> : <Sun className="h-5 w-5 text-primary-600" aria-hidden="true" />}
                  <div><p className="font-semibold text-text-primary">{t('theme.theme')}</p><p className="mt-1 text-xs text-text-muted">{t('settings.savedOnDevice')}</p></div>
                </div>
                <div className="inline-flex rounded-xl border border-surface-border bg-surface-muted p-1" role="group" aria-label={t('theme.theme')}>
                  {['light', 'dark'].map((mode) => (
                    <button key={mode} type="button" aria-pressed={theme === mode} onClick={() => setTheme(mode)} className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${theme === mode ? 'bg-primary-700 text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>
                      {t(`theme.${mode}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme & Color Palette Switcher */}
              <div className="py-5">
                <div className="mb-4">
                  <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                    <Palette className="h-4 w-4 text-primary-600" aria-hidden="true" />
                    {t('settings.colorPalette')}
                  </h3>
                  <p className="mt-1 text-xs text-text-muted leading-relaxed">
                    {t('settings.colorPaletteDescription')}
                  </p>
                </div>

                <div className="grid gap-3.5 sm:grid-cols-3" role="radiogroup" aria-label={t('settings.colorPalette')}>
                  {THEME_PALETTES.map((palette) => {
                    const isSelected = colorPalette === palette.id;
                    return (
                      <button
                        key={palette.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setColorPalette?.(palette.id)}
                        className={cn(
                          'group relative flex flex-col justify-between rounded-2xl border p-4 text-start transition-all duration-200 outline-hidden cursor-pointer focus-visible:ring-2 focus-visible:ring-primary-500',
                          isSelected
                            ? 'border-primary-500 bg-primary-50/50 shadow-sm ring-2 ring-primary-500/20 dark:bg-primary-950/20'
                            : 'border-surface-border bg-surface-elevated hover:border-surface-border-strong hover:bg-surface-muted/40'
                        )}
                      >
                        {/* Header: Name and Checkmark Badge */}
                        <div className="flex items-start justify-between gap-2 mb-2.5">
                          <span className="font-bold text-sm text-text-primary">
                            {t(palette.nameKey)}
                          </span>
                          <span
                            className={cn(
                              'flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all',
                              isSelected
                                ? 'bg-primary-600 text-white shadow-xs'
                                : 'border border-surface-border bg-surface-muted opacity-30 group-hover:opacity-75'
                            )}
                            aria-hidden="true"
                          >
                            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-text-secondary leading-relaxed mb-4">
                          {t(palette.descKey)}
                        </p>

                        {/* Visual Color Swatches (Apple HIG Color Wells) */}
                        <div className="flex items-center justify-between pt-2.5 border-t border-surface-border/60">
                          <span className="text-[11px] font-semibold text-text-muted">
                            {isSelected ? '✓ نشط' : 'معاينة'}
                          </span>
                          <div className="flex items-center gap-1.5" aria-hidden="true">
                            <span
                              className="h-4.5 w-4.5 rounded-full shadow-xs ring-1 ring-black/10 transition-transform group-hover:scale-110"
                              style={{ backgroundColor: palette.primary }}
                              title="Primary"
                            />
                            <span
                              className="h-4.5 w-4.5 rounded-full shadow-xs ring-1 ring-black/10 transition-transform group-hover:scale-110"
                              style={{ backgroundColor: palette.hover }}
                              title="Hover / Accent"
                            />
                            <span
                              className="h-4.5 w-4.5 rounded-full shadow-xs ring-1 ring-black/10 border border-black/5 transition-transform group-hover:scale-110"
                              style={{ backgroundColor: palette.tint }}
                              title="Soft Tint"
                            />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 py-4 last:pb-0">
                <div className="flex items-center gap-3">
                  <Languages className="h-5 w-5 text-primary-600" aria-hidden="true" />
                  <div><p className="font-semibold text-text-primary">{t('common.language')}</p><p className="mt-1 text-xs text-text-muted">{t('settings.savedOnDevice')}</p></div>
                </div>
                <div className="inline-flex rounded-xl border border-surface-border bg-surface-muted p-1" role="group" aria-label={t('common.language')}>
                  {['ar', 'en'].map((lang) => (
                    <button key={lang} type="button" aria-pressed={language === lang} onClick={() => handleLanguageChange(lang)} className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${language === lang ? 'bg-primary-700 text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>
                      {lang === 'ar' ? t('common.arabic') : t('common.english')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card id="security" padding="lg" className="scroll-mt-24 border border-surface-border bg-surface-card">
            <SectionHeading icon={KeyRound} title={t('settings.security')} description={t('settings.securityDescription')} />
            {user?.google_linked && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
                <Check className="h-4 w-4 shrink-0" aria-hidden="true" />{t('settings.googleConnected')}
              </div>
            )}
            {securityNotice && <Alert className="mb-4" variant={securityNotice.type}>{securityNotice.message}</Alert>}
            {user?.password_enabled ? (
              <form onSubmit={handlePasswordSave} className="space-y-4 max-w-xl">
                <PasswordField
                  id="settings-current-password"
                  label={t('settings.currentPassword')}
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  required
                />
                <div className="space-y-1">
                  <PasswordStrength
                    id="settings-new-password"
                    label={t('settings.newPassword')}
                    value={newPassword}
                    onChange={(val) => setNewPassword(val)}
                    placeholder={t('auth.passwordPlaceholder')}
                    autoComplete="new-password"
                    required
                  />
                </div>
                <PasswordField
                  id="settings-confirm-password"
                  label={t('settings.confirmPassword')}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
                <div className="pt-2">
                  <Button
                    type="submit"
                    loading={passwordSaving}
                    disabled={!currentPassword || !newPassword || !confirmPassword}
                  >
                    {t('settings.updatePassword')}
                  </Button>
                </div>
              </form>
            ) : (
              <p className="rounded-xl bg-surface-muted p-4 text-sm leading-relaxed text-text-secondary">{t('settings.googlePasswordUnavailable')}</p>
            )}
          </Card>

          <Card id="privacy" padding="lg" className="scroll-mt-24 border border-surface-border bg-surface-card">
            <SectionHeading icon={ShieldCheck} title={t('settings.privacyData')} description={t('settings.privacyDescription')} />
            {historyNotice && <Alert className="mb-4" variant={historyNotice.type}>{historyNotice.message}</Alert>}
            <div className="flex flex-col gap-4 rounded-2xl border border-surface-border bg-surface-muted/60 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-text-primary">{t('settings.assessmentHistory')}</p>
                <p className="mt-1 text-sm text-text-secondary">
                  {historyLoading ? t('common.loading') : historyError ? t('settings.historyUnavailable') : t('settings.historyCount', { count: assessments.length })}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={handleExport} disabled={historyLoading || historyError} className="gap-2">
                  <Download className="h-4 w-4" aria-hidden="true" />{t('settings.exportData')}
                </Button>
                <Button variant="danger" onClick={() => setClearDialogOpen(true)} disabled={historyLoading || historyError || assessments.length === 0} className="gap-2">
                  <Trash2 className="h-4 w-4" aria-hidden="true" />{t('settings.clearHistory')}
                </Button>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <Link to={language === 'en' ? '/en/privacy' : '/ar/privacy'} className="font-semibold text-primary-700 hover:underline">{t('settings.privacyPolicy')}</Link>
              <Link to={language === 'en' ? '/en/support' : '/ar/support'} className="inline-flex items-center gap-2 font-semibold text-primary-700 hover:underline"><Globe2 className="h-4 w-4" aria-hidden="true" />{t('settings.support')}</Link>
            </div>
          </Card>
        </div>
      </div>

      <Dialog
        open={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
        title={t('settings.clearHistoryTitle')}
        description={t('settings.clearHistoryDescription')}
        closeLabel={t('common.close')}
      >
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setClearDialogOpen(false)} disabled={historyBusy}>{t('common.cancel')}</Button>
          <Button variant="danger" onClick={handleClearHistory} loading={historyBusy}>{t('settings.clearHistory')}</Button>
        </div>
      </Dialog>
    </div>
  );
}
