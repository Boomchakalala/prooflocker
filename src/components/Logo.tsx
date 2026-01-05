export default function ProofLockerLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="lockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="chainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>

      {/* Chain links in background */}
      <g opacity="0.4">
        <circle cx="25" cy="25" r="8" stroke="url(#chainGradient)" strokeWidth="3" fill="none" />
        <circle cx="45" cy="25" r="8" stroke="url(#chainGradient)" strokeWidth="3" fill="none" />
        <circle cx="65" cy="25" r="8" stroke="url(#chainGradient)" strokeWidth="3" fill="none" />
      </g>

      {/* Main lock body */}
      <rect
        x="30"
        y="45"
        width="40"
        height="35"
        rx="4"
        fill="url(#lockGradient)"
      />

      {/* Lock shackle */}
      <path
        d="M 38 45 V 35 C 38 27 42 23 50 23 C 58 23 62 27 62 35 V 45"
        stroke="url(#lockGradient)"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />

      {/* Keyhole */}
      <circle cx="50" cy="60" r="4" fill="#0a0a0a" opacity="0.6" />
      <rect x="48" y="60" width="4" height="10" rx="2" fill="#0a0a0a" opacity="0.6" />

      {/* Sparkle effects */}
      <circle cx="22" cy="50" r="2" fill="#3b82f6" opacity="0.6">
        <animate
          attributeName="opacity"
          values="0.6;1;0.6"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="78" cy="55" r="2" fill="#8b5cf6" opacity="0.6">
        <animate
          attributeName="opacity"
          values="0.6;1;0.6"
          dur="2.5s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="85" cy="70" r="1.5" fill="#06b6d4" opacity="0.6">
        <animate
          attributeName="opacity"
          values="0.6;1;0.6"
          dur="3s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}
