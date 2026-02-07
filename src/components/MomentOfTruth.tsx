"use client";

export default function MomentOfTruth() {
  return (
    <div className="relative z-10 py-20 md:py-32 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0F001A] to-[#0a0a0a] overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div
          className="w-[1000px] h-[800px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(0, 224, 255, 0.1) 40%, transparent 70%)'
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-[#00E0FF] via-[#10B981] to-[#00E0FF] bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-montserrat)', filter: 'drop-shadow(0 0 25px rgba(0, 224, 255, 0.3))' }}>
            The Moment of Truth
          </h2>
          <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto">
            This is where predictions become proof. Where conviction becomes credibility.
          </p>
        </div>

        {/* Before/After Split Screen */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* BEFORE - Pending State */}
          <div className="relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
              <span className="px-4 py-2 bg-amber-500/20 border border-amber-500/50 text-amber-300 text-sm font-bold rounded-full">
                BEFORE
              </span>
            </div>

            <div className="bg-gradient-to-br from-amber-600/5 via-amber-500/5 to-amber-700/5 border-2 border-amber-500/30 rounded-2xl p-8 relative overflow-hidden">
              {/* Amber glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center text-white text-sm font-semibold">
                      47
                    </div>
                    <div>
                      <div className="text-white font-medium">Anon #5847</div>
                      <div className="text-xs text-slate-400">Jan 5, 2026</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-400 text-sm font-medium rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/>
                    </svg>
                    Pending
                  </div>
                </div>

                <h3 className="text-white text-lg font-medium mb-4 leading-relaxed">
                  Satellite imagery shows military buildup at border—conflict escalates within 90 days
                </h3>

                <div className="space-y-2 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Status:</span>
                    <span className="text-amber-400">Awaiting resolution</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Evidence:</span>
                    <span>0 pieces</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Points:</span>
                    <span>+10 (lock bonus)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AFTER - Resolved Correct */}
          <div className="relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
              <span className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-sm font-bold rounded-full">
                AFTER
              </span>
            </div>

            <div className="bg-gradient-to-br from-emerald-600/10 via-emerald-500/5 to-emerald-700/10 border-2 border-emerald-500/50 rounded-2xl p-8 relative overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.3)]">
              {/* Emerald glow + celebration effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent pointer-events-none animate-pulse" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white text-sm font-semibold ring-2 ring-emerald-400/50">
                      12
                    </div>
                    <div>
                      <div className="text-white font-medium flex items-center gap-2">
                        Anon #5847
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded">
                          Master
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">Resolved Apr 12, 2026</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 text-sm font-bold rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                    CORRECT
                  </div>
                </div>

                <h3 className="text-white text-lg font-medium mb-4 leading-relaxed">
                  Satellite imagery shows military buildup at border—conflict escalates within 90 days
                </h3>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Points earned:</span>
                    <span className="text-emerald-400 font-bold">+180 pts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Evidence:</span>
                    <span className="text-white">3 pieces (Grade A)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Rank:</span>
                    <span className="text-purple-400 font-bold">#47 → #12 ↑</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Streak:</span>
                    <span className="text-orange-400 font-bold">0 → 5</span>
                  </div>
                </div>

                <div className="px-3 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-300 text-xs">
                  Predicted 67 days before it happened
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Visualization */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute top-6 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-cyan-500 to-emerald-500" />

            {/* Timeline markers */}
            <div className="relative flex justify-between items-start">
              {/* Lock */}
              <div className="flex flex-col items-center w-1/4">
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center mb-3 relative z-10 border-4 border-[#0a0a0a]">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <div className="text-center">
                  <div className="text-white font-semibold mb-1">Lock</div>
                  <div className="text-xs text-slate-400">Jan 5, 2026</div>
                </div>
              </div>

              {/* Evidence Added */}
              <div className="flex flex-col items-center w-1/4">
                <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center mb-3 relative z-10 border-4 border-[#0a0a0a]">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <div className="text-center">
                  <div className="text-white font-semibold mb-1">Evidence</div>
                  <div className="text-xs text-slate-400">3 pieces added</div>
                </div>
              </div>

              {/* Event Occurs */}
              <div className="flex flex-col items-center w-1/4">
                <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center mb-3 relative z-10 border-4 border-[#0a0a0a]">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                  </svg>
                </div>
                <div className="text-center">
                  <div className="text-white font-semibold mb-1">Event</div>
                  <div className="text-xs text-slate-400">Conflict starts</div>
                </div>
              </div>

              {/* Resolution */}
              <div className="flex flex-col items-center w-1/4">
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center mb-3 relative z-10 border-4 border-[#0a0a0a] shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <div className="text-center">
                  <div className="text-emerald-400 font-bold mb-1">Resolved</div>
                  <div className="text-xs text-slate-400">Apr 12, 2026</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Impact Statement */}
        <div className="text-center mb-8">
          <div className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600/20 to-emerald-600/20 border border-purple-500/30 rounded-xl">
            <p className="text-lg md:text-xl text-white font-semibold">
              This single resolution jumped them <span className="text-emerald-400 font-bold">35 places</span> on the leaderboard
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <a
            href="/lock"
            className="inline-block px-12 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white text-lg font-bold rounded-xl transition-all shadow-lg hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-[1.05]"
          >
            Your Turn. Make a Claim.
          </a>
        </div>
      </div>
    </div>
  );
}
