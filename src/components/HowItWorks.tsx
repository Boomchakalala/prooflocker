export default function HowItWorks() {
  return (
    <div className="relative z-10 py-16 md:py-24 px-6 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <h2 className="text-3xl md:text-5xl font-bold text-center text-white mb-16" style={{ fontFamily: 'var(--font-montserrat)' }}>
          How It Works
        </h2>

        {/* Three Horizontal Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Box 1: Write a Prediction */}
          <div className="bg-gradient-to-br from-purple-600/5 via-blue-600/5 to-purple-700/5 border border-white/10 hover:border-[#00bfff]/30 rounded-2xl p-6 lg:p-8 transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center justify-center mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#00bfff]/20 to-[#9370db]/20 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-[#00bfff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white text-center mb-4">Write a Prediction</h3>
            <p className="text-sm md:text-base text-white/70 leading-relaxed">
              Create a clear claim, goal, or commitment in plain language. Public or private—your choice. No signup required. Write predictions designed to be resolved later with complete transparency.
            </p>
          </div>

          {/* Box 2: Lock It On-Chain */}
          <div className="bg-gradient-to-br from-purple-600/5 via-blue-600/5 to-purple-700/5 border border-white/10 hover:border-[#9370db]/30 rounded-2xl p-6 lg:p-8 transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center justify-center mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#9370db]/20 to-[#00bfff]/20 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-[#9370db]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white text-center mb-4">Lock It On-Chain</h3>
            <p className="text-sm md:text-base text-white/70 leading-relaxed">
              Your prediction is instantly hashed and timestamped on Constellation DAG. Immutable. Tamper-proof. Takes only seconds. Once locked, it cannot be edited—ever. Blockchain-backed permanence.
            </p>
          </div>

          {/* Box 3: Resolve & Share */}
          <div className="bg-gradient-to-br from-purple-600/5 via-blue-600/5 to-purple-700/5 border border-white/10 hover:border-[#00bfff]/30 rounded-2xl p-6 lg:p-8 transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center justify-center mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#00bfff]/20 to-[#9370db]/20 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-[#00bfff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white text-center mb-4">Resolve & Share</h3>
            <p className="text-sm md:text-base text-white/70 leading-relaxed">
              Return anytime to mark outcomes as correct, missed, or pending. Generate shareable proof cards showcasing your track record. Each resolution builds long-term credibility and verifiable accountability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
