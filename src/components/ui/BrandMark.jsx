export function BrandMark({ className = 'h-10 w-10' }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M24 5.5c-10.2 0-18.5 7.1-18.5 16 0 5.1 2.8 9.6 7.3 12.5l-.9 7.8 8.2-4.9c1.3.3 2.6.5 3.9.5 10.2 0 18.5-7.1 18.5-16S34.2 5.5 24 5.5Z"
        className="fill-primary-100 stroke-primary-600 dark:fill-primary-200 dark:stroke-primary-400"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 23h3.2l2.2-5.2 4.3 12.1 3.2-8.1 1.8 3.2h4.3"
        className="stroke-primary-700 dark:stroke-primary-800"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="35.5" cy="12.5" r="2.5" className="fill-amber-400" />
    </svg>
  );
}
