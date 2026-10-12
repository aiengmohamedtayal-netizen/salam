import { useId } from 'react';
import { cn } from '@/lib/utils';

/**
 * Standardized FormField wrapper for inputs, textareas, and custom form controls.
 * @param {object} props
 * @param {string} [props.label]
 * @param {boolean} [props.required]
 * @param {string} [props.optionalText]
 * @param {string} [props.helperText]
 * @param {string} [props.error]
 * @param {string} [props.id]
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 */
export function FormField({
  label,
  required = false,
  optionalText,
  helperText,
  error,
  id: externalId,
  children,
  className,
}) {
  const generatedId = useId();
  const fieldId = externalId || generatedId;
  const helperId = `${fieldId}-helper`;
  const errorId = `${fieldId}-error`;

  return (
    <div className={cn('space-y-1.5 text-start', className)}>
      {label && (
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor={fieldId}
            className="text-sm font-bold text-text-primary flex items-center gap-1.5"
          >
            <span>{label}</span>
            {required && (
              <span className="text-rose-600 font-bold" title="حقل إجباري" aria-hidden="true">
                *
              </span>
            )}
          </label>
          {!required && optionalText && (
            <span className="text-xs text-text-muted font-normal">
              {optionalText}
            </span>
          )}
        </div>
      )}

      <div>{children}</div>

      {error ? (
        <p id={errorId} className="text-xs text-rose-600 font-medium" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-xs text-text-secondary">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
