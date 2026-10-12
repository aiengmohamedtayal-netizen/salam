import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { collapseExpand, safeMotion } from '@/lib/motion';

/**
 * Accordion component for progressive disclosure and FAQs.
 * @param {object} props
 * @param {Array<{ id: string, title: string, subtitle?: string, badge?: React.ReactNode, content: React.ReactNode }>} props.items
 * @param {boolean} [props.allowMultiple]
 * @param {string|string[]} [props.defaultOpen]
 * @param {string} [props.className]
 */
export function Accordion({
  items = [],
  allowMultiple = false,
  defaultOpen,
  className,
}) {
  const [openIds, setOpenIds] = useState(() => {
    if (!defaultOpen) return [];
    return Array.isArray(defaultOpen) ? defaultOpen : [defaultOpen];
  });

  const toggleItem = (id) => {
    setOpenIds((prev) => {
      if (allowMultiple) {
        return prev.includes(id)
          ? prev.filter((item) => item !== id)
          : [...prev, id];
      }
      return prev.includes(id) ? [] : [id];
    });
  };

  return (
    <div className={cn('divide-y divide-surface-border rounded-[var(--radius-xl)] border border-surface-border bg-surface-card overflow-hidden', className)}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        const headerId = `accordion-header-${item.id}`;
        const panelId = `accordion-panel-${item.id}`;

        return (
          <div key={item.id} className="transition-colors">
            <h3>
              <button
                type="button"
                id={headerId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggleItem(item.id)}
                className="w-full flex items-center justify-between gap-4 p-5 text-start font-semibold text-text-primary hover:bg-surface-muted/50 transition-colors focus-visible:outline-2 focus-visible:outline-teal-600 select-none cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="min-w-0">
                    <span className="block text-base leading-snug">{item.title}</span>
                    {item.subtitle && (
                      <span className="block text-xs font-normal text-text-muted mt-0.5">
                        {item.subtitle}
                      </span>
                    )}
                  </div>
                  {item.badge}
                </div>

                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 text-text-muted"
                >
                  <ChevronDown className="h-5 w-5" aria-hidden="true" />
                </motion.div>
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={headerId}
                  {...safeMotion(collapseExpand)}
                  className="overflow-hidden"
                >
                  <div className="p-5 pt-0 text-sm text-text-secondary leading-relaxed border-t border-surface-border/50 bg-slate-50/40">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
