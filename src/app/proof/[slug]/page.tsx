import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getPredictionBySlug as _getPredictionBySlug, type Prediction } from "@/lib/storage";
import { getDigitalEvidenceFingerprintUrl } from "@/lib/digitalEvidence";
import { getSiteUrl, getAbsoluteUrl } from "@/lib/config";
import OutcomeBadge from "@/components/OutcomeBadge";
import CopyButton from "@/components/CopyButton";

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
  const ogImageUrl = getAbsoluteUrl(`/proof/${slug}/opengraph-image`);

  return {
    title,
    description,
    openGraph: {
      title: previewText,
      description: `Locked on ${dateStr} • Proof ${shortProofId}`,
      url: pageUrl,
      type: "website",
      siteName: "ProofLocker",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "ProofLocker - Time-stamped prediction proofs",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: previewText,
      description: `Locked on ${dateStr} • Proof ${shortProofId}`,
      images: [ogImageUrl],
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

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-6 md:py-12">
        {/* Header with back button */}
        <div className="mb-6 md:mb-8">
          <Link
            href="/app"
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to feed
          </Link>
        </div>

        {/* Main card container */}
        <div className="glass border border-white/10 rounded-xl md:rounded-2xl overflow-hidden">
          {/* Prediction statement - Hero section */}
          {/* Polish: Reduced top padding (8→6) for tighter hierarchy, aligned title+status on same row */}
          <div className="p-4 md:p-6 border-b border-white/10 bg-gradient-to-br from-white/5 to-transparent">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-3 md:mb-4">
              <div className="min-w-0 flex-1">
                <div className="text-xs text-neutral-500 mb-2 md:mb-3 uppercase tracking-wide">Prediction</div>
                <h1 className="text-xl md:text-2xl leading-relaxed text-white font-medium break-words">
                  {prediction.text}
                </h1>
              </div>
              {/* Polish: Status badge right-aligned, reduced visual weight */}
              <div className="shrink-0 self-start sm:self-auto">
                <OutcomeBadge outcome={prediction.outcome} size="sm" showLabel="long" />
              </div>
            </div>
          </div>

          {/* Key details section */}
          <div className="p-4 md:p-6 border-b border-white/10">
            <h2 className="text-base md:text-lg font-semibold text-white mb-4 md:mb-5">Proof Details</h2>

            {/* Timeline - Locked and Resolved dates */}
            <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 md:gap-4 mb-4">
              {/* Locked timestamp */}
              <div className="glass border border-white/10 rounded-xl p-4 md:p-5 bg-gradient-to-br from-white/[0.03] to-transparent hover:border-white/20 transition-all">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-neutral-400 uppercase tracking-wider mb-1.5">Locked On</div>
                    <div className="text-white font-semibold text-base md:text-lg">
                      {lockedDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        timeZone: "UTC",
                      })}
                    </div>
                    <div className="text-xs text-neutral-400 font-mono mt-1">
                      {lockedDate.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "UTC",
                      })} UTC
                    </div>
                  </div>
                </div>
              </div>

              {/* Resolved timestamp */}
              {isResolved && prediction.resolvedAt ? (
                <div className="glass border border-white/10 rounded-xl p-4 md:p-5 bg-gradient-to-br from-white/[0.03] to-transparent hover:border-white/20 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-neutral-400 uppercase tracking-wider mb-1.5">Resolved On</div>
                      <div className="text-white font-semibold text-base md:text-lg">
                        {new Date(prediction.resolvedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          timeZone: "UTC",
                        })}
                      </div>
                      <div className="text-xs text-neutral-400 font-mono mt-1">
                        {new Date(prediction.resolvedAt).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "UTC",
                        })} UTC
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass border border-white/10 rounded-xl p-4 md:p-5 bg-gradient-to-br from-white/[0.02] to-transparent opacity-50">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-neutral-500/10 border border-neutral-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-neutral-400 uppercase tracking-wider mb-1.5">Resolved On</div>
                      <div className="text-neutral-500 font-medium text-base italic">
                        Not resolved yet
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Network and Author */}
            <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
              {/* Network status */}
              <div className="glass border border-white/10 rounded-xl p-4 md:p-5 bg-gradient-to-br from-white/[0.03] to-transparent hover:border-white/20 transition-all">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="text-xs text-neutral-400 uppercase tracking-wider">Network</div>
                      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${
                        prediction.onChainStatus === "confirmed"
                          ? "bg-green-500/10 border border-green-500/20"
                          : "bg-yellow-500/10 border border-yellow-500/20"
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          prediction.onChainStatus === "confirmed"
                            ? "bg-green-400"
                            : "bg-yellow-400 animate-pulse"
                        }`} />
                        <span className={`text-[10px] font-semibold uppercase tracking-wide ${
                          prediction.onChainStatus === "confirmed"
                            ? "text-green-400"
                            : "text-yellow-400"
                        }`}>
                          {prediction.onChainStatus === "confirmed" ? "Confirmed" : "Pending"}
                        </span>
                      </div>
                    </div>
                    <div className="text-white font-semibold text-base md:text-lg">
                      Constellation DAG
                    </div>
                  </div>
                </div>
              </div>

              {/* Author */}
              <div className="glass border border-white/10 rounded-xl p-4 md:p-5 bg-gradient-to-br from-white/[0.03] to-transparent hover:border-white/20 transition-all">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-cyan-500/20">
                    {prediction.authorNumber.toString().slice(-2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="text-xs text-neutral-400 uppercase tracking-wider">Author</div>
                      {prediction.userId && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                          <svg className="w-3 h-3 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wide">Claimed</span>
                        </div>
                      )}
                    </div>
                    <div className="text-white font-semibold text-base md:text-lg">
                      Anon #{prediction.authorNumber}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resolution notes */}
          {/* Polish: Added verdict authority with icon accent, improved copy clarity */}
          {isResolved && prediction.resolutionNote && (
            <div className="p-4 md:p-6 border-b border-white/10 bg-white/[0.02]">
              <h2 className="text-base font-semibold text-white mb-3 md:mb-4">Resolution Summary</h2>
              <div className="glass border border-white/10 rounded-lg p-4 md:p-5">
                <div className="flex gap-2 md:gap-3">
                  {/* Verdict icon anchor */}
                  <div className={`flex-shrink-0 w-4 h-4 md:w-5 md:h-5 mt-0.5 ${
                    prediction.outcome === "correct" ? "text-green-400" : "text-neutral-300"
                  }`}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-neutral-200 text-sm md:text-base leading-relaxed mb-3 break-words">
                      {prediction.resolutionNote}
                    </p>
                    {prediction.resolutionUrl && (
                      <a
                        href={prediction.resolutionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 underline font-medium break-all"
                      >
                        <span className="flex-shrink-0">View evidence</span>
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* On-Chain Proof Section 1: Prediction Locked */}
          {/* Polish: Added step label, unified icon system (all outlined), consistent spacing */}
          {prediction.onChainStatus === "confirmed" && prediction.deReference && (
            <div className="p-4 md:p-6 border-b border-white/10">
              <div className="text-[10px] text-purple-400 font-medium uppercase tracking-wider mb-1">Step 1</div>
              <h2 className="text-base font-semibold text-white mb-1">Prediction Locked</h2>
              <p className="text-xs text-neutral-400 mb-4 md:mb-5">This prediction was permanently locked on the blockchain</p>

              {/* Trust badges - Polish: Unified icon system, consistent size/stroke */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-3">
                <div className="glass border border-purple-500/20 rounded-lg p-2.5 md:p-3 text-center">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-purple-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <div className="text-[10px] text-neutral-300 font-medium">Immutable</div>
                </div>
                <div className="glass border border-purple-500/20 rounded-lg p-2.5 md:p-3 text-center">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-purple-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-[10px] text-neutral-300 font-medium">Timestamped</div>
                </div>
                <div className="glass border border-purple-500/20 rounded-lg p-2.5 md:p-3 text-center">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-purple-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <div className="text-[10px] text-neutral-300 font-medium">SHA-256</div>
                </div>
                <div className="glass border border-purple-500/20 rounded-lg p-2.5 md:p-3 text-center">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-purple-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-[10px] text-neutral-300 font-medium">Verifiable</div>
                </div>
              </div>

              {/* SHA-256 explanation - UX polish: explains the cryptographic guarantee without cluttering the UI with raw hashes */}
              <p className="text-[10px] text-neutral-500 mb-4 md:mb-5 leading-relaxed">
                Prediction content was hashed using SHA-256 before being locked on-chain.
              </p>

              {/* Lock transaction details */}
              <div className="space-y-2.5 md:space-y-3">
                {/* Lock timestamp */}
                <div className="glass border border-white/10 rounded-lg p-3 md:p-4">
                  <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-2">Lock Timestamp</div>
                  <div className="text-xs md:text-sm text-neutral-300">
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

                {/* Lock transaction hash */}
                <div className="glass border border-white/10 rounded-lg p-3 md:p-4">
                  <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-2">Lock Transaction Hash</div>
                  <div className="flex items-start gap-2">
                    {explorerUrl ? (
                      <a
                        href={explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] md:text-xs text-cyan-400 hover:text-cyan-300 font-mono break-all underline flex-1 min-w-0"
                      >
                        {prediction.deReference}
                      </a>
                    ) : (
                      <div className="text-[11px] md:text-xs text-neutral-300 font-mono break-all flex-1 min-w-0">
                        {prediction.deReference}
                      </div>
                    )}
                    <CopyButton text={prediction.deReference || ""} iconSize="sm" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* On-Chain Proof Section 2: Prediction Resolved (only if resolved) */}
          {/* Polish: Added step label, unified icon system matching Step 1, reduced gap from previous section */}
          {isResolved && prediction.resolvedAt && (
            <div className="p-4 md:p-6">
              <div className="text-[10px] text-green-400 font-medium uppercase tracking-wider mb-1">Step 2</div>
              <h2 className="text-base font-semibold text-white mb-1">Prediction Resolved</h2>
              <p className="text-xs text-neutral-400 mb-4 md:mb-5">This prediction outcome was permanently recorded on the blockchain</p>

              {/* Resolved trust badges - Polish: Unified with Step 1 layout */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mb-4 md:mb-5">
                <div className={`glass rounded-lg p-2.5 md:p-3 text-center ${
                  prediction.outcome === "correct"
                    ? "border border-green-500/20"
                    : "border border-red-500/20"
                }`}>
                  <svg className={`w-4 h-4 md:w-5 md:h-5 mx-auto mb-1 ${
                    prediction.outcome === "correct" ? "text-green-400" : "text-red-400"
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    {prediction.outcome === "correct" ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                  <div className="text-[10px] text-neutral-300 font-medium">{prediction.outcome === "correct" ? "Correct" : "Incorrect"}</div>
                </div>
                <div className="glass border border-green-500/20 rounded-lg p-2.5 md:p-3 text-center">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-green-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-[10px] text-neutral-300 font-medium">Timestamped</div>
                </div>
                <div className="glass border border-green-500/20 rounded-lg p-2.5 md:p-3 text-center">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-green-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-[10px] text-neutral-300 font-medium">Immutable</div>
                </div>
              </div>

              {/* Resolution details */}
              <div className="space-y-2.5 md:space-y-3">
                {/* Resolved timestamp */}
                <div className="glass border border-white/10 rounded-lg p-3 md:p-4">
                  <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-2">Resolution Timestamp</div>
                  <div className="text-xs md:text-sm text-neutral-300">
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

                {/* Resolution transaction hash (if available) */}
                {prediction.resolutionDeReference && (
                  <div className="glass border border-white/10 rounded-lg p-3 md:p-4">
                    <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-2">Resolution Transaction Hash</div>
                    <div className="flex items-start gap-2">
                      {resolutionExplorerUrl ? (
                        <a
                          href={resolutionExplorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] md:text-xs text-cyan-400 hover:text-cyan-300 font-mono break-all underline flex-1 min-w-0"
                        >
                          {prediction.resolutionDeReference}
                        </a>
                      ) : (
                        <div className="text-[11px] md:text-xs text-neutral-300 font-mono break-all flex-1 min-w-0">
                          {prediction.resolutionDeReference}
                        </div>
                      )}
                      <CopyButton text={prediction.resolutionDeReference} iconSize="sm" />
                    </div>
                  </div>
                )}

                {/* Outcome */}
                <div className="glass border border-white/10 rounded-lg p-3 md:p-4">
                  <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-2">Final Outcome</div>
                  <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg font-medium text-xs ${
                    prediction.outcome === "correct"
                      ? "bg-green-500/10 text-green-400 border border-green-500/30"
                      : "bg-red-500/10 text-red-400 border border-red-500/30"
                  }`}>
                    {prediction.outcome === "correct" ? "Correct" : "Incorrect"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {/* Polish: Consistent spacing (mt-8 matches 16px unit system) */}
        <div className="mt-6 md:mt-8 text-center pb-safe">
          <p className="text-xs text-neutral-500 mb-3 md:mb-4">
            This prediction is immutable and cannot be edited
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-lg transition-all text-sm"
          >
            Explore more predictions
          </Link>
        </div>
      </div>
    </div>
  );
}
