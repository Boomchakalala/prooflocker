export default function WhyProofLocker() {
  const features = [
    {
      title: "Anonymous by default",
      description: "No signup required. Post predictions without revealing your identity.",
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      title: "Public or private",
      description: "Choose to share your proof immediately or keep it secret until the right moment.",
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Immutable proof",
      description: "Timestamped as digital evidence on Constellation Network. Can't be changed, deleted — or denied.",
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      gradient: "from-blue-500 to-purple-500",
    },
    {
      title: "Shareable proof cards",
      description: "Generate beautiful proof cards to share your wins and build your credibility.",
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      ),
      gradient: "from-pink-500 to-orange-500",
    },
  ];

  return (
    <div className="relative z-10 py-10 sm:py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight">
            Why ProofLocker?
          </h2>
          <div className="mx-auto max-w-fit overflow-hidden">
            <p className="text-sm sm:text-base text-neutral-400 text-center leading-tight opacity-75 whitespace-nowrap">
              The simplest way to prove you called it.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8 hover:border-white/20 transition-all group md:h-full md:flex md:flex-col"
            >
              {/* Mobile: flex layout (icon left, text right), Desktop: stacked */}
              <div className="flex gap-4 items-start md:flex-col md:items-start">
                {/* Icon container */}
                <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-r ${feature.gradient} text-white shrink-0 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>

                {/* Text content */}
                <div className="min-w-0 flex-1 md:mt-3">
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-neutral-400 leading-relaxed opacity-80">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
