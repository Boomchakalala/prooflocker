import { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Disclaimer - ProofLocker",
  description: "Important disclaimers and limitations regarding the use of ProofLocker",
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen gradient-bg text-white">
      {/* Decorative gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-80 h-80 bg-[#2E5CFF]/10 rounded-full blur-3xl" />
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

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Disclaimer</h1>

            <div className="space-y-6 text-neutral-300 leading-relaxed">
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">1. No Financial or Investment Advice</h2>
                <p>
                  ProofLocker is a tool for creating immutable, timestamped claims on a public blockchain.
                  Nothing on this platform constitutes financial, investment, legal, or professional advice.
                  Predictions made by users are for informational and entertainment purposes only. You should
                  conduct your own research and consult with qualified professionals before making any financial
                  or investment decisions.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">2. No Warranty</h2>
                <p>
                  ProofLocker is provided "as is" and "as available" without warranties of any kind, either
                  express or implied. We do not warrant that the service will be uninterrupted, secure, or
                  error-free. We make no guarantees regarding the accuracy, reliability, or availability of
                  the platform or blockchain network.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">3. User Responsibility</h2>
                <p>
                  You are solely responsible for the content you create and lock on ProofLocker. You are
                  responsible for ensuring that your claims comply with all applicable laws and regulations.
                  You acknowledge that once a claim is locked on the blockchain, it becomes immutable and
                  cannot be edited or deleted.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">4. Blockchain and Immutability</h2>
                <p>
                  All predictions are recorded on the Constellation Network blockchain. Due to the nature of
                  blockchain technology, data is permanent and immutable once confirmed. ProofLocker cannot
                  modify, edit, or remove data that has been written to the blockchain. While we may hide content
                  from our interface for moderation purposes, the underlying blockchain record remains permanent.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">5. Third-Party Services</h2>
                <p>
                  ProofLocker relies on third-party blockchain infrastructure (Constellation Network/Digital Evidence)
                  and other services. We are not responsible for the availability, accuracy, or functionality of
                  these third-party services. Any issues with the blockchain network are outside our control.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">6. Limitation of Liability</h2>
                <p>
                  To the fullest extent permitted by law, ProofLocker and its operators shall not be liable for
                  any indirect, incidental, special, consequential, or punitive damages, or any loss of profits
                  or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or
                  other intangible losses resulting from your use of the service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">7. Accuracy of Predictions</h2>
                <p>
                  User-generated predictions on ProofLocker are opinions and should not be relied upon as facts.
                  We do not verify, endorse, or guarantee the accuracy of any prediction. Past performance or
                  prediction accuracy does not guarantee future results.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">8. Changes to Disclaimer</h2>
                <p>
                  We reserve the right to modify this disclaimer at any time. Changes will be effective immediately
                  upon posting. Your continued use of ProofLocker after changes constitutes acceptance of the
                  updated disclaimer.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">9. Contact</h2>
                <p>
                  If you have questions about this disclaimer, please contact us at:
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
