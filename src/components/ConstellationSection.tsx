export default function ConstellationSection() {
  return (
    <div className="relative z-10 py-12 md:py-16 px-6 bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-purple-600/5 via-blue-600/5 to-purple-700/5 border border-white/10 rounded-2xl p-8 md:p-12">
          {/* DAG Diagram */}
          <div className="flex justify-center mb-6">
            <svg className="w-full max-w-[400px] md:max-w-[500px] h-20 md:h-24" viewBox="0 0 500 120" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          <h2 className="text-2xl md:text-4xl font-bold text-center text-white mb-4" style={{ fontFamily: 'var(--font-montserrat)' }}>
            Built on Constellation DAG
          </h2>

          {/* Description */}
          <p className="text-base md:text-lg text-white/70 text-center max-w-3xl mx-auto leading-relaxed">
            Every prediction is blockchain-backed digital evidence—timestamped, tamper-proof, and immutable. Constellation DAG provides the infrastructure for real accountability at scale.
          </p>
        </div>
      </div>
    </div>
  );
}
