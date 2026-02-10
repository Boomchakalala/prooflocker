import { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy - ProofLocker",
  description: "How ProofLocker collects, uses, and protects your information",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0F] via-[#111118] to-[#0A0A0F] text-white">
      {/* Decorative gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-40 -right-40 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-slate-700/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm group"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to ProofLocker
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-8 md:p-12 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="text-xs text-slate-500 font-mono">EFFECTIVE DATE: 2026-02-10</div>
              <div className="text-xs text-emerald-400 font-semibold px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded">
                v2.0
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Privacy Policy
            </h1>

            <div className="space-y-8 text-slate-300 leading-relaxed">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-sm text-amber-200">
                <div className="flex gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p><strong>Important:</strong> ProofLocker utilizes blockchain technology. All claims locked to the blockchain are permanent, publicly accessible, and cannot be modified or deleted. Please read this policy carefully before submitting any information.</p>
                </div>
              </div>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700/50 pb-2">1. About ProofLocker</h2>
                <p className="mb-3">
                  ProofLocker is an independent platform that enables users to lock timestamped claims to a public blockchain ledger. ProofLocker operates as a proof-of-concept demonstration and educational tool.
                </p>
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 text-sm">
                  <p className="font-semibold text-purple-400 mb-2">Third-Party Technology Disclaimer:</p>
                  <p>
                    ProofLocker is <strong className="text-white">not affiliated with, endorsed by, or operated by Constellation Network</strong>. We utilize Constellation Network's blockchain infrastructure as a third-party service to record immutable timestamps. Constellation Network is not responsible for ProofLocker's operations, content, or any claims made through this platform.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700/50 pb-2">2. Information We Collect</h2>

                <h3 className="text-lg font-semibold text-purple-400 mb-3 mt-6">2.1 User-Provided Information</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong className="text-white">Claim Content:</strong> Text, metadata, and timestamps of predictions/claims you submit</li>
                  <li><strong className="text-white">Anonymous Identifiers:</strong> Browser-generated anonymous IDs stored locally</li>
                  <li><strong className="text-white">Optional Account Data:</strong> Email address or authentication tokens if you choose to claim ownership</li>
                  <li><strong className="text-white">Evidence & Resolutions:</strong> Supporting documentation, URLs, and resolution notes you provide</li>
                  <li><strong className="text-white">OSINT Signals:</strong> If linked, publicly-sourced intelligence data and references</li>
                </ul>

                <h3 className="text-lg font-semibold text-purple-400 mb-3 mt-6">2.2 Automatically Collected Data</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong className="text-white">Usage Analytics:</strong> Page views, feature interactions, navigation patterns, session duration</li>
                  <li><strong className="text-white">Technical Information:</strong> IP address, browser type/version, device type, operating system, screen resolution</li>
                  <li><strong className="text-white">Performance Metrics:</strong> API response times, error logs, system diagnostics</li>
                  <li><strong className="text-white">Cookies & Local Storage:</strong> Session tokens, user preferences, cached data</li>
                </ul>

                <h3 className="text-lg font-semibold text-purple-400 mb-3 mt-6">2.3 Blockchain-Recorded Data</h3>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm text-red-200">
                  <p className="font-semibold mb-2">⚠️ Permanent Public Record</p>
                  <p>
                    All claims submitted to ProofLocker are written to the Constellation Network blockchain via their Digital Evidence API. This data is <strong>permanent, immutable, and publicly accessible</strong>. Once confirmed on-chain, we cannot delete, modify, or hide this information. Blockchain records include claim text, SHA-256 hashes, submission timestamps, and cryptographic signatures.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700/50 pb-2">3. How We Use Your Information</h2>
                <p className="mb-3">We process collected data for the following purposes:</p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-sm">
                    <div className="text-purple-400 font-semibold mb-1">Platform Operations</div>
                    <ul className="text-slate-400 text-xs space-y-1">
                      <li>• Provide core claim-locking functionality</li>
                      <li>• Display claims and evidence on interface</li>
                      <li>• Process blockchain transactions</li>
                      <li>• Maintain user sessions</li>
                    </ul>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-sm">
                    <div className="text-blue-400 font-semibold mb-1">User Experience</div>
                    <ul className="text-slate-400 text-xs space-y-1">
                      <li>• Authenticate claim ownership</li>
                      <li>• Enable reputation tracking</li>
                      <li>• Personalize dashboard views</li>
                      <li>• Remember user preferences</li>
                    </ul>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-sm">
                    <div className="text-emerald-400 font-semibold mb-1">Platform Improvement</div>
                    <ul className="text-slate-400 text-xs space-y-1">
                      <li>• Analyze usage patterns and trends</li>
                      <li>• Optimize performance and reliability</li>
                      <li>• Debug errors and technical issues</li>
                      <li>• Develop new features</li>
                    </ul>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-sm">
                    <div className="text-red-400 font-semibold mb-1">Security & Compliance</div>
                    <ul className="text-slate-400 text-xs space-y-1">
                      <li>• Detect fraud and abuse</li>
                      <li>• Enforce content moderation policies</li>
                      <li>• Comply with legal obligations</li>
                      <li>• Respond to legal requests</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700/50 pb-2">4. Information Sharing & Disclosure</h2>

                <h3 className="text-lg font-semibold text-purple-400 mb-3 mt-6">4.1 Public Blockchain Disclosure</h3>
                <p className="mb-3">
                  All blockchain-submitted claims are <strong>publicly accessible</strong> on the Constellation Network. Anyone can query, view, and verify this data using blockchain explorers or direct API access. This includes the claim text, timestamp, hash, and transaction metadata.
                </p>

                <h3 className="text-lg font-semibold text-purple-400 mb-3 mt-6">4.2 Third-Party Service Providers</h3>
                <p className="mb-2">We may share data with service providers who assist in:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Cloud hosting and infrastructure (servers, databases)</li>
                  <li>Blockchain transaction processing (Constellation Network Digital Evidence API)</li>
                  <li>Analytics and monitoring (usage statistics, error tracking)</li>
                  <li>Authentication services (if using email verification)</li>
                  <li>OSINT data aggregation (Twitter/X API, public intelligence sources)</li>
                </ul>

                <h3 className="text-lg font-semibold text-purple-400 mb-3 mt-6">4.3 Legal Requirements & Protection</h3>
                <p>
                  We may disclose information when required by law, court order, subpoena, or governmental request, or when necessary to protect our rights, property, safety, or that of our users or the public.
                </p>

                <h3 className="text-lg font-semibold text-purple-400 mb-3 mt-6">4.4 Business Transfers</h3>
                <p>
                  In the event of a merger, acquisition, reorganization, or asset sale, user data may be transferred to the successor entity. You will be notified of any such change via this page.
                </p>

                <h3 className="text-lg font-semibold text-purple-400 mb-3 mt-6">4.5 Aggregated & Anonymized Data</h3>
                <p>
                  We may share aggregated, de-identified, or anonymized data that cannot reasonably identify individuals for research, analytics, or promotional purposes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700/50 pb-2">5. Cookies & Tracking Technologies</h2>
                <p className="mb-3">
                  ProofLocker uses cookies, local storage, and similar technologies to enhance functionality and gather analytics:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong className="text-white">Essential Cookies:</strong> Required for basic functionality (session management, authentication, preferences)
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong className="text-white">Analytics Cookies:</strong> Track usage patterns, page views, and feature engagement
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong className="text-white">Local Storage:</strong> Browser-stored data including anonymous IDs, cached content, and user settings
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-400">
                  You can control cookies through your browser settings, but disabling them may impair platform functionality. Clearing local storage will reset your anonymous ID and preferences.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700/50 pb-2">6. Data Retention & Deletion</h2>
                <div className="space-y-4">
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                    <div className="text-white font-semibold mb-2">Interface Data (Deletable)</div>
                    <p className="text-sm">
                      User accounts, analytics logs, and cached data are retained as long as necessary for operational purposes. You may request deletion of interface-level data subject to legal retention requirements.
                    </p>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <div className="text-red-300 font-semibold mb-2">Blockchain Data (Permanent)</div>
                    <p className="text-sm text-red-200">
                      <strong>Blockchain records cannot be deleted.</strong> All claims written to the Constellation Network are permanently stored and publicly accessible. We cannot modify, hide, or remove this data. If you require deletion of blockchain data, do not submit claims to ProofLocker.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700/50 pb-2">7. Data Security</h2>
                <p className="mb-3">
                  We implement industry-standard security measures to protect your data, including:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Encrypted data transmission (HTTPS/TLS)</li>
                  <li>Secure database access controls and authentication</li>
                  <li>Regular security audits and vulnerability assessments</li>
                  <li>Hashed and salted password storage (if applicable)</li>
                  <li>Rate limiting and DDoS protection</li>
                </ul>
                <p className="mt-3 text-sm text-amber-300">
                  <strong>⚠️ Disclaimer:</strong> No method of electronic transmission or storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security. You are responsible for maintaining the confidentiality of any authentication credentials.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700/50 pb-2">8. Your Privacy Rights</h2>
                <p className="mb-3">
                  Depending on your jurisdiction (e.g., GDPR, CCPA), you may have the following rights:
                </p>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                    <div className="text-purple-400 font-semibold mb-1">🔍 Right to Access</div>
                    <p className="text-slate-400">Request a copy of personal data we hold about you</p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                    <div className="text-blue-400 font-semibold mb-1">✏️ Right to Correction</div>
                    <p className="text-slate-400">Request correction of inaccurate information</p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                    <div className="text-red-400 font-semibold mb-1">🗑️ Right to Deletion</div>
                    <p className="text-slate-400">Request deletion of data (excluding blockchain records)</p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                    <div className="text-emerald-400 font-semibold mb-1">🚫 Right to Opt-Out</div>
                    <p className="text-slate-400">Opt out of certain data processing or communications</p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                    <div className="text-yellow-400 font-semibold mb-1">📦 Data Portability</div>
                    <p className="text-slate-400">Receive your data in a machine-readable format</p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                    <div className="text-orange-400 font-semibold mb-1">⏸️ Right to Object</div>
                    <p className="text-slate-400">Object to certain types of data processing</p>
                  </div>
                </div>
                <p className="mt-4 text-sm">
                  To exercise these rights, contact us at <span className="text-purple-400 font-mono">privacy@prooflocker.io</span>. Note that blockchain data is technically impossible to delete due to distributed ledger technology.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700/50 pb-2">9. Children's Privacy</h2>
                <p>
                  ProofLocker is <strong>not intended for users under 18 years of age</strong>. We do not knowingly collect personal information from children. If you believe we have inadvertently collected information from a minor, please contact us immediately at <span className="text-purple-400 font-mono">privacy@prooflocker.io</span> and we will take prompt steps to delete such data from our systems (excluding immutable blockchain records).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700/50 pb-2">10. International Data Transfers</h2>
                <p>
                  Your information may be transferred to, stored, and processed in countries outside your jurisdiction, including countries that may have different data protection laws. By using ProofLocker, you consent to such transfers. Blockchain data is inherently distributed across global nodes and cannot be restricted to specific jurisdictions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700/50 pb-2">11. Third-Party Links & Services</h2>
                <p>
                  ProofLocker may contain links to external websites, blockchain explorers, social media platforms, and third-party services. We are <strong>not responsible</strong> for the privacy practices or content of these external sites. We encourage you to review their privacy policies before providing any personal information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700/50 pb-2">12. California Privacy Rights (CCPA)</h2>
                <p className="mb-3">
                  California residents have additional rights under the California Consumer Privacy Act (CCPA):
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Right to know what personal information is collected, used, shared, or sold</li>
                  <li>Right to request deletion of personal information (excluding blockchain data)</li>
                  <li>Right to opt-out of the "sale" of personal information (we do not sell data)</li>
                  <li>Right to non-discrimination for exercising CCPA rights</li>
                </ul>
                <p className="mt-3 text-sm">
                  To exercise CCPA rights, email <span className="text-purple-400 font-mono">privacy@prooflocker.io</span> with "CCPA Request" in the subject line.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700/50 pb-2">13. Changes to This Privacy Policy</h2>
                <p>
                  We reserve the right to modify this Privacy Policy at any time. Changes will be effective immediately upon posting to this page with an updated "Effective Date" at the top. Material changes may be announced via the platform interface or email (if provided). Your continued use of ProofLocker after changes constitutes acceptance of the revised policy. We encourage you to review this page periodically.
                </p>
              </section>

              <section className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-4">14. Contact Information</h2>
                <p className="mb-4">
                  For questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="space-y-2 text-sm font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">📧 Email:</span>
                    <span className="text-purple-400">privacy@prooflocker.io</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">⚖️ Legal:</span>
                    <span className="text-purple-400">legal@prooflocker.io</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">🔒 Security:</span>
                    <span className="text-purple-400">security@prooflocker.io</span>
                  </div>
                </div>
                <p className="mt-4 text-xs text-slate-400">
                  We aim to respond to all privacy inquiries within 30 days. For urgent security concerns, please use the security contact above.
                </p>
              </section>

              <div className="border-t border-slate-700/50 pt-6 mt-8 text-center text-xs text-slate-500">
                <p>ProofLocker Privacy Policy v2.0 • Effective February 10, 2026</p>
                <p className="mt-1">Independent platform utilizing Constellation Network blockchain technology</p>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
