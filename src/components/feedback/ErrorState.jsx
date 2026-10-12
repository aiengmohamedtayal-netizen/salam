import { AlertCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

/**
 * ErrorState feedback component explaining what went wrong and how to recover.
 * @param {object} props
 * @param {string} [props.title]
 * @param {string} [props.message]
 * @param {() => void} [props.onRetry]
 * @param {string} [props.retryLabel]
 * @param {React.ReactNode} [props.secondaryAction]
 * @param {string} [props.className]
 */
export function ErrorState({
  title = 'حدث خطأ غير متوقع',
  message = 'تعذر إتمام العملية في الوقت الحالي. لم يتم فقدان مدخلاتك، يمكنك المحاولة مرة أخرى.',
  onRetry,
  retryLabel = 'إعادة المحاولة',
  secondaryAction,
  className,
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-[var(--radius-2xl)] border border-rose-200 bg-rose-50/40 max-w-lg mx-auto',
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-rose-100/80 border border-rose-200 flex items-center justify-center text-rose-700 mb-4 shadow-xs">
        <AlertCircle className="h-7 w-7" aria-hidden="true" />
      </div>

      <h3 className="text-lg font-bold text-rose-950 mb-2 leading-snug">
        {title}
      </h3>

      <p className="text-sm text-slate-700 leading-relaxed max-w-sm mb-6">
        {message}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <Button
            variant="primary"
            size="md"
            onClick={onRetry}
            className="bg-rose-700 hover:bg-rose-800"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>{retryLabel}</span>
          </Button>
        )}
        {secondaryAction}
      </div>
    </div>
  );
}
