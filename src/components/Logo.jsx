// EMI brand mark — a double-chevron blade (approximating the flyer logo)
// paired with the "EMI" wordmark.
export default function Logo({ className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 48 48"
        className="h-7 w-7 flex-shrink-0"
        fill="none"
        aria-hidden="true"
      >
        {/* two stacked chevron blades */}
        <path
          d="M6 7 L20 24 L6 41 L15 41 L29 24 L15 7 Z"
          fill="currentColor"
        />
        <path
          d="M19 7 L33 24 L19 41 L28 41 L42 24 L28 7 Z"
          fill="currentColor"
          opacity="0.7"
        />
      </svg>
      <span className="font-display text-2xl font-extrabold tracking-tight leading-none">
        EMI
      </span>
    </div>
  )
}
