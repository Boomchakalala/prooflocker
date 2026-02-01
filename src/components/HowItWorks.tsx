export default function HowItWorks() {
  return (
    <div className="relative z-10 py-16 md:py-24 px-6 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-center text-white mb-10" style={{ fontFamily: 'var(--font-montserrat)' }}>
          How It Works
        </h2>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {/* Step 1 */}
          <div className="bg-gradient-to-br from-purple-600/5 via-blue-600/5 to-purple-700/5 border border-white/10 hover:border-white/20 rounded-2xl shadow-lg transition-all duration-300 p-6 flex flex-col items-center text-center hover:shadow-[0_0_30px_rgba(147,112,219,0.12)]">
            <div className="w-14 h-14 bg-gradient-to-br from-[#00bfff] to-[#9370db] rounded-xl flex items-center justify-center shadow-lg mb-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-2">Step 1</span>
            <h3 className="text-lg md:text-xl font-bold text-white mb-2.5">Write your prediction</h3>
            <p className="text-sm text-white/65 leading-relaxed">
              Make a claim or commitment. Public or private.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-gradient-to-br from-purple-600/5 via-blue-600/5 to-purple-700/5 border border-white/10 hover:border-white/20 rounded-2xl shadow-lg transition-all duration-300 p-6 flex flex-col items-center text-center hover:shadow-[0_0_30px_rgba(147,112,219,0.12)]">
            <div className="w-14 h-14 bg-gradient-to-br from-[#00bfff] to-[#9370db] rounded-xl flex items-center justify-center shadow-lg mb-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-2">Step 2</span>
            <h3 className="text-lg md:text-xl font-bold text-white mb-2.5">Lock it on-chain</h3>
            <p className="text-sm text-white/65 leading-relaxed">
              We hash + timestamp it on Constellation DAG.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-gradient-to-br from-purple-600/5 via-blue-600/5 to-purple-700/5 border border-white/10 hover:border-white/20 rounded-2xl shadow-lg transition-all duration-300 p-6 flex flex-col items-center text-center hover:shadow-[0_0_30px_rgba(147,112,219,0.12)]">
            <div className="w-14 h-14 bg-gradient-to-br from-[#00bfff] to-[#9370db] rounded-xl flex items-center justify-center shadow-lg mb-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-2">Step 3</span>
            <h3 className="text-lg md:text-xl font-bold text-white mb-2.5">Resolve later</h3>
            <p className="text-sm text-white/65 leading-relaxed">
              Come back to mark the outcome and share the receipt.
            </p>
          </div>
        </div>

        {/* DAG Diagram + Text */}
        <div className="mt-10 flex flex-col items-center">
          <svg className="w-full max-w-[400px] md:max-w-[500px] h-20 md:h-24 mb-3" viewBox="0 0 500 120" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          <p className="text-xs md:text-sm text-white/50 text-center max-w-xl leading-relaxed">
            Powered by <span className="text-[#9370db] font-semibold">Constellation DAG</span> — scalable, secure, built for real accountability.
          </p>
        </div>
      </div>
    </div>
  );
}
