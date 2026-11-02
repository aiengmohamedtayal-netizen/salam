import { ShieldCheck, X } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { AssistantAvatar } from './AssistantAvatar';

/**
 * Drawer header: assistant identity, live status and the close control.
 *
 * The header is the brand anchor of the widget — a deep orchid gradient with
 * soft ambient light, so the panel reads as one composed surface instead of
 * a stack of white boxes.
 */
export function AssistantHeader({ onClose }) {
  const { t } = useTranslation();

  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900">
      {/* Ambient light — depth without a second accent colour. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-14 -end-8 h-36 w-36 rounded-full bg-primary-400/20 blur-2xl"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -start-10 h-36 w-36 rounded-full bg-primary-300/15 blur-2xl"
      />

      <div className="relative flex items-center gap-3 px-4 py-3.5">
        <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-white/15 ring-1 ring-white/25">
          <AssistantAvatar className="h-14 w-14 drop-shadow-md" />
          <span
            aria-hidden="true"
            className="absolute -bottom-0.5 -end-0.5 h-3.5 w-3.5 rounded-full bg-emerald-400 ring-[3px] ring-primary-800"
          />
        </span>

        <div className="min-w-0 flex-1">
          <h2
            id="amal-assistant-title"
            className="truncate font-cairo text-[15px] font-bold leading-tight text-white"
          >
            {t('assistant.name')}
          </h2>
          <p className="truncate text-xs leading-relaxed text-primary-50">
            {t('assistant.status')}
          </p>
        </div>

        <span className="hidden items-center gap-1.5 rounded-full bg-primary-900/60 px-2.5 py-1 text-[11px] font-medium text-primary-50 ring-1 ring-white/15 sm:inline-flex">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          {t('assistant.privacyChip')}
        </span>

        <button
          type="button"
          onClick={onClose}
          aria-label={t('assistant.close')}
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)]',
            'text-primary-50 transition-colors duration-200 hover:bg-white/15 hover:text-white',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-800'
          )}
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
