import { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Service - ProofLocker",
  description: "Terms and conditions for using ProofLocker",
};

export default function TermsPage() {
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
              Terms of Service
            </h1>

            <div className="space-y-8 text-slate-300 leading-relaxed">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm text-red-200">
                <div className="flex gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-semibold mb-1">CRITICAL WARNING: Read Before Use</p>
                    <p>By using ProofLocker, you acknowledge that all claims submitted to the blockchain are <strong>PERMANENT, IMMUTABLE, and PUBLICLY ACCESSIBLE FOREVER</strong>. They cannot be edited, deleted, or hidden once confirmed on-chain. Do not submit sensitive, private, or confidential information.</p>
                  </div>
                </div>
              </div>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700/50 pb-2">1. Agreement to Terms</h2>
                <p className="mb-3">
                  These Terms of Service ("Terms") constitute a legally binding agreement between you ("User", "you") and ProofLocker ("we", "us", "Platform") governing your access to and use of the ProofLocker platform, including all services, features, and content provided through <span className="text-purple-400">prooflocker.io</span> and associated interfaces.
                </p>
                <p className="mb-3">
                  <strong className="text-white">By accessing or using ProofLocker, you agree to be bound by these Terms.</strong> If you do not agree to these Terms in their entirety, you must immediately cease all use of the Platform. We reserve the right to modify these Terms at any time without prior notice. Your continued use after modifications constitutes acceptance of the updated Terms.
                </p>
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 text-sm">
                  <p className="font-semibold text-purple-400 mb-2">Third-Party Technology Disclaimer:</p>
                  <p>
                    ProofLocker is <strong className="text-white">an independent platform not affiliated with, endorsed by, sponsored by, or operated by Constellation Network or any related entities</strong>. We utilize Constellation Network's public blockchain infrastructure as a third-party service to provide immutable timestamping functionality. Constellation Network bears no responsibility for ProofLocker's operations, User Content, platform availability, or any claims, disputes, or damages arising from use of this Platform.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700/50 pb-2">2. Eligibility & Account Requirements</h2>

                <h3 className="text-lg font-semibold text-purple-400 mb-3 mt-6">2.1 Age Requirement</h3>
                <p>
                  You must be <strong className="text-white">at least 18 years of age</strong> (or the age of majority in your jurisdiction, whichever is greater) to use ProofLocker. By using the Platform, you represent and warrant that you meet this age requirement and have the legal capacity to enter into binding contracts.
                </p>

                <h3 className="text-lg font-semibold text-purple-400 mb-3 mt-6">2.2 Legal Compliance</h3>
                <p>
                  You represent and warrant that your use of ProofLocker complies with all applicable laws, regulations, and ordinances in your jurisdiction. You are solely responsible for ensuring your use is lawful. ProofLocker makes no representation that the Platform is appropriate or available for use in all locations.
                </p>

                <h3 className="text-lg font-semibold text-purple-400 mb-3 mt-6">2.3 Account Security</h3>
                <p>
                  If you create an account or claim ownership of predictions, you are responsible for maintaining the confidentiality of your authentication credentials. You agree to immediately notify us of any unauthorized access or security breach at <span className="text-purple-400 font-mono">contact@prooflocker.io</span>.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700/50 pb-2">3. User Content & Blockchain Submissions</h2>

                <h3 className="text-lg font-semibold text-purple-400 mb-3 mt-6">3.1 Definition of User Content</h3>
                <p>
                  "User Content" means any and all information, data, text, predictions, claims, evidence, resolutions, comments, metadata, or other materials that you submit, post, upload, or transmit through ProofLocker, whether stored on our servers or recorded on the blockchain.
                </p>

                <h3 className="text-lg font-semibold text-purple-400 mb-3 mt-6">3.2 Ownership & License Grant</h3>
                <p className="mb-3">
                  You retain all ownership rights to your User Content. However, by submitting User Content to ProofLocker, you grant us a <strong className="text-white">worldwide, perpetual, irrevocable, non-exclusive, royalty-free, sublicensable, and transferable license</strong> to use, reproduce, distribute, prepare derivative works of, display, and perform the User Content in connection with:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Operating and providing the ProofLocker platform</li>
                  <li>Displaying User Content through our interface and APIs</li>
                  <li>Recording User Content to the Constellation Network blockchain</li>
                  <li>Promoting, marketing, and improving the Platform</li>
                  <li>Complying with legal obligations and requests</li>
                </ul>

                <h3 className="text-lg font-semibold text-purple-400 mb-3 mt-6">3.3 Blockchain Immutability</h3>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm text-red-200">
                  <p className="font-semibold mb-2">⚠️ PERMANENT PUBLIC RECORD</p>
                  <p>
                    You acknowledge and agree that <strong>all User Content submitted to the blockchain is PERMANENT, IMMUTABLE, and PUBLICLY ACCESSIBLE FOREVER</strong>. Once a blockchain transaction is confirmed, the data becomes part of a distributed public ledger that:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Cannot be edited, modified, or corrected by anyone (including us)</li>
                    <li>Cannot be deleted or removed by anyone (including us)</li>
                    <li>Can be viewed by anyone with blockchain access, even if you delete your account</li>
                    <li>Will exist permanently across global distributed nodes</li>
                  </ul>
                  <p className="mt-2 font-semibold">
                    DO NOT submit personally identifiable information, trade secrets, confidential information, or any content you wish to keep private.
                  </p>
                </div>

                <h3 className="text-lg font-semibold text-purple-400 mb-3 mt-6">3.4 Content Representations & Warranties</h3>
                <p className="mb-3">By submitting User Content, you represent and warrant that:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
                  <li>You own all rights to the content or have obtained all necessary permissions and licenses</li>
                  <li>Your content does not infringe any intellectual property rights, privacy rights, or other rights of third parties</li>
                  <li>Your content does not violate any applicable laws, regulations, or these Terms</li>
                  <li>Your content does not contain viruses, malware, or other harmful code</li>
                  <li>You understand that blockchain submissions are permanent and irreversible</li>
                  <li>You accept full responsibility for all consequences of your submissions</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700/50 pb-2">4. Prohibited Conduct & Content</h2>
                <p className="mb-3">You agree NOT to use ProofLocker to engage in any of the following prohibited activities:</p>

                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-800/50 border border-red-500/30 rounded-lg p-3">
                    <div className="text-red-400 font-semibold mb-2">🚫 Illegal Activities</div>
                    <ul className="text-slate-400 space-y-1 text-xs">
                      <li>• Post illegal, fraudulent, or criminal content</li>
                      <li>• Engage in money laundering or fraud</li>
                      <li>• Violate any local, state, national, or international law</li>
                      <li>• Facilitate illegal activities</li>
                    </ul>
                  </div>
                  <div className="bg-slate-800/50 border border-red-500/30 rounded-lg p-3">
                    <div className="text-red-400 font-semibold mb-2">⚠️ Harmful Content</div>
                    <ul className="text-slate-400 space-y-1 text-xs">
                      <li>• Post defamatory, libelous, or slanderous content</li>
                      <li>• Harass, threaten, or abuse other users</li>
                      <li>• Post hate speech or discriminatory content</li>
                      <li>• Incite violence or dangerous activities</li>
                    </ul>
                  </div>
                  <div className="bg-slate-800/50 border border-red-500/30 rounded-lg p-3">
                    <div className="text-red-400 font-semibold mb-2">🔒 Rights Violations</div>
                    <ul className="text-slate-400 space-y-1 text-xs">
                      <li>• Infringe intellectual property rights</li>
                      <li>• Violate privacy or publicity rights</li>
                      <li>• Share confidential or proprietary information</li>
                      <li>• Impersonate others or misrepresent affiliation</li>
                    </ul>
                  </div>
                  <div className="bg-slate-800/50 border border-red-500/30 rounded-lg p-3">
                    <div className="text-red-400 font-semibold mb-2">💻 Technical Abuse</div>
                    <ul className="text-slate-400 space-y-1 text-xs">
                      <li>• Use automated bots, scrapers, or crawlers</li>
                      <li>• Attempt to hack, compromise, or disrupt systems</li>
                      <li>• Transmit viruses, malware, or harmful code</li>
                      <li>• Overload servers or conduct DDoS attacks</li>
                    </ul>
                  </div>
                  <div className="bg-slate-800/50 border border-red-500/30 rounded-lg p-3">
                    <div className="text-red-400 font-semibold mb-2">📊 Platform Manipulation</div>
                    <ul className="text-slate-400 space-y-1 text-xs">
                      <li>• Game reputation or voting systems</li>
                      <li>• Create fake accounts or sockpuppets</li>
                      <li>• Engage in spam or unsolicited marketing</li>
                      <li>• Manipulate evidence or resolution outcomes</li>
                    </ul>
                  </div>
                  <div className="bg-slate-800/50 border border-red-500/30 rounded-lg p-3">
                    <div className="text-red-400 font-semibold mb-2">🎯 Misuse of Platform</div>
                    <ul className="text-slate-400 space-y-1 text-xs">
                      <li>• Use ProofLocker for unintended purposes</li>
                      <li>• Reverse engineer or decompile software</li>
                      <li>• Circumvent security measures or access controls</li>
                      <li>• Interfere with other users' enjoyment</li>
                    </ul>
                  </div>
                </div>

                <p className="mt-4 text-sm text-amber-300">
                  <strong>⚠️ Enforcement:</strong> Violations may result in content removal from our interface, account suspension or termination, reporting to law enforcement, and legal action. Note that blockchain-recorded content cannot be removed even if your account is terminated.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700/50 pb-2">5. Moderation & Content Removal</h2>

                <h3 className="text-lg font-semibold text-purple-400 mb-3 mt-6">5.1 Interface-Level Moderation</h3>
                <p>
                  We reserve the right, but have no obligation, to monitor, review, hide, flag, or remove User Content from our interface at our sole discretion. Hidden content will not be displayed on ProofLocker's frontend but <strong className="text-white">will remain permanently on the blockchain</strong> and accessible via direct blockchain queries.
                </p>

                <h3 className="text-lg font-semibold text-purple-400 mb-3 mt-6">5.2 Blockchain Immutability Limitation</h3>
                <p>
                  Due to the immutable nature of blockchain technology, <strong className="text-white">we cannot delete or modify content recorded on the Constellation Network</strong>. Even if we remove content from our interface or terminate your account, the blockchain record will persist indefinitely.
                </p>

                <h3 className="text-lg font-semibold text-purple-400 mb-3 mt-6">5.3 Reporting Violations</h3>
                <p>
                  If you believe content violates these Terms or applicable laws, report it to <span className="text-purple-400 font-mono">contact@prooflocker.io</span>. We will investigate and take appropriate action within a reasonable timeframe.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700/50 pb-2">6. Intellectual Property Rights</h2>

                <h3 className="text-lg font-semibold text-purple-400 mb-3 mt-6">6.1 ProofLocker Property</h3>
                <p>
                  ProofLocker and its original content, features, functionality, design, interface, graphics, code, and underlying technology are owned by ProofLocker and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. You may not reproduce, distribute, modify, create derivative works of, publicly display, or exploit any part of the Platform without our prior written permission.
                </p>

                <h3 className="text-lg font-semibold text-purple-400 mb-3 mt-6">6.2 Trademarks</h3>
                <p>
                  "ProofLocker" and associated logos, designs, and branding are trademarks owned by ProofLocker. Unauthorized use of these trademarks is strictly prohibited.
                </p>

                <h3 className="text-lg font-semibold text-purple-400 mb-3 mt-6">6.3 DMCA & Copyright Complaints</h3>
                <p>
                  If you believe your copyrighted work has been infringed, send a DMCA notice to <span className="text-purple-400 font-mono">contact@prooflocker.io</span> with: (1) description of copyrighted work, (2) location of infringing material, (3) your contact information, (4) statement of good faith belief, and (5) statement of accuracy under penalty of perjury with physical/electronic signature.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700/50 pb-2">7. Account Termination & Suspension</h2>
                <p className="mb-3">
                  We reserve the right to suspend, terminate, or restrict your access to ProofLocker at any time, with or without notice, for any reason or no reason, including but not limited to:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Violation of these Terms or our policies</li>
                  <li>Conduct harmful to other users, us, or third parties</li>
                  <li>Extended periods of inactivity</li>
                  <li>Legal or regulatory requirements</li>
                  <li>Fraudulent, abusive, or illegal activity</li>
                  <li>Our sole discretion for any reason</li>
                </ul>
                <p className="mt-3 text-sm">
                  Upon termination, your right to access ProofLocker immediately ceases. <strong className="text-white">Blockchain-recorded content will remain permanently accessible</strong> even after account termination. Termination does not waive any obligations or liabilities accrued prior to termination.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700/50 pb-2">8. Disclaimers & Limitations of Liability</h2>

                <h3 className="text-lg font-semibold text-purple-400 mb-3 mt-6">8.1 "AS IS" and "AS AVAILABLE" Basis</h3>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-sm text-amber-200">
                  <p className="font-semibold mb-2">⚠️ NO WARRANTIES</p>
                  <p>
                    PROOFLOCKER IS PROVIDED ON AN <strong>"AS IS"</strong> AND <strong>"AS AVAILABLE"</strong> BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-xs">
                    <li>Warranties of merchantability and fitness for a particular purpose</li>
                    <li>Warranties of non-infringement or title</li>
                    <li>Warranties regarding accuracy, reliability, or completeness of content</li>
                    <li>Warranties of uninterrupted, secure, or error-free operation</li>
                    <li>Warranties that defects will be corrected</li>
                  </ul>
                </div>

                <h3 className="text-lg font-semibold text-purple-400 mb-3 mt-6">8.2 Limitation of Liability</h3>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm text-red-200">
                  <p className="font-semibold mb-2">🚨 LIABILITY CAP</p>
                  <p>
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, PROOFLOCKER AND ITS OPERATORS, DIRECTORS, EMPLOYEES, AGENTS, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-xs">
                    <li>Loss of profits, revenue, data, or goodwill</li>
                    <li>Business interruption or loss of opportunity</li>
                    <li>Damages arising from use or inability to use the Platform</li>
                    <li>Damages from unauthorized access to your data</li>
                    <li>Damages from errors, omissions, or inaccuracies in content</li>
                    <li>Damages from blockchain immutability (permanent records)</li>
                  </ul>
                  <p className="mt-3 font-semibold">
                    IN NO EVENT SHALL OUR TOTAL LIABILITY EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR $100 USD, WHICHEVER IS GREATER.
                  </p>
                </div>

                <h3 className="text-lg font-semibold text-purple-400 mb-3 mt-6">8.3 Third-Party Services Disclaimer</h3>
                <p>
                  We are not responsible for the availability, accuracy, functionality, or reliability of third-party services, including Constellation Network's blockchain infrastructure, OSINT data sources, or external APIs. Service interruptions, blockchain delays, or third-party failures are beyond our control.
                </p>

                <h3 className="text-lg font-semibold text-purple-400 mb-3 mt-6">8.4 User Content Disclaimer</h3>
                <p>
                  We do not endorse, support, represent, or guarantee the completeness, truthfulness, accuracy, or reliability of any User Content. You rely on User Content at your own risk. We are not responsible for any errors, defamation, libel, or inaccuracies in User Content.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700/50 pb-2">9. Indemnification</h2>
                <p className="mb-3">
                  You agree to defend, indemnify, and hold harmless ProofLocker and its operators, officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any and all claims, damages, obligations, losses, liabilities, costs, debts, and expenses (including but not limited to attorney's fees) arising from:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
                  <li>Your use or misuse of ProofLocker</li>
                  <li>Your violation of these Terms</li>
                  <li>Your User Content, including blockchain submissions</li>
                  <li>Your violation of any third-party rights (intellectual property, privacy, etc.)</li>
                  <li>Your violation of any applicable laws or regulations</li>
                  <li>Any damage caused by your account or actions</li>
                </ul>
                <p className="mt-3 text-sm">
                  This indemnification obligation survives termination of these Terms and your use of ProofLocker.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700/50 pb-2">10. Dispute Resolution & Governing Law</h2>

                <h3 className="text-lg font-semibold text-purple-400 mb-3 mt-6">10.1 Governing Law</h3>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of the applicable jurisdiction, without regard to its conflict of law principles. You agree to submit to the personal and exclusive jurisdiction of the courts located within the applicable jurisdiction.
                </p>

                <h3 className="text-lg font-semibold text-purple-400 mb-3 mt-6">10.2 Arbitration Agreement</h3>
                <p>
                  Any dispute, controversy, or claim arising out of or relating to these Terms or your use of ProofLocker shall be resolved through binding arbitration rather than in court, except that you may assert claims in small claims court if they qualify. Arbitration shall be conducted by a single arbitrator under the rules of a recognized arbitration body.
                </p>

                <h3 className="text-lg font-semibold text-purple-400 mb-3 mt-6">10.3 Class Action Waiver</h3>
                <p>
                  <strong className="text-white">YOU AND PROOFLOCKER AGREE THAT DISPUTES WILL BE RESOLVED ONLY ON AN INDIVIDUAL BASIS AND NOT IN A CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION.</strong> You waive the right to participate in any class action or class arbitration.
                </p>

                <h3 className="text-lg font-semibold text-purple-400 mb-3 mt-6">10.4 Informal Resolution First</h3>
                <p>
                  Before initiating arbitration or legal action, you agree to first contact us at <span className="text-purple-400 font-mono">contact@prooflocker.io</span> to attempt informal resolution of the dispute.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700/50 pb-2">11. General Provisions</h2>

                <h3 className="text-lg font-semibold text-purple-400 mb-3 mt-6">11.1 Entire Agreement</h3>
                <p>
                  These Terms, together with our Privacy Policy and any other policies referenced herein, constitute the entire agreement between you and ProofLocker regarding use of the Platform and supersede all prior agreements and understandings.
                </p>

                <h3 className="text-lg font-semibold text-purple-400 mb-3 mt-6">11.2 Severability</h3>
                <p>
                  If any provision of these Terms is found to be unenforceable or invalid by a court of competent jurisdiction, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
                </p>

                <h3 className="text-lg font-semibold text-purple-400 mb-3 mt-6">11.3 Waiver</h3>
                <p>
                  Our failure to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision. Any waiver must be in writing and signed by an authorized representative.
                </p>

                <h3 className="text-lg font-semibold text-purple-400 mb-3 mt-6">11.4 Assignment</h3>
                <p>
                  You may not assign or transfer these Terms or your rights hereunder without our prior written consent. We may assign these Terms without restriction. Any attempted assignment in violation of this provision is void.
                </p>

                <h3 className="text-lg font-semibold text-purple-400 mb-3 mt-6">11.5 Force Majeure</h3>
                <p>
                  We shall not be liable for any failure or delay in performance due to events beyond our reasonable control, including but not limited to acts of God, natural disasters, war, terrorism, riots, embargoes, acts of civil or military authorities, fire, floods, accidents, network infrastructure failures, strikes, or shortages of transportation, facilities, fuel, energy, labor, or materials.
                </p>

                <h3 className="text-lg font-semibold text-purple-400 mb-3 mt-6">11.6 Survival</h3>
                <p>
                  Sections regarding User Content licenses, intellectual property, disclaimers, limitations of liability, indemnification, dispute resolution, and any other provisions that by their nature should survive shall survive termination of these Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700/50 pb-2">12. Changes to Terms</h2>
                <p>
                  We reserve the right to modify, amend, or update these Terms at any time at our sole discretion. Changes will be effective immediately upon posting to this page with an updated "Effective Date" at the top. Material changes may be announced via the platform interface, email notification (if provided), or prominent notice on the website.
                </p>
                <p className="mt-3">
                  <strong className="text-white">Your continued use of ProofLocker after changes constitutes acceptance of the revised Terms.</strong> If you do not agree to the modified Terms, you must immediately cease use of the Platform. We encourage you to review this page periodically.
                </p>
              </section>

              <section className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-4">13. Contact Information</h2>
                <p className="mb-4">
                  For questions, concerns, feedback, or legal notices regarding these Terms of Service, please contact us:
                </p>
                <div className="space-y-2 text-sm font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">📧 General:</span>
                    <span className="text-purple-400">contact@prooflocker.io</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">⚖️ Legal:</span>
                    <span className="text-purple-400">contact@prooflocker.io</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">🚨 Abuse:</span>
                    <span className="text-purple-400">contact@prooflocker.io</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">©️ DMCA:</span>
                    <span className="text-purple-400">contact@prooflocker.io</span>
                  </div>
                </div>
                <p className="mt-4 text-xs text-slate-400">
                  We aim to respond to all inquiries within 5-7 business days. For urgent legal matters, please mark your communication as "URGENT" in the subject line.
                </p>
              </section>

              <div className="border-t border-slate-700/50 pt-6 mt-8 text-center text-xs text-slate-500">
                <p>ProofLocker Terms of Service v2.0 • Effective February 10, 2026</p>
                <p className="mt-1">Independent platform utilizing Constellation Network blockchain technology</p>
                <p className="mt-2 text-amber-400">
                  ⚠️ By using ProofLocker, you acknowledge that blockchain submissions are permanent and cannot be deleted
                </p>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
