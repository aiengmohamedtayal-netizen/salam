import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * LoadingState feedback component with calm, accessible loading feedback.
 * @param {object} props
 * @param {string} [props.title]
 * @param {string} [props.message]
 * @param {'spinner'|'pulse'|'dots'} [props.variant]
 * @param {string} [props.className]
 */
export function LoadingState({
  title = 'جاري التحميل...',
  message,
  variant = 'spinner',
  className,
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 max-w-md mx-auto',
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-4">
        {variant === 'spinner' ? (
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
        ) : (
          <span className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-bounce" />
          </span>
        )}
      </div>

      <h4 className="text-base font-bold text-text-primary mb-1">
        {title}
      </h4>

      {message && (
        <p className="text-sm text-text-secondary leading-relaxed">
          {message}
        </p>
      )}

      <span className="sr-only">جاري تحميل المحتوى، يرجى الانتظار</span>
    </div>
  );
}
