export default function ProofLockerLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className="relative group">
      <svg
        className={`${className} transition-transform duration-300 group-hover:scale-110`}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer glow circle */}
        <circle cx="60" cy="60" r="50" fill="url(#bgGradient)" opacity="0.15" />

        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="lockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>

        {/* Main lock shape - rounded and modern */}
        <g className="group-hover:translate-y-[-2px] transition-transform duration-300">
          {/* Lock body - rounded rectangle with gradient */}
          <rect
            x="38"
            y="55"
            width="44"
            height="38"
            rx="8"
            fill="url(#lockGradient)"
          />

          {/* Lock shackle - thicker and more prominent */}
          <path
            d="M 45 55 L 45 42 C 45 33 50 28 60 28 C 70 28 75 33 75 42 L 75 55"
            stroke="url(#lockGradient)"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />

          {/* Keyhole - modern circular design */}
          <circle cx="60" cy="70" r="5" fill="#0a0a0a" opacity="0.4" />
          <rect x="57.5" y="70" width="5" height="12" rx="2.5" fill="#0a0a0a" opacity="0.4" />

          {/* Shine effect on lock */}
          <rect
            x="42"
            y="58"
            width="3"
            height="18"
            rx="1.5"
            fill="white"
            opacity="0.3"
          />
        </g>

        {/* Floating sparkles for fun */}
        <g className="animate-pulse">
          <circle cx="88" cy="40" r="3" fill="#3b82f6" opacity="0.6" />
          <circle cx="32" cy="78" r="2.5" fill="#6366f1" opacity="0.5" />
          <circle cx="90" cy="80" r="2" fill="#60a5fa" opacity="0.6" />
        </g>

        {/* Checkmark badge - proof verified */}
        <g className="group-hover:scale-110 transition-transform duration-300" transform="translate(78, 75)">
          <circle cx="0" cy="0" r="12" fill="#10b981" />
          <path
            d="M -4 0 L -1 3 L 4 -3"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>
      </svg>
    </div>
  );
}
