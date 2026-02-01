export default function WhyProofLocker() {
  return (
    <div className="relative z-10 py-20 px-6 bg-slate-950">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-4">
          Why ProofLocker?
        </h2>
        <p className="text-lg text-gray-400 text-center mb-16">
          The simplest way to prove you called it.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Anonymous by default */}
          <div className="bg-slate-800 border border-gray-700 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all p-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                <line x1="2" y1="2" x2="22" y2="22" strokeLinecap="round" strokeWidth="2" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Anonymous by default</h3>
            <p className="text-gray-400 leading-relaxed">
              No signup, no identity reveal. Lock predictions without revealing who you are.
            </p>
          </div>

          {/* Public or private */}
          <div className="bg-slate-800 border border-gray-700 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all p-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Public or private</h3>
            <p className="text-gray-400 leading-relaxed">
              Share now or wait to drop proof. You control when the world sees your call.
            </p>
          </div>

          {/* Immutable proof */}
          <div className="bg-slate-800 border border-gray-700 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all p-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Immutable proof</h3>
            <p className="text-gray-400 leading-relaxed">
              On-chain forever, can't be changed. Timestamped proof that lasts eternally.
            </p>
          </div>

          {/* Shareable cards */}
          <div className="bg-slate-800 border border-gray-700 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all p-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Shareable cards</h3>
            <p className="text-gray-400 leading-relaxed">
              Beautiful receipts to prove you called it. Share your wins, build credibility.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
