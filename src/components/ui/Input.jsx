import { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';

/**
 * Shared text input with label, helper text, and error state.
 * @param {object} props
 * @param {string} [props.label]
 * @param {string} [props.helperText]
 * @param {string} [props.error]
 * @param {React.ReactNode} [props.icon] - Icon element placed at logical start
 * @param {string} [props.className]
 */
export const Input = forwardRef(function Input(
  { label, helperText, error, icon, endAdornment, className, inputClassName, id: externalId, ...rest },
  ref
) {
  const generatedId = useId();
  const inputId = externalId || generatedId;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-text-primary"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {icon && (
          <span className="absolute top-1/2 -translate-y-1/2 start-3 text-text-muted pointer-events-none flex items-center justify-center">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full h-10 rounded-[var(--radius-md)] border bg-surface-card px-3',
            'text-text-primary placeholder:text-text-muted',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            error
              ? 'border-error focus:ring-error'
              : 'border-surface-border hover:border-surface-border-strong',
            icon && 'ps-10',
            endAdornment && 'pe-10',
            inputClassName
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          {...rest}
        />
        {endAdornment && (
          <div className="absolute top-1/2 -translate-y-1/2 end-3 flex items-center">
            {endAdornment}
          </div>
        )}
      </div>

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
  );
});
