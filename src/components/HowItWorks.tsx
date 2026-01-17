export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Write a prediction",
      description: "Make a claim about the future. Keep it private or share it later.",
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
    {
      number: "2",
      title: "Lock it on-chain",
      description: "Get a cryptographic fingerprint + timestamp. Immutable & tamper-proof.",
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      number: "3",
      title: "Prove it later",
      description: "Resolve the outcome. Share your proof card. Show you called it.",
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="relative z-10 py-8 sm:py-10 md:py-16 px-4">
      <div className="max-w-6xl mx-auto md:px-6">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-10 md:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-3 md:mb-4 flex items-center justify-center gap-3">
            <svg className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            How it works
          </h2>
          <div className="flex justify-center">
            <p className="text-base sm:text-lg text-neutral-400 max-w-[32ch] sm:max-w-3xl mx-auto text-center leading-relaxed opacity-80 lg:whitespace-nowrap">
              Three steps to lock a prediction with immutable, timestamped proof
            </p>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6 md:grid md:grid-cols-3 md:gap-6 lg:gap-8 md:space-y-0">
          {steps.map((step, index) => (
            <div
              key={index}
              className="glass border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 hover:border-purple-500/30 transition-all group"
            >
              {/* Number Badge and Title Row */}
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 md:mb-4">
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg sm:text-xl group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/20 flex-shrink-0">
                  {step.number}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  {step.icon}
                  {step.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
