export default function WhyProofLocker() {
  return (
    <div className="relative z-10 py-12 md:py-16 px-8 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-center text-white mb-3" style={{ fontFamily: 'var(--font-montserrat)' }}>
          Why It Matters
        </h2>
        <p className="text-base md:text-lg text-white/70 text-center mb-12 font-medium">
          Accountability without compromise
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Anonymous by Default */}
          <div className="bg-gradient-to-br from-purple-600/5 via-blue-600/5 to-purple-700/5 border border-white/10 hover:border-white/20 rounded-2xl shadow-lg transition-all duration-300 p-5 flex flex-col h-full min-h-[200px] hover:shadow-[0_0_30px_rgba(147,112,219,0.12)]">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br from-[#00bfff]/10 to-[#9370db]/10 flex-shrink-0">
              <svg className="w-7 h-7 text-[#9370db]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-base md:text-lg font-bold text-white mb-2">Anonymous by Default</h3>
            <p className="text-gray-400 text-sm leading-relaxed flex-grow">
              Lock predictions without exposing your identity, yet build a verifiable accountability score over time. Privacy meets credibility.
            </p>
          </div>

          {/* Your Control — Public or Private */}
          <div className="bg-gradient-to-br from-purple-600/5 via-blue-600/5 to-purple-700/5 border border-white/10 hover:border-white/20 rounded-2xl shadow-lg transition-all duration-300 p-5 flex flex-col h-full min-h-[200px] hover:shadow-[0_0_30px_rgba(147,112,219,0.12)]">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br from-[#00bfff]/10 to-[#9370db]/10 flex-shrink-0">
              <svg className="w-7 h-7 text-[#9370db]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-base md:text-lg font-bold text-white mb-2">Public or Private Control</h3>
            <p className="text-gray-400 text-sm leading-relaxed flex-grow">
              Share now or reveal later—full control over your on-chain commitments. You decide when the world sees your proof.
            </p>
          </div>

          {/* Immutable On-Chain Proof */}
          <div className="bg-gradient-to-br from-purple-600/5 via-blue-600/5 to-purple-700/5 border border-white/10 hover:border-white/20 rounded-2xl shadow-lg transition-all duration-300 p-5 flex flex-col h-full min-h-[200px] hover:shadow-[0_0_30px_rgba(147,112,219,0.12)]">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br from-[#00bfff]/10 to-[#9370db]/10 flex-shrink-0">
              <svg className="w-7 h-7 text-[#9370db]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-base md:text-lg font-bold text-white mb-2">Immutable On-Chain Proof</h3>
            <p className="text-gray-400 text-sm leading-relaxed flex-grow">
              Constellation DAG ensures uneditable, eternal timestamps for true accountability. No backdating, no tampering.
            </p>
          </div>

          {/* Shareable Proof Cards */}
          <div className="bg-gradient-to-br from-purple-600/5 via-blue-600/5 to-purple-700/5 border border-white/10 hover:border-white/20 rounded-2xl shadow-lg transition-all duration-300 p-5 flex flex-col h-full min-h-[200px] hover:shadow-[0_0_30px_rgba(147,112,219,0.12)]">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br from-[#00bfff]/10 to-[#9370db]/10 flex-shrink-0">
              <svg className="w-7 h-7 text-[#9370db]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-base md:text-lg font-bold text-white mb-2">Shareable Proof Cards</h3>
            <p className="text-gray-400 text-sm leading-relaxed flex-grow">
              Clean, embeddable receipts to showcase accuracy.
            </p>
          </div>

          {/* Business & Shareholder Accountability */}
          <div className="bg-gradient-to-br from-purple-600/5 via-blue-600/5 to-purple-700/5 border border-white/10 hover:border-white/20 rounded-2xl shadow-lg transition-all duration-300 p-5 flex flex-col h-full min-h-[200px] hover:shadow-[0_0_30px_rgba(147,112,219,0.12)]">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br from-[#00bfff]/10 to-[#9370db]/10 flex-shrink-0">
              <svg className="w-7 h-7 text-[#9370db]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-base md:text-lg font-bold text-white mb-2">Business Accountability</h3>
            <p className="text-gray-400 text-sm leading-relaxed flex-grow">
              Lock strategic plans on-chain. Demonstrate delivery.
            </p>
          </div>

          {/* Personal Challenges */}
          <div className="bg-gradient-to-br from-purple-600/5 via-blue-600/5 to-purple-700/5 border border-white/10 hover:border-white/20 rounded-2xl shadow-lg transition-all duration-300 p-5 flex flex-col h-full min-h-[200px] hover:shadow-[0_0_30px_rgba(147,112,219,0.12)]">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br from-[#00bfff]/10 to-[#9370db]/10 flex-shrink-0">
              <svg className="w-7 h-7 text-[#9370db]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base md:text-lg font-bold text-white mb-2">Personal Challenges</h3>
            <p className="text-gray-400 text-sm leading-relaxed flex-grow">
              Hold yourself to goals. Prove growth with verifiable timestamps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
