# سلام — Design System (DESIGN-INVENTORY)

## Product Identity

- **Name**: سلام (Salam) — AI-Powered Arabic Mental Health Awareness System
- **Tagline**: وعي نفسي ذكي باللغة العربية
- **Product Type**: Awareness & Early-Indicator System (NOT a diagnostic tool)

---

## 1. Design Tokens

### 1.1 Color Palette — Semantic Tokens

#### Primary (Teal/Cyan — Trust & Calm)
| Token | Light | Dark |
|---|---|---|
| `--color-primary-50` | `#f0fdfa` | — |
| `--color-primary-100` | `#ccfbf1` | — |
| `--color-primary-200` | `#99f6e4` | — |
| `--color-primary-300` | `#5eead4` | — |
| `--color-primary-400` | `#2dd4bf` | — |
| `--color-primary-500` | `#14b8a6` | — |
| `--color-primary-600` | `#0d9488` | — |
| `--color-primary-700` | `#0f766e` | — |
| `--color-primary-800` | `#115e59` | — |
| `--color-primary-900` | `#134e4a` | — |

#### Surface / Neutral
| Token | Value |
|---|---|
| `--surface-bg` | `#fafbfc` |
| `--surface-card` | `#ffffff` |
| `--surface-elevated` | `#ffffff` |
| `--surface-muted` | `#f1f5f9` |
| `--surface-border` | `#e2e8f0` |
| `--surface-border-strong` | `#cbd5e1` |

#### Text
| Token | Value |
|---|---|
| `--text-primary` | `#0f172a` |
| `--text-secondary` | `#475569` |
| `--text-muted` | `#94a3b8` |
| `--text-inverse` | `#ffffff` |
| `--text-on-primary` | `#ffffff` |

#### Semantic / Status
| Token | Use | Value |
|---|---|---|
| `--color-safe` | Low indicator | `#10b981` (emerald) |
| `--color-attention` | Moderate indicator | `#f59e0b` (amber) |
| `--color-elevated` | High indicator | `#ef4444` (red) |
| `--color-info` | Information | `#3b82f6` (blue) |
| `--color-success` | Success state | `#10b981` |
| `--color-warning` | Warning | `#f59e0b` |
| `--color-error` | Error state | `#ef4444` |

### 1.2 Typography

#### Font Family
- **Primary (Arabic)**: `'Cairo', sans-serif`
- **Monospace (Technical)**: `'IBM Plex Mono', monospace`

#### Type Scale
| Token | Size | Weight | Line Height | Use |
|---|---|---|---|---|
| `display-lg` | 3rem (48px) | 700 | 1.2 | Hero headline |
| `display-md` | 2.25rem (36px) | 700 | 1.25 | Section title |
| `display-sm` | 1.875rem (30px) | 600 | 1.3 | Subsection title |
| `heading-lg` | 1.5rem (24px) | 600 | 1.4 | Card title |
| `heading-md` | 1.25rem (20px) | 600 | 1.4 | Component title |
| `heading-sm` | 1.125rem (18px) | 600 | 1.5 | Small heading |
| `body-lg` | 1.125rem (18px) | 400 | 1.7 | Large body |
| `body-md` | 1rem (16px) | 400 | 1.7 | Default body |
| `body-sm` | 0.875rem (14px) | 400 | 1.6 | Small body |
| `caption` | 0.75rem (12px) | 400 | 1.5 | Caption/helper |
| `overline` | 0.75rem (12px) | 600 | 1.5 | Label overline |

### 1.3 Spacing Scale
| Token | Value |
|---|---|
| `space-1` | 0.25rem (4px) |
| `space-2` | 0.5rem (8px) |
| `space-3` | 0.75rem (12px) |
| `space-4` | 1rem (16px) |
| `space-5` | 1.25rem (20px) |
| `space-6` | 1.5rem (24px) |
| `space-8` | 2rem (32px) |
| `space-10` | 2.5rem (40px) |
| `space-12` | 3rem (48px) |
| `space-16` | 4rem (64px) |
| `space-20` | 5rem (80px) |
| `space-24` | 6rem (96px) |

### 1.4 Border Radius
| Token | Value |
|---|---|
| `radius-sm` | 0.375rem (6px) |
| `radius-md` | 0.5rem (8px) |
| `radius-lg` | 0.75rem (12px) |
| `radius-xl` | 1rem (16px) |
| `radius-2xl` | 1.5rem (24px) |
| `radius-full` | 9999px |

### 1.5 Shadows
| Token | Value |
|---|---|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` |
| `shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)` |
| `shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04)` |
| `shadow-xl` | `0 20px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04)` |
| `shadow-glow-primary` | `0 0 20px rgba(20,184,166,0.15)` |

### 1.6 Motion
| Token | Value | Use |
|---|---|---|
| `duration-fast` | 150ms | Micro-interactions |
| `duration-normal` | 250ms | Standard transitions |
| `duration-slow` | 400ms | Page transitions |
| `duration-slower` | 600ms | Complex animations |
| `ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | General |
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Enter |
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Exit |
| `ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy |

### 1.7 Breakpoints
| Token | Value |
|---|---|
| `bp-sm` | 640px |
| `bp-md` | 768px |
| `bp-lg` | 1024px |
| `bp-xl` | 1280px |
| `bp-2xl` | 1440px |

### 1.8 Container Widths
| Token | Value |
|---|---|
| `container-sm` | 640px |
| `container-md` | 768px |
| `container-lg` | 1024px |
| `container-xl` | 1200px |
| `container-prose` | 680px |

---

## 2. Component Inventory

### Primitives
- `Button` — primary, secondary, outline, ghost, danger variants; sm/md/lg sizes
- `Input` — text input with label, helper, error
- `Textarea` — multi-line with character count
- `Badge` — status indicators (safe/attention/elevated)
- `Card` — surface container with optional header, footer
- `Alert` — info, warning, success, error variants
- `Dialog` — modal overlay with accessible focus trap
- `Progress` — linear and circular variants
- `Tabs` — accessible tab navigation
- `Accordion` — expandable content sections

### Layout
- `Container` — max-width centered with responsive padding
- `Section` — page section with consistent vertical spacing
- `Stack` — vertical/horizontal flex layout
- `Grid` — responsive CSS grid layout

### Navigation
- `Navbar` — sticky top navigation with mobile menu
- `Footer` — site footer with links and disclaimer
- `MobileMenu` — slide-in mobile navigation

### Assessment
- `AssessmentTextarea` — large Arabic text input
- `QuestionCard` — structured question display
- `ConsentForm` — acknowledgment UI
- `StepIndicator` — progress through assessment steps

### Results
- `IndicatorLevel` — visual level display (منخفض/يستحق الانتباه/مرتفع)
- `FactorCard` — contributing factor display
- `DisclaimerBanner` — prominent medical disclaimer
- `ResultSummary` — overall result presentation

### Explanation
- `FeatureImportance` — visual factor ranking
- `ProgressiveDisclosure` — expandable detail levels
- `UncertaintyIndicator` — confidence/uncertainty display

### Awareness
- `ArticleCard` — educational content card
- `MythFactCard` — myth vs fact display
- `SupportCard` — professional referral card

---

## 3. Motion Patterns

| Pattern | Properties | Duration | Easing |
|---|---|---|---|
| Fade Up | opacity: 0→1, y: 20→0 | 400ms | ease-out |
| Stagger Children | delay: index × 100ms | 400ms | ease-out |
| Scale In | scale: 0.95→1, opacity: 0→1 | 300ms | ease-out |
| Slide In RTL | x: -20→0, opacity: 0→1 | 350ms | ease-out |
| Progress Fill | width: 0→target | 600ms | ease-default |

---

## 4. Accessibility Standards

- WCAG 2.1 AA compliance target
- Minimum contrast ratio: 4.5:1 (normal text), 3:1 (large text)
- Focus visible on all interactive elements
- Keyboard navigation for all flows
- Screen reader announcements for status changes
- `prefers-reduced-motion` respected globally
- Semantic HTML throughout
- ARIA labels in Arabic
