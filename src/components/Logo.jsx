import { useState } from 'react'

// EMI logo. Prefers the real brand asset at /emi-logo.png (drop the file into
// the project's `public/` folder). Until that exists, it falls back to a
// vector mark + wordmark so the navbar is never broken.
export default function Logo({ className = '' }) {
  const [useImage, setUseImage] = useState(true)

  if (useImage) {
    return (
      <img
        src="/emi-logo.png"
        alt="EMI — Enlightenment Mentorship Institute"
        className={`h-9 w-auto ${className}`}
        onError={() => setUseImage(false)}
      />
    )
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 48 48"
        className="h-7 w-7 flex-shrink-0"
        fill="none"
        aria-hidden="true"
      >
        <path d="M6 7 L20 24 L6 41 L15 41 L29 24 L15 7 Z" fill="currentColor" />
        <path d="M19 7 L33 24 L19 41 L28 41 L42 24 L28 7 Z" fill="currentColor" opacity="0.7" />
      </svg>
      <span className="font-display text-2xl font-extrabold tracking-tight leading-none">
        EMI
      </span>
    </div>
  )
}
