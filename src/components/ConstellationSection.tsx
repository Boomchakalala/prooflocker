export default function ConstellationSection() {
  return (
    <div className="relative z-10 py-10 md:py-12 px-6 bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto">
        <div className="border-t border-white/5 pt-10 md:pt-12">
          {/* DAG Diagram */}
          <div className="flex justify-center mb-5">
            <svg className="w-full max-w-[320px] md:max-w-[400px] h-16 md:h-20 opacity-40" viewBox="0 0 500 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Nodes */}
              <circle cx="60" cy="60" r="8" fill="#00bfff" opacity="0.9" />
              <circle cx="140" cy="35" r="8" fill="#9370db" opacity="0.9" />
              <circle cx="140" cy="85" r="8" fill="#00bfff" opacity="0.9" />
              <circle cx="230" cy="45" r="8" fill="#9370db" opacity="0.9" />
              <circle cx="230" cy="75" r="8" fill="#00bfff" opacity="0.9" />
              <circle cx="320" cy="60" r="8" fill="#9370db" opacity="0.9" />
              <circle cx="410" cy="40" r="8" fill="#00bfff" opacity="0.9" />
              <circle cx="410" cy="80" r="8" fill="#9370db" opacity="0.9" />

              {/* Edges */}
              <path d="M 60 60 L 140 35" stroke="#00bfff" strokeWidth="2" opacity="0.4" />
              <path d="M 60 60 L 140 85" stroke="#00bfff" strokeWidth="2" opacity="0.4" />
              <path d="M 140 35 L 230 45" stroke="#9370db" strokeWidth="2" opacity="0.4" />
              <path d="M 140 85 L 230 75" stroke="#00bfff" strokeWidth="2" opacity="0.4" />
              <path d="M 230 45 L 320 60" stroke="#9370db" strokeWidth="2" opacity="0.4" />
              <path d="M 230 75 L 320 60" stroke="#00bfff" strokeWidth="2" opacity="0.4" />
              <path d="M 320 60 L 410 40" stroke="#00bfff" strokeWidth="2" opacity="0.4" />
              <path d="M 320 60 L 410 80" stroke="#9370db" strokeWidth="2" opacity="0.4" />
            </svg>
          </div>

          {/* Heading */}
          <h3 className="text-lg md:text-xl font-semibold text-center text-white/80 mb-2" style={{ fontFamily: 'var(--font-montserrat)' }}>
            Built on Constellation DAG
          </h3>

          {/* Description */}
          <p className="text-sm md:text-base text-white/50 text-center max-w-2xl mx-auto">
            Timestamped, tamper-proof infrastructure for real accountability.
          </p>
        </div>
      </div>
    </div>
  );
}
