import { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';

/**
 * Shared multi-line Textarea with label, character count, and error state.
 * @param {object} props
 * @param {string} [props.label]
 * @param {string} [props.helperText]
 * @param {string} [props.error]
 * @param {number} [props.maxLength]
 * @param {boolean} [props.showCount]
 * @param {string} [props.className]
 */
export const Textarea = forwardRef(function Textarea(
  {
    label,
    helperText,
    error,
    maxLength,
    showCount,
    className,
    value,
    id: externalId,
    ...rest
  },
  ref
) {
  const generatedId = useId();
  const textareaId = externalId || generatedId;
  const helperId = `${textareaId}-helper`;
  const errorId = `${textareaId}-error`;

  const charCount = typeof value === 'string' ? value.length : 0;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label
          htmlFor={textareaId}
          className="text-sm font-semibold text-text-primary"
        >
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        value={value}
        maxLength={maxLength}
        className={cn(
          'w-full min-h-[120px] rounded-[var(--radius-lg)] border bg-surface-card p-4',
          'text-text-primary placeholder:text-text-muted leading-relaxed resize-y',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
          error
            ? 'border-error focus:ring-error'
            : 'border-surface-border hover:border-surface-border-strong'
        )}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={
          error ? errorId : helperText ? helperId : undefined
        }
        {...rest}
      />

      <div className="flex items-center justify-between gap-2">
        <div className="flex-1">
          {error && (
            <p id={errorId} className="text-sm text-error" role="alert">
              {error}
            </p>
          )}
          {!error && helperText && (
            <p id={helperId} className="text-sm text-text-muted">
              {helperText}
            </p>
          )}
        </div>

        {showCount && maxLength && (
          <span
            className={cn(
              'text-xs tabular-nums',
              charCount > maxLength * 0.9 ? 'text-error' : 'text-text-muted'
            )}
            aria-live="polite"
          >
            {charCount}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
});
