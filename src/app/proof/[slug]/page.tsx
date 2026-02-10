import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getPredictionBySlug as _getPredictionBySlug, type Prediction } from "@/lib/storage";
import { getDigitalEvidenceFingerprintUrl } from "@/lib/digitalEvidence";
import { getSiteUrl, getAbsoluteUrl } from "@/lib/config";
import OutcomeBadge from "@/components/OutcomeBadge";
import OnChainBadge from "@/components/OnChainBadge";
import CopyButton from "@/components/CopyButton";
import EvidenceGradeBadge from "@/components/EvidenceGradeBadge";
import EvidenceList from "@/components/EvidenceList";
import EvidenceScoreMeter from "@/components/EvidenceScoreMeter";
import { LEGACY_GRADE_SCORES } from "@/lib/evidence-scoring";

// Cache the prediction fetch to avoid duplicate queries
const getPredictionBySlug = cache(_getPredictionBySlug);

// Make this a dynamic page
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const prediction = await getPredictionBySlug(slug);

  if (!prediction || prediction.moderationStatus === "hidden") {
    return {
      title: "Proof Not Found - ProofLocker",
    };
  }

  const lockedDate = new Date(prediction.timestamp);
  const dateStr = lockedDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }) + " UTC";

  const previewText = prediction.text.length > 100
    ? prediction.text.substring(0, 97) + "..."
    : prediction.text;

  const shortProofId = prediction.proofId.substring(0, 8);

  const title = `${previewText} | ProofLocker`;
  const description = `Locked on ${dateStr} • Proof ${shortProofId} • Immutable timestamp proof on Constellation Network`;
  const pageUrl = getAbsoluteUrl(`/proof/${slug}`);

  return {
    title,
    description,
    openGraph: {
      title: "ProofLocker - Immutable Claim Proof",
      description: `Locked ${dateStr} • Proof ${shortProofId}`,
      url: pageUrl,
      type: "website",
      siteName: "ProofLocker",
    },
    twitter: {
      card: "summary_large_image",
      title: "ProofLocker - Immutable Claim Proof",
      description: `Locked ${dateStr} • Proof ${shortProofId}`,
    },
  };
}

export default async function ProofPage({ params }: Props) {
  const { slug } = await params;
  const prediction = await getPredictionBySlug(slug);

  if (!prediction) {
    notFound();
  }

  // If hidden, show removal message
  if (prediction.moderationStatus === "hidden") {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center glass border border-white/10 rounded-xl p-8">
          <h2 className="text-xl font-semibold text-white mb-2">Content Removed</h2>
          <p className="text-neutral-400 mb-6 text-sm">
            This proof has been removed for violating the rules.
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2 bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-lg transition-all"
          >
            Return to ProofLocker
          </Link>
        </div>
      </div>
    );
  }

  const lockedDate = new Date(prediction.timestamp);
  const isResolved = prediction.outcome === "correct" || prediction.outcome === "incorrect";
  const explorerUrl = prediction.deReference
    ? getDigitalEvidenceFingerprintUrl(prediction.deReference)
    : null;
  const resolutionExplorerUrl = prediction.resolutionDeReference
    ? getDigitalEvidenceFingerprintUrl(prediction.resolutionDeReference)
    : null;

  return (
    <div className="min-h-screen gradient-bg text-white relative pb-20 md:pb-0">
      {/* Decorative gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Header with back button */}
        <div className="mb-8">
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700/60 hover:border-slate-600/60 transition-all text-sm font-medium group backdrop-blur-sm"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to feed
          </Link>
        </div>

        {/* Hero Card - Prediction */}
        <div className="glass border border-white/10 rounded-2xl overflow-hidden mb-6 shadow-2xl transition-all duration-300 hover:shadow-[0_0_40px_rgba(168,85,247,0.15)] hover:border-purple-500/20">
          {/* Outcome accent bar */}
          {prediction.outcome === "correct" && (
            <div className="h-1 bg-gradient-to-r from-green-500 via-emerald-400 to-green-500" />
          )}
          {prediction.outcome === "incorrect" && (
            <div className="h-1 bg-gradient-to-r from-red-500 via-rose-400 to-red-500" />
          )}
          <div className="p-6 md:p-8 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Claim</span>
                  {prediction.onChainStatus === 'confirmed' && (
                    <OnChainBadge variant="full" />
                  )}
                  <div className="h-px flex-1 bg-gradient-to-r from-blue-500/30 to-transparent"></div>
                </div>
                <h1 className="text-2xl md:text-3xl leading-relaxed text-white font-semibold break-words">
                  {prediction.text}
                </h1>
              </div>

              {/* Badges */}
              <div className="flex md:flex-col gap-2 flex-wrap md:flex-nowrap">
                <OutcomeBadge outcome={prediction.outcome} size="md" showLabel="long" />
                {isResolved && prediction.evidenceGrade && (
                  <EvidenceScoreMeter
                    score={LEGACY_GRADE_SCORES[prediction.evidenceGrade as keyof typeof LEGACY_GRADE_SCORES] || 0}
                    tier={
                      prediction.evidenceGrade === 'A' ? 'strong' :
                      prediction.evidenceGrade === 'B' ? 'solid' :
                      prediction.evidenceGrade === 'C' ? 'basic' : 'unverified'
                    }
                    breakdown={[]}
                    variant="compact"
                  />
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-b border-slate-700/30 mt-6 mb-6" />

            {/* Quick Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="text-xs text-neutral-400 mb-1">Locked</div>
                <div className="text-sm font-medium text-white">
                  {lockedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </div>
              </div>

              {isResolved && prediction.resolvedAt && (
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-xs text-neutral-400 mb-1">Resolved</div>
                  <div className="text-sm font-medium text-white">
                    {new Date(prediction.resolvedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </div>
              )}

              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="text-xs text-neutral-400 mb-1">Network</div>
                <div className="text-sm font-medium text-white">Constellation</div>
              </div>

              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="text-xs text-neutral-400 mb-1">Author</div>
                <Link
                  href={`/user/${prediction.userId || prediction.anonId}`}
                  className="text-sm font-medium text-white hover:text-[#2E5CFF] transition-colors"
                >
                  Anon #{prediction.authorNumber}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Resolution & Evidence */}
        {isResolved && prediction.resolvedAt && (
          <div className="glass border border-white/10 rounded-2xl overflow-hidden mb-6 shadow-xl">
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Resolution & Evidence</h2>
                  <p className="text-xs text-neutral-400">How this claim was verified</p>
                </div>
              </div>

              <EvidenceList
                predictionId={prediction.id}
                evidenceSummary={prediction.evidenceSummary}
                resolutionFingerprint={prediction.resolutionFingerprint}
                legacyResolutionUrl={prediction.resolutionUrl}
                legacyResolutionNote={prediction.resolutionNote}
              />
            </div>
          </div>
        )}

        {/* On-Chain Proof Timeline */}
        <div className="space-y-6">
          {/* Step 1: Prediction Locked */}
          {prediction.onChainStatus === "confirmed" && prediction.deReference && (
            <div className="glass border border-cyan-500/10 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] hover:border-cyan-500/20">
              {/* Teal accent bar */}
              <div className="h-0.5 bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />
              <div className="p-6 md:p-8">
                {/* Step Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30">
                    <span className="text-lg font-bold text-cyan-400">1</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">Claim Locked</h3>
                    <p className="text-sm text-neutral-400">Only cryptographic hashes are stored on-chain</p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                    <span className="text-xs font-semibold text-cyan-400">Verified</span>
                  </div>
                </div>

                {/* Trust Features */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                    <svg className="w-6 h-6 text-cyan-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <div className="text-xs font-medium text-white">Immutable</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                    <svg className="w-6 h-6 text-cyan-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-xs font-medium text-white">Timestamped</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                    <svg className="w-6 h-6 text-cyan-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <div className="text-xs font-medium text-white">SHA-256</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                    <svg className="w-6 h-6 text-cyan-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-xs font-medium text-white">Verifiable</div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-b border-slate-700/30 mb-6" />

                {/* Transaction Details */}
                <div className="space-y-3">
                  <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                    <div className="text-xs text-neutral-400 mb-2">Timestamp</div>
                    <div className="text-sm text-white font-medium">
                      {lockedDate.toLocaleString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "UTC",
                      })} UTC
                    </div>
                  </div>

                  <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/30">
                    <div className="text-xs text-neutral-400 mb-2">Transaction Hash</div>
                    <div className="flex items-center gap-2">
                      {explorerUrl ? (
                        <a
                          href={explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-cyan-400 hover:text-cyan-300 break-all underline decoration-cyan-500/30 flex-1"
                        >
                          {prediction.deReference}
                        </a>
                      ) : (
                        <div className="font-mono text-xs text-slate-400 break-all flex-1">
                          {prediction.deReference}
                        </div>
                      )}
                      <CopyButton text={prediction.deReference || ""} iconSize="sm" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Prediction Resolved */}
          {isResolved && prediction.resolvedAt && (
            <div className="glass border border-cyan-500/10 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] hover:border-cyan-500/20">
              {/* Teal accent bar */}
              <div className="h-0.5 bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />
              <div className="p-6 md:p-8">
                {/* Step Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30">
                    <span className="text-lg font-bold text-cyan-400">2</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">Claim Resolved</h3>
                    <p className="text-sm text-neutral-400">Resolution hash recorded on-chain</p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                    <span className="text-xs font-semibold text-cyan-400">Verified</span>
                  </div>
                </div>

                {/* Resolution Features */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className={`p-4 bg-white/5 rounded-xl border text-center ${
                    prediction.outcome === "correct"
                      ? "border-green-500/30 bg-green-500/5"
                      : "border-red-500/30 bg-red-500/5"
                  }`}>
                    <svg className={`w-6 h-6 mx-auto mb-2 ${
                      prediction.outcome === "correct" ? "text-green-400" : "text-red-400"
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {prediction.outcome === "correct" ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      )}
                    </svg>
                    <div className="text-xs font-medium text-white">
                      {prediction.outcome === "correct" ? "Correct" : "Incorrect"}
                    </div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                    <svg className="w-6 h-6 text-green-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-xs font-medium text-white">Timestamped</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                    <svg className="w-6 h-6 text-green-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-xs font-medium text-white">Immutable</div>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="space-y-3">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-xs text-neutral-400 mb-2">Resolution Timestamp</div>
                    <div className="text-sm text-white font-medium">
                      {new Date(prediction.resolvedAt).toLocaleString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "UTC",
                      })} UTC
                    </div>
                  </div>

                  {prediction.resolutionDeReference && (
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="text-xs text-neutral-400 mb-2">Resolution Transaction Hash</div>
                      <div className="flex items-center gap-2">
                        {resolutionExplorerUrl ? (
                          <a
                            href={resolutionExplorerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:text-blue-300 font-mono break-all underline flex-1"
                          >
                            {prediction.resolutionDeReference}
                          </a>
                        ) : (
                          <div className="text-xs text-neutral-300 font-mono break-all flex-1">
                            {prediction.resolutionDeReference}
                          </div>
                        )}
                        <CopyButton text={prediction.resolutionDeReference} iconSize="sm" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-neutral-500 mb-4">
            This claim is immutable and cannot be edited
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            Explore more claims
          </Link>
        </div>
      </div>
    </div>
  );
}
