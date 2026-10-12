import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Accessible Tabs component with smooth active indicator.
 * @param {object} props
 * @param {Array<{ id: string, label: string, icon?: React.ReactNode, count?: number, content?: React.ReactNode }>} props.tabs
 * @param {string} [props.defaultTab]
 * @param {string} [props.activeTab]
 * @param {(tabId: string) => void} [props.onChange]
 * @param {string} [props.className]
 */
export function Tabs({
  tabs = [],
  defaultTab,
  activeTab: controlledActiveTab,
  onChange,
  className,
}) {
  const [internalActiveTab, setInternalActiveTab] = useState(
    defaultTab || tabs[0]?.id || ''
  );

  const activeId = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;

  const handleSelect = (tabId) => {
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tabId);
    }
    if (onChange) {
      onChange(tabId);
    }
  };

  const activeTabObj = tabs.find((t) => t.id === activeId);

  return (
    <div className={cn('w-full', className)}>
      {/* Tab Navigation */}
      <div
        role="tablist"
        aria-orientation="horizontal"
        className="flex items-center gap-1 border-b border-surface-border overflow-x-auto no-scrollbar pb-px"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-controls={`tabpanel-${tab.id}`}
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => handleSelect(tab.id)}
              className={cn(
                'relative flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors duration-150 shrink-0 cursor-pointer select-none',
                isActive
                  ? 'text-teal-700 font-bold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted/50 rounded-t-lg'
              )}
            >
              {tab.icon && (
                <span className="shrink-0 text-current">{tab.icon}</span>
              )}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full tabular-nums',
                    isActive
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-slate-100 text-slate-600'
                  )}
                >
                  {tab.count}
                </span>
              )}

              {/* Active Indicator Bar */}
              {isActive && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 inset-x-0 h-0.5 bg-teal-600 rounded-full"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panel Content */}
      {activeTabObj && activeTabObj.content && (
        <div
          role="tabpanel"
          id={`tabpanel-${activeTabObj.id}`}
          aria-labelledby={`tab-${activeTabObj.id}`}
          className="pt-6 focus:outline-none"
          tabIndex={0}
        >
          {activeTabObj.content}
        </div>
      )}
    </div>
  );
}
