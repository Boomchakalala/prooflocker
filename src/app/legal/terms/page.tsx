import { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Service - ProofLocker",
  description: "Terms and conditions for using ProofLocker",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen gradient-bg text-white">
      {/* Decorative gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 -right-40 w-96 h-96 bg-[#5B21B6]/10 rounded-full blur-3xl" />
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

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Terms of Service</h1>

            <div className="space-y-6 text-neutral-300 leading-relaxed">
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using ProofLocker, you accept and agree to be bound by these Terms of Service.
                  If you do not agree to these terms, you must not use this service. We reserve the right to
                  modify these terms at any time, and your continued use constitutes acceptance of any changes.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">2. Eligibility</h2>
                <p>
                  You must be at least 18 years old to use ProofLocker. By using this service, you represent
                  and warrant that you meet this age requirement and have the legal capacity to enter into
                  these terms. You are responsible for ensuring your use complies with all applicable laws
                  in your jurisdiction.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">3. User Content and Conduct</h2>
                <p className="mb-3">
                  You are solely responsible for all content you create, submit, or publish on ProofLocker
                  ("User Content"). By submitting User Content, you represent that:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You own or have the necessary rights to the content</li>
                  <li>Your content does not violate any laws or third-party rights</li>
                  <li>Your content does not contain malware, viruses, or harmful code</li>
                  <li>You understand that blockchain-recorded content is permanent and immutable</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">4. Prohibited Use</h2>
                <p className="mb-3">You agree not to use ProofLocker to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Post illegal, fraudulent, defamatory, or harmful content</li>
                  <li>Violate intellectual property rights of others</li>
                  <li>Harass, threaten, or abuse other users</li>
                  <li>Engage in spam, phishing, or malicious activities</li>
                  <li>Manipulate or game the platform's features</li>
                  <li>Impersonate others or misrepresent your affiliation</li>
                  <li>Attempt to compromise the security or integrity of the service</li>
                  <li>Use automated tools to access the service without permission</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">5. Intellectual Property</h2>
                <p>
                  ProofLocker and its original content, features, and functionality are owned by the operators
                  and are protected by international copyright, trademark, and other intellectual property laws.
                  You retain ownership of your User Content, but grant us a worldwide, non-exclusive, royalty-free
                  license to display and distribute it through the service and blockchain network.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">6. Moderation and Removal</h2>
                <p>
                  We reserve the right to hide, flag, or remove content from our interface that violates these
                  terms or applicable laws. However, due to blockchain immutability, we cannot delete content
                  from the underlying blockchain. Hidden content may still be accessible via direct blockchain
                  queries.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">7. Account Termination</h2>
                <p>
                  We reserve the right to suspend or terminate your access to ProofLocker at any time, with or
                  without notice, for conduct that we believe violates these terms or is harmful to other users,
                  us, or third parties, or for any other reason at our sole discretion.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">8. Disclaimers</h2>
                <p>
                  ProofLocker is provided "as is" without warranties of any kind. We disclaim all warranties,
                  express or implied, including warranties of merchantability, fitness for a particular purpose,
                  and non-infringement. We do not guarantee the accuracy, completeness, or usefulness of any
                  information on the service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">9. Limitation of Liability</h2>
                <p>
                  To the maximum extent permitted by law, ProofLocker and its operators shall not be liable
                  for any indirect, incidental, special, consequential, or punitive damages, including loss
                  of profits, data, use, goodwill, or other intangible losses, resulting from your access to
                  or use of (or inability to access or use) the service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">10. Indemnification</h2>
                <p>
                  You agree to indemnify and hold harmless ProofLocker and its operators from any claims,
                  damages, losses, liabilities, and expenses (including legal fees) arising from your use
                  of the service, your User Content, or your violation of these terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">11. Governing Law</h2>
                <p>
                  These terms shall be governed by and construed in accordance with applicable laws, without
                  regard to conflict of law principles. Any disputes arising from these terms or your use of
                  the service shall be subject to the exclusive jurisdiction of the appropriate courts.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">12. Severability</h2>
                <p>
                  If any provision of these terms is found to be unenforceable or invalid, that provision shall
                  be limited or eliminated to the minimum extent necessary, and the remaining provisions shall
                  remain in full force and effect.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">13. Contact</h2>
                <p>
                  For questions about these Terms of Service, please contact us at:
                </p>
                <p className="mt-2 text-cyan-400">
                  legal@prooflocker.example.com
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
