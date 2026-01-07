export default function FullLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Symbol */}
      <svg
        className="w-10 h-10 flex-shrink-0"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Abstract geometric mark - layered rectangles representing a record/proof */}
        {/* Main vertical bar - represents the record */}
        <rect x="8" y="8" width="3" height="24" fill="#14b8a6" />

        {/* Horizontal entries - like lines in a log/receipt */}
        <rect x="14" y="10" width="18" height="2" fill="#14b8a6" />
        <rect x="14" y="16" width="14" height="2" fill="#14b8a6" />
        <rect x="14" y="22" width="16" height="2" fill="#14b8a6" />
        <rect x="14" y="28" width="12" height="2" fill="#14b8a6" />
      </svg>

      {/* Wordmark */}
      <span className="text-xl font-semibold text-white font-sans">
        ProofLocker
      </span>
    </div>
  );
}
