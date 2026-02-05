export default function HowItWorks() {
  return (
    <div className="relative z-10 py-16 md:py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0F001A] to-[#0a0a0a]">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-3 bg-gradient-to-r from-[#00E0FF] via-[#C084FC] to-[#A78BFA] bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-montserrat)', filter: 'drop-shadow(0 0 25px rgba(0, 224, 255, 0.3))' }}>
            How It Works
          </h2>
          <p className="text-base md:text-lg text-white/70 font-semibold">
            Three steps. No friction. Permanent proof.
          </p>
        </div>

        {/* Three Horizontal Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Box 1: Write a Prediction */}
          <div className="bg-gradient-to-br from-purple-600/10 via-blue-600/8 to-purple-700/10 border border-[#A78BFA]/30 hover:border-[#00E0FF]/50 rounded-2xl p-6 lg:p-8 transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,224,255,0.25)] hover:-translate-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#00E0FF]/25 to-[#C084FC]/25 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,224,255,0.3)]">
                <svg className="w-7 h-7 text-[#00E0FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white text-center mb-4">Write Your Prediction</h3>
            <p className="text-sm md:text-base text-white/75 leading-relaxed">
              Write your prediction, goal, bet, or commitment — bold and clear. Public flex or private stake. No signup. Just hit lock.
            </p>
          </div>

          {/* Box 2: Lock It On-Chain */}
          <div className="bg-gradient-to-br from-purple-600/10 via-blue-600/8 to-purple-700/10 border border-[#A78BFA]/30 hover:border-[#C084FC]/50 rounded-2xl p-6 lg:p-8 transition-all duration-300 hover:shadow-[0_0_40px_rgba(167,139,250,0.3)] hover:-translate-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#C084FC]/25 to-[#00E0FF]/25 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(167,139,250,0.3)]">
                <svg className="w-7 h-7 text-[#C084FC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white text-center mb-4">Lock It On-Chain</h3>
            <p className="text-sm md:text-base text-white/75 leading-relaxed">
              Hashed and timestamped on Constellation DAG in ~10 seconds. Immutable. Tamper-proof. Your word, frozen forever — no edits, no excuses.
            </p>
          </div>

          {/* Box 3: Resolve & Share */}
          <div className="bg-gradient-to-br from-purple-600/10 via-blue-600/8 to-purple-700/10 border border-[#A78BFA]/30 hover:border-[#00E0FF]/50 rounded-2xl p-6 lg:p-8 transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,224,255,0.25)] hover:-translate-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#00E0FF]/25 to-[#C084FC]/25 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,224,255,0.3)]">
                <svg className="w-7 h-7 text-[#00E0FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white text-center mb-4">Resolve & Own It</h3>
            <p className="text-sm md:text-base text-white/75 leading-relaxed">
              Come back when it's time. Mark it hit, miss, or pending. Claim the outcome honestly. Build your reputation score and generate shareable proof cards to flex your track record.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
