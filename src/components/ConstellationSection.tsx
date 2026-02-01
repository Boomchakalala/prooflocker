export default function ConstellationSection() {
  return (
    <div className="relative z-10 py-16 md:py-20 px-6 bg-[#0a0a0a]">
      {/* Subtle Constellation-inspired gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/5 to-transparent opacity-50" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
        <div
          className="w-[900px] h-[500px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, rgba(20, 184, 166, 0.06) 50%, transparent 70%)'
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Clickable container */}
        <a
          href="https://constellationnetwork.io"
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-gradient-to-br from-cyan-950/10 via-teal-950/5 to-transparent border border-cyan-900/20 hover:border-cyan-700/40 rounded-3xl p-10 md:p-12 transition-all duration-500 hover:shadow-[0_0_40px_rgba(6,182,212,0.1)] group"
        >
          {/* DAG Diagram */}
          <div className="flex justify-center mb-6">
            <svg className="w-full max-w-[380px] md:max-w-[460px] h-20 md:h-24 opacity-40 group-hover:opacity-50 transition-opacity duration-500" viewBox="0 0 500 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Nodes */}
              <circle cx="60" cy="60" r="8" fill="#06b6d4" opacity="0.95" />
              <circle cx="140" cy="35" r="8" fill="#14b8a6" opacity="0.95" />
              <circle cx="140" cy="85" r="8" fill="#06b6d4" opacity="0.95" />
              <circle cx="230" cy="45" r="8" fill="#14b8a6" opacity="0.95" />
              <circle cx="230" cy="75" r="8" fill="#06b6d4" opacity="0.95" />
              <circle cx="320" cy="60" r="8" fill="#14b8a6" opacity="0.95" />
              <circle cx="410" cy="40" r="8" fill="#06b6d4" opacity="0.95" />
              <circle cx="410" cy="80" r="8" fill="#14b8a6" opacity="0.95" />

              {/* Edges */}
              <path d="M 60 60 L 140 35" stroke="#06b6d4" strokeWidth="2" opacity="0.5" />
              <path d="M 60 60 L 140 85" stroke="#06b6d4" strokeWidth="2" opacity="0.5" />
              <path d="M 140 35 L 230 45" stroke="#14b8a6" strokeWidth="2" opacity="0.5" />
              <path d="M 140 85 L 230 75" stroke="#06b6d4" strokeWidth="2" opacity="0.5" />
              <path d="M 230 45 L 320 60" stroke="#14b8a6" strokeWidth="2" opacity="0.5" />
              <path d="M 230 75 L 320 60" stroke="#06b6d4" strokeWidth="2" opacity="0.5" />
              <path d="M 320 60 L 410 40" stroke="#06b6d4" strokeWidth="2" opacity="0.5" />
              <path d="M 320 60 L 410 80" stroke="#14b8a6" strokeWidth="2" opacity="0.5" />
            </svg>
          </div>

          {/* Heading */}
          <h3 className="text-xl md:text-2xl font-semibold text-center text-white mb-3 group-hover:text-cyan-100 transition-colors duration-500" style={{ fontFamily: 'var(--font-montserrat)' }}>
            Built on Constellation DAG
          </h3>

          {/* Description */}
          <p className="text-sm md:text-base text-white/60 group-hover:text-white/70 text-center max-w-2xl mx-auto transition-colors duration-500">
            Timestamped, tamper-proof digital evidence infrastructure.
          </p>

          {/* Subtle external link indicator */}
          <div className="flex justify-center mt-4">
            <svg className="w-4 h-4 text-cyan-500/40 group-hover:text-cyan-400/60 transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
        </a>
      </div>
    </div>
  );
}
