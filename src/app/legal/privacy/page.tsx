import { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy - ProofLocker",
  description: "How ProofLocker collects, uses, and protects your information",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen gradient-bg text-white">
      {/* Decorative gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm group"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to home
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="glass border border-white/10 rounded-2xl p-8 md:p-12">
            <div className="text-xs text-neutral-500 mb-6">Last updated: 2026-01-17</div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Privacy Policy</h1>

            <div className="space-y-6 text-neutral-300 leading-relaxed">
              <p>
                ProofLocker is committed to protecting your privacy. This Privacy Policy explains how we collect,
                use, disclose, and safeguard your information when you use our service.
              </p>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>

                <h3 className="text-lg font-semibold text-white mb-2 mt-4">1.1 Information You Provide</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Prediction Content:</strong> The text and metadata of predictions you create</li>
                  <li><strong>Account Information:</strong> If you claim predictions, we may store authentication tokens</li>
                  <li><strong>Contact Information:</strong> Email or other contact details if you reach out to us</li>
                </ul>

                <h3 className="text-lg font-semibold text-white mb-2 mt-4">1.2 Automatically Collected Information</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Usage Data:</strong> Pages visited, features used, interaction timestamps</li>
                  <li><strong>Device Information:</strong> Browser type, operating system, IP address</li>
                  <li><strong>Cookies and Tracking:</strong> Session cookies, analytics data, preferences</li>
                </ul>

                <h3 className="text-lg font-semibold text-white mb-2 mt-4">1.3 Blockchain Data</h3>
                <p>
                  All predictions are written to the Constellation Network blockchain and are publicly accessible,
                  permanent, and immutable. This data includes prediction content, timestamps, and cryptographic
                  hashes.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
                <p className="mb-3">We use collected information for the following purposes:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>To provide and maintain the ProofLocker service</li>
                  <li>To process and display your predictions</li>
                  <li>To authenticate users who claim predictions</li>
                  <li>To improve and optimize the platform</li>
                  <li>To analyze usage patterns and trends</li>
                  <li>To detect and prevent fraud or abuse</li>
                  <li>To communicate with you about the service</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">3. Information Sharing and Disclosure</h2>

                <h3 className="text-lg font-semibold text-white mb-2 mt-4">3.1 Public Blockchain</h3>
                <p>
                  Predictions are written to a public blockchain and are accessible to anyone. This data cannot
                  be deleted or modified once confirmed on-chain.
                </p>

                <h3 className="text-lg font-semibold text-white mb-2 mt-4">3.2 Service Providers</h3>
                <p>
                  We may share information with third-party service providers who assist us in operating the
                  platform (e.g., hosting, analytics, blockchain infrastructure).
                </p>

                <h3 className="text-lg font-semibold text-white mb-2 mt-4">3.3 Legal Requirements</h3>
                <p>
                  We may disclose information if required by law, court order, or government request, or to
                  protect our rights, property, or safety.
                </p>

                <h3 className="text-lg font-semibold text-white mb-2 mt-4">3.4 Business Transfers</h3>
                <p>
                  In the event of a merger, acquisition, or sale of assets, your information may be transferred
                  to the acquiring entity.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">4. Cookies and Tracking Technologies</h2>
                <p>
                  We use cookies and similar tracking technologies to enhance your experience, analyze usage,
                  and maintain session state. You can control cookie settings through your browser, but some
                  features may not function properly if cookies are disabled.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">5. Data Retention</h2>
                <p>
                  We retain your information for as long as necessary to provide our services and comply with
                  legal obligations. Blockchain data is permanent and cannot be deleted. Interface-level data
                  (e.g., analytics, logs) may be retained for operational purposes and deleted according to our
                  retention policies.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">6. Data Security</h2>
                <p>
                  We implement reasonable security measures to protect your information from unauthorized access,
                  alteration, or destruction. However, no method of transmission or storage is 100% secure, and
                  we cannot guarantee absolute security. You are responsible for maintaining the confidentiality
                  of any authentication credentials.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">7. Your Privacy Rights</h2>
                <p className="mb-3">Depending on your jurisdiction, you may have the following rights:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Access:</strong> Request access to personal information we hold about you</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your information (excluding blockchain data)</li>
                  <li><strong>Opt-Out:</strong> Opt out of certain data collection or communications</li>
                  <li><strong>Data Portability:</strong> Request a copy of your data in a portable format</li>
                </ul>
                <p className="mt-3">
                  To exercise these rights, please contact us at the email below. Note that blockchain-recorded
                  data cannot be modified or deleted due to the immutable nature of blockchain technology.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">8. Third-Party Links</h2>
                <p>
                  Our service may contain links to third-party websites or services. We are not responsible for
                  the privacy practices of these third parties. We encourage you to review their privacy policies
                  before providing any personal information.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">9. Children's Privacy</h2>
                <p>
                  ProofLocker is not intended for users under 18 years of age. We do not knowingly collect
                  information from children. If you believe we have collected information from a child, please
                  contact us immediately.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">10. International Users</h2>
                <p>
                  Your information may be transferred to and processed in countries other than your own. By
                  using ProofLocker, you consent to the transfer of your information to jurisdictions that may
                  have different data protection laws than your country.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">11. Changes to This Privacy Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. Changes will be posted on this page with
                  an updated "Last updated" date. Your continued use of ProofLocker after changes constitutes
                  acceptance of the updated policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">12. Contact Us</h2>
                <p>
                  Questions? Contact us at{" "}
                  <a href="mailto:contact@prooflocker.com" className="text-cyan-400 hover:text-cyan-300">
                    contact@prooflocker.com
                  </a>
                </p>
              </section>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
