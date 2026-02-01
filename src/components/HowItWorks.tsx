export default function HowItWorks() {
  return (
    <div className="relative z-10 py-24 px-6 bg-[#0a0a0a]">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 lg:px-16">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-20" style={{ fontFamily: 'var(--font-montserrat)' }}>
          How It Works — Straightforward & Secure
        </h2>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting dotted lines (desktop only) */}
          <div className="hidden md:block absolute top-20 left-0 right-0 h-0.5 border-t-2 border-dashed border-[#00bfff]/30 -z-10" style={{ width: 'calc(100% - 160px)', margin: '0 80px' }} />

          {/* Step 1 */}
          <div className="bg-[#111111] border border-gray-800/50 hover:border-[#00bfff]/50 rounded-[20px] shadow-lg hover:shadow-2xl transition-all p-8 relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-[#00bfff] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-6 glow-blue">
                1
              </div>
              <svg className="w-14 h-14 text-[#00bfff] mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <h3 className="text-xl font-bold text-white mb-4">Declare Your Position</h3>
              <p className="text-gray-400 text-base leading-relaxed">
                State a prediction, personal goal, or business milestone. Private or public tease.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-[#111111] border border-gray-800/50 hover:border-[#00bfff]/50 rounded-[20px] shadow-lg hover:shadow-2xl transition-all p-8 relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-[#00bfff] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-6 glow-blue">
                2
              </div>
              <svg className="w-14 h-14 text-[#00bfff] mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="text-xl font-bold text-white mb-4">Lock On-Chain</h3>
              <p className="text-gray-400 text-base leading-relaxed">
                Cryptographic hash + timestamp on Constellation DAG. Low cost, permanent, no congestion.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-[#111111] border border-gray-800/50 hover:border-[#00bfff]/50 rounded-[20px] shadow-lg hover:shadow-2xl transition-all p-8 relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-[#00bfff] rounded-full flex items-center justify-center text-white shadow-lg mb-6 glow-blue">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <svg className="w-14 h-14 text-[#00bfff] mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-bold text-white mb-4">Prove & Resolve</h3>
              <p className="text-gray-400 text-base leading-relaxed">
                Confirm outcome later. Generate shareable card. Undeniable evidence — for yourself or stakeholders.
              </p>
            </div>
          </div>
        </div>

        {/* DAG Diagram - more compact and smooth */}
        <div className="mt-20 flex flex-col items-center">
          <svg className="w-full max-w-[500px] h-28 mb-6" viewBox="0 0 500 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Nodes - tighter spacing */}
            <circle cx="60" cy="60" r="10" fill="#00bfff" opacity="0.9" />
            <circle cx="140" cy="35" r="10" fill="#9370db" opacity="0.9" />
            <circle cx="140" cy="85" r="10" fill="#00bfff" opacity="0.9" />
            <circle cx="230" cy="45" r="10" fill="#9370db" opacity="0.9" />
            <circle cx="230" cy="75" r="10" fill="#00bfff" opacity="0.9" />
            <circle cx="320" cy="60" r="10" fill="#9370db" opacity="0.9" />
            <circle cx="410" cy="40" r="10" fill="#00bfff" opacity="0.9" />
            <circle cx="410" cy="80" r="10" fill="#9370db" opacity="0.9" />

            {/* Edges - thicker, smoother */}
            <path d="M 60 60 L 140 35" stroke="#00bfff" strokeWidth="2" opacity="0.5" />
            <path d="M 60 60 L 140 85" stroke="#00bfff" strokeWidth="2" opacity="0.5" />
            <path d="M 140 35 L 230 45" stroke="#9370db" strokeWidth="2" opacity="0.5" />
            <path d="M 140 85 L 230 75" stroke="#00bfff" strokeWidth="2" opacity="0.5" />
            <path d="M 230 45 L 320 60" stroke="#9370db" strokeWidth="2" opacity="0.5" />
            <path d="M 230 75 L 320 60" stroke="#00bfff" strokeWidth="2" opacity="0.5" />
            <path d="M 320 60 L 410 40" stroke="#00bfff" strokeWidth="2" opacity="0.5" />
            <path d="M 320 60 L 410 80" stroke="#9370db" strokeWidth="2" opacity="0.5" />
          </svg>
          <p className="text-sm text-gray-500 text-center max-w-2xl leading-relaxed">
            Powered by <span className="text-[#9370db] font-semibold">Constellation DAG</span> — scalable, secure, built for real accountability.
          </p>
        </div>
      </div>
    </div>
  );
}
