import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { backdropFade, scaleIn, safeMotion } from '@/lib/motion';

/**
 * Accessible Dialog / Modal component using Framer Motion.
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {string} [props.title]
 * @param {string} [props.description]
 * @param {'sm'|'md'|'lg'|'xl'} [props.size]
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
  className,
}) {
  const dialogRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [open]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'dialog-title' : undefined}
          aria-describedby={description ? 'dialog-desc' : undefined}
        >
          {/* Backdrop */}
          <motion.div
            {...safeMotion(backdropFade)}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            ref={dialogRef}
            {...safeMotion(scaleIn)}
            className={cn(
              'relative w-full z-10 my-8 rounded-[var(--radius-2xl)] bg-surface-card border border-surface-border shadow-[var(--shadow-xl)] p-6 sm:p-8',
              sizeClasses[size],
              className
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-surface-border">
              <div>
                {title && (
                  <h3
                    id="dialog-title"
                    className="text-xl font-bold text-text-primary leading-snug"
                  >
                    {title}
                  </h3>
                )}
                {description && (
                  <p id="dialog-desc" className="text-sm text-text-secondary mt-1">
                    {description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors focus-visible:outline-2 focus-visible:outline-primary-500"
                aria-label="إغلاق النافذة"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Body */}
            <div className="py-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
