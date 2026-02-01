export default function WhyProofLocker() {
  const features = [
    {
      title: "Anonymous by default",
      description: "No signup required. Post predictions without revealing your identity.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
      gradient: "from-cyan-500 to-blue-600",
    },
    {
      title: "Public or private",
      description: "Choose to share your proof immediately or keep it secret until the right moment.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      gradient: "from-purple-500 to-pink-600",
    },
    {
      title: "Immutable proof",
      description: "Timestamped as digital evidence on Constellation Network. Can't be changed, deleted — or denied.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      gradient: "from-blue-600 to-indigo-700",
    },
    {
      title: "Shareable proof cards",
      description: "Generate beautiful proof cards to share your wins and build your credibility.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      ),
      gradient: "from-pink-500 to-orange-500",
    },
  ];

  return (
    <div className="relative z-10 py-12 md:py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto md:px-6">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-3 leading-tight">
            Why ProofLocker?
          </h2>
          <p className="text-base md:text-lg text-gray-600">
            The simplest way to prove you called it.
          </p>
        </div>

        <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="h-full flex flex-col bg-white border border-gray-200 rounded-2xl p-6 md:p-8 hover:border-blue-400 hover:shadow-xl transition-all group"
            >
              {/* Icon and Title Row */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${feature.gradient} text-white group-hover:scale-110 transition-transform shadow-lg flex-shrink-0`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                  {feature.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-base text-gray-600 leading-relaxed flex-1">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
