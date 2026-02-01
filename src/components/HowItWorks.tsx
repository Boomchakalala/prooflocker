export default function HowItWorks() {
  return (
    <div className="relative z-10 py-20 px-6 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-16" style={{ fontFamily: 'var(--font-montserrat)' }}>
          How It Works — Straightforward & Secure
        </h2>

        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* Connecting dotted lines (desktop only) */}
          <div className="hidden md:block absolute top-16 left-0 right-0 h-0.5 border-t-2 border-dashed border-[#00bfff]/30 -z-10" style={{ width: 'calc(100% - 120px)', margin: '0 60px' }} />

          {/* Step 1 */}
          <div className="bg-[#1e1e1e] border border-gray-800 hover:border-[#00bfff]/50 rounded-xl shadow-lg hover:shadow-2xl transition-all p-8 relative">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-[#00bfff] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-4 glow-blue">
                1
              </div>
              <svg className="w-12 h-12 text-[#00bfff] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <h3 className="text-xl font-bold text-white mb-3">Declare Your Position</h3>
              <p className="text-gray-400 text-base leading-relaxed">
                State a prediction, personal goal, or business milestone. Private or public tease.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-[#1e1e1e] border border-gray-800 hover:border-[#00bfff]/50 rounded-xl shadow-lg hover:shadow-2xl transition-all p-8 relative">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-[#00bfff] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-4 glow-blue">
                2
              </div>
              <svg className="w-12 h-12 text-[#00bfff] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="text-xl font-bold text-white mb-3">Lock On-Chain</h3>
              <p className="text-gray-400 text-base leading-relaxed">
                Cryptographic hash + timestamp on Constellation DAG. Low cost, permanent, no congestion.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-[#1e1e1e] border border-gray-800 hover:border-[#00bfff]/50 rounded-xl shadow-lg hover:shadow-2xl transition-all p-8 relative">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-[#00bfff] rounded-full flex items-center justify-center text-white shadow-lg mb-4 glow-blue">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <svg className="w-12 h-12 text-[#00bfff] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-bold text-white mb-3">Prove & Resolve</h3>
              <p className="text-gray-400 text-base leading-relaxed">
                Confirm outcome later. Generate shareable card. Undeniable evidence — for yourself or stakeholders.
              </p>
            </div>
          </div>
        </div>

        {/* DAG Diagram */}
        <div className="mt-16 flex flex-col items-center">
          <svg className="w-full max-w-md h-32 mb-4" viewBox="0 0 400 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Nodes */}
            <circle cx="50" cy="60" r="8" fill="#00bfff" opacity="0.8" />
            <circle cx="120" cy="30" r="8" fill="#9370db" opacity="0.8" />
            <circle cx="120" cy="90" r="8" fill="#00bfff" opacity="0.8" />
            <circle cx="200" cy="45" r="8" fill="#9370db" opacity="0.8" />
            <circle cx="200" cy="75" r="8" fill="#00bfff" opacity="0.8" />
            <circle cx="280" cy="60" r="8" fill="#9370db" opacity="0.8" />
            <circle cx="350" cy="40" r="8" fill="#00bfff" opacity="0.8" />
            <circle cx="350" cy="80" r="8" fill="#9370db" opacity="0.8" />

            {/* Edges */}
            <path d="M 50 60 L 120 30" stroke="#00bfff" strokeWidth="1.5" opacity="0.4" />
            <path d="M 50 60 L 120 90" stroke="#00bfff" strokeWidth="1.5" opacity="0.4" />
            <path d="M 120 30 L 200 45" stroke="#9370db" strokeWidth="1.5" opacity="0.4" />
            <path d="M 120 90 L 200 75" stroke="#00bfff" strokeWidth="1.5" opacity="0.4" />
            <path d="M 200 45 L 280 60" stroke="#9370db" strokeWidth="1.5" opacity="0.4" />
            <path d="M 200 75 L 280 60" stroke="#00bfff" strokeWidth="1.5" opacity="0.4" />
            <path d="M 280 60 L 350 40" stroke="#00bfff" strokeWidth="1.5" opacity="0.4" />
            <path d="M 280 60 L 350 80" stroke="#9370db" strokeWidth="1.5" opacity="0.4" />
          </svg>
          <p className="text-sm text-gray-500 text-center max-w-2xl">
            Powered by <span className="text-[#9370db] font-semibold">Constellation DAG</span> — scalable, secure, built for real accountability.
          </p>
        </div>
      </div>
    </div>
  );
}
