export default function ConstellationSection() {
  return (
    <div className="py-8 px-6 text-center">
      {/* Network graphic */}
      <div className="flex justify-center mb-4">
        <svg className="w-[280px] h-12 opacity-20" viewBox="0 0 500 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Nodes */}
          <circle cx="60" cy="60" r="6" fill="#06b6d4" />
          <circle cx="140" cy="35" r="6" fill="#14b8a6" />
          <circle cx="140" cy="85" r="6" fill="#06b6d4" />
          <circle cx="230" cy="45" r="6" fill="#14b8a6" />
          <circle cx="230" cy="75" r="6" fill="#06b6d4" />
          <circle cx="320" cy="60" r="6" fill="#14b8a6" />
          <circle cx="410" cy="40" r="6" fill="#06b6d4" />
          <circle cx="410" cy="80" r="6" fill="#14b8a6" />
          {/* Edges */}
          <path d="M 60 60 L 140 35" stroke="#06b6d4" strokeWidth="1.5" opacity="0.4" />
          <path d="M 60 60 L 140 85" stroke="#06b6d4" strokeWidth="1.5" opacity="0.4" />
          <path d="M 140 35 L 230 45" stroke="#14b8a6" strokeWidth="1.5" opacity="0.4" />
          <path d="M 140 85 L 230 75" stroke="#06b6d4" strokeWidth="1.5" opacity="0.4" />
          <path d="M 230 45 L 320 60" stroke="#14b8a6" strokeWidth="1.5" opacity="0.4" />
          <path d="M 230 75 L 320 60" stroke="#06b6d4" strokeWidth="1.5" opacity="0.4" />
          <path d="M 320 60 L 410 40" stroke="#06b6d4" strokeWidth="1.5" opacity="0.4" />
          <path d="M 320 60 L 410 80" stroke="#14b8a6" strokeWidth="1.5" opacity="0.4" />
        </svg>
      </div>

      {/* Trust statement */}
      <p className="text-sm text-gray-400">
        Powered by{' '}
        <a
          href="https://constellationnetwork.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-500 hover:text-cyan-400 transition-colors"
        >
          Constellation DAG
        </a>
        {' '}— scalable, secure, built for real accountability.
      </p>
    </div>
  );
}
