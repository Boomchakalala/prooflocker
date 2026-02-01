export default function HowItWorks() {
  return (
    <div className="relative z-10 py-16 px-6 bg-[#0f172a]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-16">
          How it works
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-[#1e293b] border border-gray-700 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md">
                1
              </div>
              <h3 className="text-2xl font-bold text-white">Write your prediction</h3>
            </div>
            <p className="text-gray-300 text-base leading-relaxed">
              Bold claim, keep it secret or tease. Markets, sports, tech, personal goals—anything.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-[#1e293b] border border-gray-700 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md">
                2
              </div>
              <h3 className="text-2xl font-bold text-white">Lock on-chain</h3>
            </div>
            <p className="text-gray-300 text-base leading-relaxed">
              Fingerprint + timestamp on Constellation. Cheap & permanent. Immutable cryptographic proof.
            </p>
          </div>

          {/* Step 3 with green checkmark */}
          <div className="bg-[#1e293b] border border-gray-700 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white shadow-md">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">Prove later</h3>
            </div>
            <p className="text-gray-300 text-base leading-relaxed">
              Resolve, generate card, flex your win. Show the world you called it first.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
