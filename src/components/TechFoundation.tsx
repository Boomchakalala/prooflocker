export default function TechFoundation() {
  return (
    <div className="relative z-10 py-20 md:py-28 px-6 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-center text-white mb-6" style={{ fontFamily: 'var(--font-montserrat)' }}>
          Foundation: Constellation DAG
        </h2>
        <p className="text-xl bg-gradient-to-r from-[#00bfff] to-[#9370db] bg-clip-text text-transparent text-center font-semibold mb-8">
          Scalable, secure, built for real accountability.
        </p>

        {/* Digital Evidence Logo */}
        <div className="flex justify-center mb-12">
          <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-[#00bfff]/30 to-[#9370db]/30 rounded-2xl border-2 border-[#00bfff]/40 p-4">
            <svg className="w-12 h-12 text-[#00bfff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
              <circle cx="12" cy="11" r="2"/>
            </svg>
          </div>
        </div>

        {/* 3 Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* Speed */}
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00bfff]/10 to-[#9370db]/10 flex items-center justify-center mb-6 glow-blue transition-transform hover:scale-105">
              <svg className="w-10 h-10 text-[#00bfff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Speed</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Near-instant finality for hashing predictions on-chain. Lock your claims in seconds with cryptographic certainty.</p>
          </div>

          {/* Scalability */}
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00bfff]/10 to-[#9370db]/10 flex items-center justify-center mb-6 glow-purple transition-transform hover:scale-105">
              <svg className="w-10 h-10 text-[#9370db]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Scalability</h3>
            <p className="text-gray-400 text-sm leading-relaxed">No congestion, unlimited throughput—perfect for global accountability. Scale to millions of predictions without slowdown.</p>
          </div>

          {/* Security */}
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00bfff]/10 to-[#9370db]/10 flex items-center justify-center mb-6 glow-blue transition-transform hover:scale-105">
              <svg className="w-10 h-10 text-[#00bfff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Security</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Cryptographically guaranteed, powering immutable digital evidence via Constellation DAG. Military-grade protection for your claims.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
