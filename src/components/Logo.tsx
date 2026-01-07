export default function ProofLockerLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Chain links - minimal, neutral */}
      <circle cx="25" cy="30" r="8" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.3" />
      <circle cx="50" cy="30" r="8" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.3" />
      <circle cx="75" cy="30" r="8" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.3" />
      <line x1="33" y1="30" x2="42" y2="30" stroke="currentColor" strokeWidth="2.5" opacity="0.3" />
      <line x1="58" y1="30" x2="67" y2="30" stroke="currentColor" strokeWidth="2.5" opacity="0.3" />

      {/* Main lock body */}
      <rect
        x="32"
        y="50"
        width="36"
        height="32"
        rx="3"
        fill="currentColor"
      />

      {/* Lock shackle */}
      <path
        d="M 40 50 V 40 C 40 32 44 28 50 28 C 56 28 60 32 60 40 V 50"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Keyhole */}
      <circle cx="50" cy="63" r="3.5" fill="#0a0a0a" />
      <rect x="48.5" y="63" width="3" height="9" rx="1.5" fill="#0a0a0a" />
    </svg>
  );
}
