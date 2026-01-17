export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Write a prediction",
      description: "Make a claim about the future. Keep it private or share it later.",
    },
    {
      number: "2",
      title: "Lock it on-chain",
      description: "Get a cryptographic fingerprint + timestamp. Immutable & tamper-proof.",
    },
    {
      number: "3",
      title: "Prove it later",
      description: "Resolve the outcome. Share your proof card. Show you called it.",
    },
  ];

  return (
    <div className="relative z-10 py-10 sm:py-16 px-4">
      <div className="max-w-6xl mx-auto md:px-6">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 flex items-center justify-center gap-3">
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
        <div className="space-y-4 sm:space-y-6 md:grid md:grid-cols-3 md:gap-6 lg:gap-8 md:space-y-0">
          {steps.map((step, index) => (
            <div
              key={index}
              className="glass border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:border-purple-500/30 transition-all group"
            >
              {/* Number badge */}
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-xl sm:text-2xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/20">
                {step.number}
              </div>

              {/* Content */}
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                {step.title}
              </h3>
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
