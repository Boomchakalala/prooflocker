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

  return (
    <div className="min-h-screen gradient-bg text-white relative">
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
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to feed
          </Link>
        </div>

        {/* Main card container */}
        <div className="glass border border-white/10 rounded-2xl overflow-hidden">
          {/* Prediction statement - Hero section */}
          <div className="p-8 md:p-10 border-b border-white/10 bg-gradient-to-br from-white/5 to-transparent">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="text-sm text-neutral-500 mb-2">Prediction</div>
                <h1 className="text-2xl md:text-3xl leading-relaxed text-white font-medium">
                  {prediction.text}
                </h1>
              </div>
            </div>

            {/* Outcome badge */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="text-xs text-neutral-500 uppercase tracking-wide">Status</div>
              <OutcomeBadge outcome={prediction.outcome} size="lg" showLabel="long" />
            </div>
          </div>

          {/* Key details section */}
          <div className="p-8 md:p-10 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white mb-6">Proof Details</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Locked timestamp */}
              <div className="glass border border-white/10 rounded-lg p-4">
                <div className="text-xs text-neutral-500 uppercase tracking-wide mb-2">Locked On</div>
                <div className="text-white font-medium">
                  {lockedDate.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "UTC",
                  })}
                </div>
                <div className="text-sm text-neutral-400 font-mono mt-1">
                  {lockedDate.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "UTC",
                  })} UTC
                </div>
              </div>

              {/* Resolved timestamp */}
              {isResolved && prediction.resolvedAt && (
                <div className="glass border border-white/10 rounded-lg p-4">
                  <div className="text-xs text-neutral-500 uppercase tracking-wide mb-2">Resolved On</div>
                  <div className="text-white font-medium">
                    {new Date(prediction.resolvedAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      timeZone: "UTC",
                    })}
                  </div>
                  <div className="text-sm text-neutral-400 font-mono mt-1">
                    {new Date(prediction.resolvedAt).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "UTC",
                    })} UTC
                  </div>
                </div>
              )}

              {/* Network status */}
              <div className="glass border border-white/10 rounded-lg p-4">
                <div className="text-xs text-neutral-500 uppercase tracking-wide mb-2">Network</div>
                <div className="flex items-center gap-2">
                  <div
                    className={`px-3 py-1.5 border rounded-full text-xs font-medium ${
                      prediction.onChainStatus === "confirmed"
                        ? "bg-green-500/10 text-green-400 border-green-500/30"
                        : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                    }`}
                  >
                    {prediction.onChainStatus === "confirmed" ? "Confirmed" : "Pending"}
                  </div>
                </div>
                <div className="text-sm text-neutral-400 mt-2">Constellation Network</div>
              </div>

              {/* Author */}
              <div className="glass border border-white/10 rounded-lg p-4">
                <div className="text-xs text-neutral-500 uppercase tracking-wide mb-2">Author</div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    #{prediction.authorNumber}
                  </div>
                  <div>
                    <div className="text-white font-medium">Anon #{prediction.authorNumber}</div>
                    {prediction.userId && (
                      <div className="text-xs text-cyan-400">Claimed</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resolution notes */}
          {isResolved && prediction.resolutionNote && (
            <div className="p-8 md:p-10 border-b border-white/10 bg-white/5">
              <h2 className="text-lg font-semibold text-white mb-4">Resolution Summary</h2>
              <div className="glass border border-white/10 rounded-lg p-5">
                <p className="text-neutral-200 leading-relaxed mb-3">
                  {prediction.resolutionNote}
                </p>
                {prediction.resolutionUrl && (
                  <a
                    href={prediction.resolutionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 underline"
                  >
                    View evidence
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* On-Chain Proof Section 1: Prediction Locked */}
          {prediction.onChainStatus === "confirmed" && prediction.deReference && (
            <div className="p-8 md:p-10 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white mb-2">On-Chain Proof — Prediction Locked</h2>
              <p className="text-sm text-neutral-400 mb-6">This prediction was permanently locked on the blockchain</p>

              {/* Trust badges */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="glass border border-purple-500/20 rounded-lg p-3 text-center">
                  <svg className="w-5 h-5 text-purple-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <div className="text-xs text-neutral-300">Immutable</div>
                </div>
                <div className="glass border border-purple-500/20 rounded-lg p-3 text-center">
                  <svg className="w-5 h-5 text-purple-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-xs text-neutral-300">Timestamped</div>
                </div>
                <div className="glass border border-purple-500/20 rounded-lg p-3 text-center">
                  <svg className="w-5 h-5 text-purple-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <div className="text-xs text-neutral-300">SHA-256</div>
                </div>
                <div className="glass border border-purple-500/20 rounded-lg p-3 text-center">
                  <svg className="w-5 h-5 text-purple-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-xs text-neutral-300">Verifiable</div>
                </div>
              </div>

              {/* Lock transaction details */}
              <div className="space-y-4">
                {/* Lock timestamp */}
                <div className="glass border border-white/10 rounded-lg p-4">
                  <div className="text-xs text-neutral-500 uppercase tracking-wide mb-2">Lock Timestamp</div>
                  <div className="text-sm text-neutral-300">
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
                <div className="glass border border-white/10 rounded-lg p-4">
                  <div className="text-xs text-neutral-500 uppercase tracking-wide mb-2">Lock Transaction Hash</div>
                  <div className="flex items-start gap-2">
                    {explorerUrl ? (
                      <a
                        href={explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-cyan-400 hover:text-cyan-300 font-mono break-all underline flex-1"
                      >
                        {prediction.deReference}
                      </a>
                    ) : (
                      <div className="text-sm text-neutral-300 font-mono break-all flex-1">
                        {prediction.deReference}
                      </div>
                    )}
                    <CopyButton text={prediction.deReference || ""} iconSize="sm" />
                  </div>
                </div>

                {/* Content hash */}
                <div className="glass border border-white/10 rounded-lg p-4">
                  <div className="text-xs text-neutral-500 uppercase tracking-wide mb-2">Content Hash (SHA-256)</div>
                  <div className="flex items-start gap-2">
                    <code className="text-xs text-neutral-300 font-mono break-all flex-1">
                      {prediction.hash}
                    </code>
                    <CopyButton text={prediction.hash} iconSize="sm" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* On-Chain Proof Section 2: Prediction Resolved (only if resolved) */}
          {isResolved && prediction.resolvedAt && (
            <div className="p-8 md:p-10">
              <h2 className="text-lg font-semibold text-white mb-2">On-Chain Proof — Prediction Resolved</h2>
              <p className="text-sm text-neutral-400 mb-6">This prediction outcome was permanently recorded on the blockchain</p>

              {/* Resolved trust badges */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                <div className={`glass rounded-lg p-3 text-center ${
                  prediction.outcome === "correct"
                    ? "border border-green-500/20"
                    : "border border-red-500/20"
                }`}>
                  <svg className={`w-5 h-5 mx-auto mb-1 ${
                    prediction.outcome === "correct" ? "text-green-400" : "text-red-400"
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {prediction.outcome === "correct" ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                  <div className="text-xs text-neutral-300">{prediction.outcome === "correct" ? "Correct" : "Incorrect"}</div>
                </div>
                <div className="glass border border-green-500/20 rounded-lg p-3 text-center">
                  <svg className="w-5 h-5 text-green-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-xs text-neutral-300">Timestamped</div>
                </div>
                <div className="glass border border-green-500/20 rounded-lg p-3 text-center">
                  <svg className="w-5 h-5 text-green-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-xs text-neutral-300">Immutable</div>
                </div>
              </div>

              {/* Resolution details */}
              <div className="space-y-4">
                {/* Resolved timestamp */}
                <div className="glass border border-white/10 rounded-lg p-4">
                  <div className="text-xs text-neutral-500 uppercase tracking-wide mb-2">Resolution Timestamp</div>
                  <div className="text-sm text-neutral-300">
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
                  <div className="glass border border-white/10 rounded-lg p-4">
                    <div className="text-xs text-neutral-500 uppercase tracking-wide mb-2">Resolution Transaction Hash</div>
                    <div className="flex items-start gap-2">
                      <div className="text-sm text-neutral-300 font-mono break-all flex-1">
                        {prediction.resolutionDeReference}
                      </div>
                      <CopyButton text={prediction.resolutionDeReference} iconSize="sm" />
                    </div>
                  </div>
                )}

                {/* Outcome */}
                <div className="glass border border-white/10 rounded-lg p-4">
                  <div className="text-xs text-neutral-500 uppercase tracking-wide mb-2">Final Outcome</div>
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium ${
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
        <div className="mt-12 text-center">
          <p className="text-sm text-neutral-500 mb-4">
            This prediction is immutable and cannot be edited
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-lg transition-all"
          >
            Explore more predictions
          </Link>
        </div>
      </div>
    </div>
  );
}
