export default function HowItWorks() {
  return (
    <div className="relative z-10 py-16 md:py-24 px-6 bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto">
        {/* Heading */}
        <h2 className="text-3xl md:text-5xl font-bold text-center text-white mb-3" style={{ fontFamily: 'var(--font-montserrat)' }}>
          How It Works
        </h2>

        {/* Sub-phrase */}
        <p className="text-base md:text-lg text-white/60 text-center mb-12 md:mb-16 max-w-2xl mx-auto">
          Three simple steps to eternal accountability—lock, prove, and build your score.
        </p>

        {/* Vertical Steps Stack */}
        <div className="space-y-6 md:space-y-8 relative">
          {/* Connector Line */}
          <div className="absolute left-6 md:left-8 top-20 bottom-20 w-0.5 bg-gradient-to-b from-[#10b981] via-[#34d399] to-[#10b981] opacity-30 hidden md:block" />

          {/* Step 1 */}
          <div className="relative flex flex-col md:flex-row gap-6 items-start fade-in">
            {/* Circular Badge */}
            <div className="flex-shrink-0 relative z-10">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#10b981] to-[#34d399] flex items-center justify-center shadow-lg ring-4 ring-[#0a0a0a]">
                <span className="text-2xl md:text-3xl font-bold text-white">1</span>
              </div>
            </div>

            {/* Content Box */}
            <div className="flex-1 bg-gradient-to-br from-purple-600/5 via-blue-600/5 to-purple-700/5 border border-white/10 hover:border-[#10b981]/30 rounded-2xl shadow-lg transition-all duration-300 p-6 md:p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-[#10b981]/20 to-[#34d399]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 md:w-7 md:h-7 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white">Craft Your Prediction</h3>
              </div>
              <p className="text-sm md:text-base text-white/70 leading-relaxed">
                Draft a clear claim, goal, or commitment—whether it's public for the world to see or private for your eyes only. No signup needed; just your words, locked in time for ultimate accountability.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative flex flex-col md:flex-row gap-6 items-start fade-in stagger-1">
            {/* Circular Badge */}
            <div className="flex-shrink-0 relative z-10">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#10b981] to-[#34d399] flex items-center justify-center shadow-lg ring-4 ring-[#0a0a0a]">
                <span className="text-2xl md:text-3xl font-bold text-white">2</span>
              </div>
            </div>

            {/* Content Box */}
            <div className="flex-1 bg-gradient-to-br from-purple-600/5 via-blue-600/5 to-purple-700/5 border border-white/10 hover:border-[#10b981]/30 rounded-2xl shadow-lg transition-all duration-300 p-6 md:p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-[#10b981]/20 to-[#34d399]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 md:w-7 md:h-7 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white">Secure It On-Chain</h3>
              </div>
              <p className="text-sm md:text-base text-white/70 leading-relaxed">
                We instantly hash and timestamp your entry on Constellation DAG—taking about 10 seconds flat. This creates an uneditable, blockchain-backed record that's tamper-proof and ready for future proof.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative flex flex-col md:flex-row gap-6 items-start fade-in stagger-2">
            {/* Circular Badge */}
            <div className="flex-shrink-0 relative z-10">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#10b981] to-[#34d399] flex items-center justify-center shadow-lg ring-4 ring-[#0a0a0a]">
                <span className="text-2xl md:text-3xl font-bold text-white">3</span>
              </div>
            </div>

            {/* Content Box */}
            <div className="flex-1 bg-gradient-to-br from-purple-600/5 via-blue-600/5 to-purple-700/5 border border-white/10 hover:border-[#10b981]/30 rounded-2xl shadow-lg transition-all duration-300 p-6 md:p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-[#10b981]/20 to-[#34d399]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 md:w-7 md:h-7 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white">Resolve and Share</h3>
              </div>
              <p className="text-sm md:text-base text-white/70 leading-relaxed">
                Return anytime to mark the outcome as correct, missed, or pending. Generate a shareable proof card to showcase your track record, building credibility with every resolution.
              </p>
            </div>
          </div>
        </div>

        {/* Build Your Accountability Score - New Subsection */}
        <div className="mt-12 md:mt-16 bg-gradient-to-br from-[#10b981]/5 via-[#34d399]/5 to-[#10b981]/5 border border-[#10b981]/20 rounded-2xl shadow-xl p-6 md:p-8 fade-in stagger-3">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#10b981]/20 to-[#34d399]/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-7 h-7 md:w-8 md:h-8 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white">Build Your Accountability Score</h3>
          </div>

          <div className="space-y-4 ml-0 md:ml-20">
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-[#10b981] mt-2 flex-shrink-0" />
              <div>
                <p className="text-base md:text-lg font-semibold text-white/90 mb-1">Points System</p>
                <p className="text-sm md:text-base text-white/70 leading-relaxed">
                  Earn points for accurate resolutions (e.g., +10 for correct predictions at high confidence), with deductions for misses to encourage thoughtful commitments.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-[#10b981] mt-2 flex-shrink-0" />
              <div>
                <p className="text-base md:text-lg font-semibold text-white/90 mb-1">Scoring Growth</p>
                <p className="text-sm md:text-base text-white/70 leading-relaxed">
                  Over time, consistent accuracy boosts your overall score—visible on your anon profile—fostering trust and motivation without revealing identity.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-[#10b981] mt-2 flex-shrink-0" />
              <div>
                <p className="text-base md:text-lg font-semibold text-white/90 mb-1">Accountability Impact</p>
                <p className="text-sm md:text-base text-white/70 leading-relaxed">
                  Higher scores unlock badges and community recognition, turning individual locks into a verifiable history of reliability that grows with each step.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* DAG Diagram + Text */}
        <div className="mt-12 md:mt-16 flex flex-col items-center">
          <svg className="w-full max-w-[400px] md:max-w-[500px] h-20 md:h-24 mb-3" viewBox="0 0 500 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Nodes */}
            <circle cx="60" cy="60" r="8" fill="#10b981" opacity="0.9" />
            <circle cx="140" cy="35" r="8" fill="#34d399" opacity="0.9" />
            <circle cx="140" cy="85" r="8" fill="#10b981" opacity="0.9" />
            <circle cx="230" cy="45" r="8" fill="#34d399" opacity="0.9" />
            <circle cx="230" cy="75" r="8" fill="#10b981" opacity="0.9" />
            <circle cx="320" cy="60" r="8" fill="#34d399" opacity="0.9" />
            <circle cx="410" cy="40" r="8" fill="#10b981" opacity="0.9" />
            <circle cx="410" cy="80" r="8" fill="#34d399" opacity="0.9" />

            {/* Edges */}
            <path d="M 60 60 L 140 35" stroke="#10b981" strokeWidth="2" opacity="0.4" />
            <path d="M 60 60 L 140 85" stroke="#10b981" strokeWidth="2" opacity="0.4" />
            <path d="M 140 35 L 230 45" stroke="#34d399" strokeWidth="2" opacity="0.4" />
            <path d="M 140 85 L 230 75" stroke="#10b981" strokeWidth="2" opacity="0.4" />
            <path d="M 230 45 L 320 60" stroke="#34d399" strokeWidth="2" opacity="0.4" />
            <path d="M 230 75 L 320 60" stroke="#10b981" strokeWidth="2" opacity="0.4" />
            <path d="M 320 60 L 410 40" stroke="#10b981" strokeWidth="2" opacity="0.4" />
            <path d="M 320 60 L 410 80" stroke="#34d399" strokeWidth="2" opacity="0.4" />
          </svg>
          <p className="text-xs md:text-sm text-white/50 text-center max-w-xl leading-relaxed">
            Powered by <span className="text-[#10b981] font-semibold">Constellation DAG</span> — scalable, secure, built for real accountability.
          </p>
        </div>
      </div>
    </div>
  );
}
