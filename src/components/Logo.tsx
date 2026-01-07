export default function ProofLockerLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="tealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>

      {/* Abstract geometric mark - angular frame forming "P" */}
      <path
        d="M 8 8 L 8 32 L 11 32 L 11 11 L 24 11 L 24 20 L 27 20 L 27 8 Z"
        fill="url(#tealGradient)"
      />
      <path
        d="M 27 20 L 32 20 L 32 8 L 27 8 Z"
        fill="url(#tealGradient)"
        opacity="0.6"
      />
      <rect
        x="16"
        y="20"
        width="3"
        height="12"
        fill="url(#tealGradient)"
      />
    </svg>
  );
}
