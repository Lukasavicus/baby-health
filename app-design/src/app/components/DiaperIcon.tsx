interface DiaperIconProps {
  className?: string;
}

export function DiaperIcon({ className = "w-5 h-5" }: DiaperIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Diaper body - a rounded trapezoid shape */}
      <path d="M4 8 C4 6 6 5 8 5 L16 5 C18 5 20 6 20 8 L20 13 C20 17 17 19 12 19 C7 19 4 17 4 13 Z" />
      {/* Waist tabs */}
      <path d="M4 9 L2 8.5" />
      <path d="M20 9 L22 8.5" />
      {/* Center front pattern */}
      <path d="M10 8 L10 12" strokeWidth="1.2" opacity="0.4" />
      <path d="M14 8 L14 12" strokeWidth="1.2" opacity="0.4" />
      {/* Front tape */}
      <rect x="9" y="5" width="6" height="2" rx="0.8" strokeWidth="1.2" />
    </svg>
  );
}
