export default function AccountabilityScore() {
  return (
    <div className="relative z-10 py-16 md:py-24 px-6 bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <h2 className="text-3xl md:text-5xl font-bold text-center text-white mb-4" style={{ fontFamily: 'var(--font-montserrat)' }}>
          Track Record Over Hype
        </h2>

        {/* Subheading */}
        <p className="text-base md:text-lg text-white/60 text-center max-w-2xl mx-auto mb-12">
          Build verifiable credibility through consistent accuracy. Your reputation, backed by immutable proof.
        </p>

        {/* Three Tight Bullets */}
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Points System */}
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00bfff]/20 to-[#9370db]/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#00bfff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-white mb-1">Points for Correct Predictions</h3>
              <p className="text-sm md:text-base text-white/70 leading-relaxed">
                Accurate resolutions earn points. Consistency builds momentum. Penalties for misses keep it honest.
              </p>
            </div>
          </div>

          {/* Reputation Growth */}
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#9370db]/20 to-[#00bfff]/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#9370db]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-white mb-1">Verifiable Track Record</h3>
              <p className="text-sm md:text-base text-white/70 leading-relaxed">
                Your score reflects long-term reliability. Visible to others. No identity required—just results.
              </p>
            </div>
          </div>

          {/* Accountability History */}
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00bfff]/20 to-[#9370db]/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#00bfff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-white mb-1">Credibility That Compounds</h3>
              <p className="text-sm md:text-base text-white/70 leading-relaxed">
                Each resolution strengthens your history. Recognition follows accuracy. Trust built through proof.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
