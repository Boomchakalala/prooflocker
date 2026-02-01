export default function TechFoundation() {
  return (
    <div className="relative z-10 py-24 px-6 bg-[#0a0a0a]">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 lg:px-16">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-8" style={{ fontFamily: 'var(--font-montserrat)' }}>
          The Foundation: Constellation DAG
        </h2>
        <p className="text-lg text-gray-300 text-center leading-relaxed mb-16 max-w-4xl mx-auto">
          Not traditional blockchain. Constellation's Directed Acyclic Graph delivers hyper-scalable, low-latency transactions for permanent commitments. Hashes, timestamps, resolutions — all verifiable on-chain. No central points of failure. Pure cryptographic truth for predictions and corporate pledges.
        </p>

        {/* 3-icon row - tighter with fixed widths */}
        <div className="flex flex-wrap items-center justify-center gap-8 mt-20">
          {/* Speed */}
          <div className="flex flex-col items-center text-center w-full sm:w-[340px] md:w-[360px]">
            <div className="w-[100px] h-[100px] rounded-full bg-[#00bfff]/10 flex items-center justify-center mb-6 glow-blue transition-transform hover:scale-105">
              <svg className="w-14 h-14 text-[#00bfff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Speed</h3>
            <p className="text-gray-400 text-base leading-relaxed">Near-instant finality for commitments</p>
          </div>

          {/* Scalability */}
          <div className="flex flex-col items-center text-center w-full sm:w-[340px] md:w-[360px]">
            <div className="w-[100px] h-[100px] rounded-full bg-[#9370db]/10 flex items-center justify-center mb-6 glow-purple transition-transform hover:scale-105">
              <svg className="w-14 h-14 text-[#9370db]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Scalability</h3>
            <p className="text-gray-400 text-base leading-relaxed">No congestion, unlimited throughput</p>
          </div>

          {/* Security */}
          <div className="flex flex-col items-center text-center w-full sm:w-[340px] md:w-[360px]">
            <div className="w-[100px] h-[100px] rounded-full bg-[#00bfff]/10 flex items-center justify-center mb-6 glow-blue transition-transform hover:scale-105">
              <svg className="w-14 h-14 text-[#00bfff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Security</h3>
            <p className="text-gray-400 text-base leading-relaxed">Cryptographically guaranteed permanence</p>
          </div>
        </div>
      </div>
    </div>
  );
}
