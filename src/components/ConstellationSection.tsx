export default function ConstellationSection() {
  return (
    <div className="py-8 px-6 text-center">
      {/* Network graphic */}
      <div className="flex justify-center mb-4">
        <svg className="w-[280px] h-12 opacity-20" viewBox="0 0 500 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Nodes */}
          <circle cx="60" cy="60" r="6" fill="#2E5CFF" />
          <circle cx="140" cy="35" r="6" fill="#5B21B6" />
          <circle cx="140" cy="85" r="6" fill="#2E5CFF" />
          <circle cx="230" cy="45" r="6" fill="#5B21B6" />
          <circle cx="230" cy="75" r="6" fill="#2E5CFF" />
          <circle cx="320" cy="60" r="6" fill="#5B21B6" />
          <circle cx="410" cy="40" r="6" fill="#2E5CFF" />
          <circle cx="410" cy="80" r="6" fill="#5B21B6" />
          {/* Edges */}
          <path d="M 60 60 L 140 35" stroke="#2E5CFF" strokeWidth="1.5" opacity="0.4" />
          <path d="M 60 60 L 140 85" stroke="#2E5CFF" strokeWidth="1.5" opacity="0.4" />
          <path d="M 140 35 L 230 45" stroke="#5B21B6" strokeWidth="1.5" opacity="0.4" />
          <path d="M 140 85 L 230 75" stroke="#2E5CFF" strokeWidth="1.5" opacity="0.4" />
          <path d="M 230 45 L 320 60" stroke="#5B21B6" strokeWidth="1.5" opacity="0.4" />
          <path d="M 230 75 L 320 60" stroke="#2E5CFF" strokeWidth="1.5" opacity="0.4" />
          <path d="M 320 60 L 410 40" stroke="#2E5CFF" strokeWidth="1.5" opacity="0.4" />
          <path d="M 320 60 L 410 80" stroke="#5B21B6" strokeWidth="1.5" opacity="0.4" />
        </svg>
      </div>

      {/* Trust statement */}
      <p className="text-sm text-gray-400">
        Scalable, secure, built for real accountability on{' '}
        <a
          href="https://constellationnetwork.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#5B21B6] hover:text-[#2E5CFF] transition-colors font-semibold"
        >
          Constellation DAG
        </a>
      </p>
    </div>
  );
}
