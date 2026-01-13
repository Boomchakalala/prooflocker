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
// When both generateMetadata() and the component call this with the same slug,
// it will only execute once
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

  // Format date for share card
  const lockedDate = new Date(prediction.timestamp);
  const dateStr = lockedDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }) + " UTC";

  // Shorten text for preview (max ~100 chars for social cards)
  const previewText = prediction.text.length > 100
    ? prediction.text.substring(0, 97) + "..."
    : prediction.text;

  // Shortened proof ID (first 8 chars)
  const shortProofId = prediction.proofId.substring(0, 8);

  const title = `${previewText} | ProofLocker`;
  const description = `Locked on ${dateStr} • Proof ${shortProofId} • Immutable timestamp proof on Constellation Network`;
  const pageUrl = getAbsoluteUrl(`/proof/${slug}`);

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
          url: getAbsoluteUrl("/og.png"),
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
      images: [getAbsoluteUrl("/og.png")],
    },
  };
}

function getOutcomeLabel(outcome: string, resolvedAt?: string): string {
  if (outcome === "correct") return "Resolved: Correct";
  if (outcome === "incorrect") return "Resolved: Incorrect";
  if (outcome === "invalid") return "Invalid";
  return "Pending";
}

function getOutcomeColor(outcome: string): string {
  if (outcome === "correct") return "bg-green-500/10 text-green-400 border-green-500/30";
  if (outcome === "incorrect") return "bg-red-500/10 text-red-400 border-red-500/30";
  if (outcome === "invalid") return "bg-neutral-500/10 text-neutral-400 border-neutral-500/30";
  return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center border border-neutral-800 rounded-lg p-8 bg-[#0d0d0d]">
          <h2 className="text-xl font-semibold text-white mb-2">Content Removed</h2>
          <p className="text-neutral-400 mb-6 text-sm">
            This proof has been removed for violating the rules.
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded transition-colors text-sm border border-neutral-700"
          >
            Return to ProofLocker
          </Link>
        </div>
      </div>
    );
  }

  const lockedDate = new Date(prediction.timestamp);
  const isResolved = prediction.outcome === "correct" || prediction.outcome === "incorrect";

  // Generate the explorer URL once, outside of JSX
  const explorerUrl = prediction.deReference
    ? getDigitalEvidenceFingerprintUrl(prediction.deReference)
    : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-neutral-400 hover:text-white transition-colors text-sm"
          >
            ← Back to ProofLocker
          </Link>
        </div>

        {/* SECTION 1: Prediction Statement */}
        <div className="mb-6">
          <h1 className="text-3xl leading-relaxed text-white font-medium">
            {prediction.text}
          </h1>
        </div>

        {/* SECTION 2: Outcome + Resolution Date (for claimed predictions) */}
        {prediction.userId && (
          <div className="mb-6 pb-6 border-b border-neutral-800">
            <div className="text-xs text-neutral-500 uppercase tracking-wide mb-2">
              Outcome
            </div>
            <div className="mb-2">
              <OutcomeBadge outcome={prediction.outcome} size="md" showLabel="long" />
            </div>
            {isResolved && prediction.resolvedAt && (
              <div className="text-sm text-neutral-400">
                Resolved on {new Date(prediction.resolvedAt).toLocaleString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "UTC",
                })} UTC
              </div>
            )}
          </div>
        )}

        {/* SECTION 3: Record Details */}
        <div className="mb-6 pb-6 border-b border-neutral-800">
          <div className="text-xs text-neutral-500 uppercase tracking-wide mb-3">
            Record Details
          </div>
          <div className="space-y-2.5 text-sm">
            {/* Locked on */}
            <div className="flex justify-between items-center gap-4">
              <span className="text-neutral-400">Locked on</span>
              <div className="text-neutral-300 font-mono text-sm">
                {lockedDate.toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "UTC",
                })} UTC
              </div>
            </div>

            {/* Resolved on (if applicable) */}
            {isResolved && prediction.resolvedAt && (
              <div className="flex justify-between items-center gap-4">
                <span className="text-neutral-400">Resolved on</span>
                <div className="text-neutral-300 font-mono text-sm">
                  {new Date(prediction.resolvedAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "UTC",
                  })} UTC
                </div>
              </div>
            )}

            {/* On-chain network */}
            <div className="flex justify-between items-center gap-4">
              <span className="text-neutral-400">On-chain network</span>
              <div
                className={`px-2.5 py-1 border rounded text-xs font-medium ${
                  prediction.onChainStatus === "confirmed"
                    ? "bg-green-500/10 text-green-400 border-green-500/30"
                    : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                }`}
              >
                {prediction.onChainStatus === "confirmed" ? "Constellation Network" : "Pending"}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Resolution Summary (if present) - WHY */}
        {isResolved && prediction.resolvedAt && prediction.resolutionNote && (
          <div className="mb-6 pb-6 border-b border-neutral-800">
            <div className="text-xs text-neutral-500 uppercase tracking-wide mb-2">
              Resolution Summary
            </div>
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3">
              <p className="text-sm text-neutral-300 leading-relaxed">
                {prediction.resolutionNote}
              </p>
              {prediction.resolutionUrl && (
                <a
                  href={prediction.resolutionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-cyan-400 hover:text-cyan-300 break-all underline inline-block mt-2"
                >
                  {prediction.resolutionUrl}
                </a>
              )}
            </div>
          </div>
        )}

        {/* SECTION 5: On-Chain Proof (confirmed only) - HOW */}
        {prediction.onChainStatus === "confirmed" && prediction.deReference && (
          <div className="mb-6">
            <div className="text-xs text-neutral-500 uppercase tracking-wide mb-3">
              On-Chain Proof
            </div>

            {/* Trust summary block */}
            <div className="mb-4 p-3 bg-cyan-500/5 border border-cyan-500/30 rounded-lg">
              <div className="max-w-lg mx-auto">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <h3 className="text-sm font-medium text-white">Verify this proof</h3>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-neutral-400">
                    <svg className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-neutral-300">Immutable record</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-400">
                    <svg className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-neutral-300">Timestamped (UTC)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-400">
                    <svg className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="text-neutral-300">SHA-256 content hash</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-400">
                    <svg className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-neutral-300">Publicly verifiable</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Explanatory sentence */}
            <p className="text-xs text-neutral-500 mb-4">
              Recorded on-chain via Digital Evidence.
            </p>

            {/* Technical proof details */}
            <div className="space-y-2.5 text-sm">
              {/* Transaction Hash */}
              <div>
                <div className="text-xs text-neutral-500 mb-1">
                  Transaction
                </div>
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

              {/* Block Timestamp */}
              {prediction.confirmedAt && (
                <div className="flex justify-between items-start gap-4">
                  <span className="text-neutral-500 text-xs">Timestamp (UTC)</span>
                  <div className="text-neutral-300 font-mono text-right text-xs">
                    {new Date(prediction.confirmedAt).toUTCString()}
                  </div>
                </div>
              )}

              {/* Content Hash (SHA-256) */}
              <div>
                <div className="text-xs text-neutral-500 mb-1">
                  Content hash
                </div>
                <div className="flex items-start gap-2 bg-black/40 p-2.5 rounded border border-neutral-800/50">
                  <code className="text-xs text-neutral-300 font-mono break-all flex-1">
                    {prediction.hash}
                  </code>
                  <CopyButton text={prediction.hash} iconSize="sm" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 6: Resolution On-Chain Proof (when resolution is confirmed) */}
        {isResolved && prediction.resolutionDeStatus === "CONFIRMED" && prediction.resolutionDeHash && (
          <div className="mb-6">
            <div className="text-xs text-neutral-500 uppercase tracking-wide mb-3">
              Resolution On-Chain Proof
            </div>

            {/* Trust summary block */}
            <div className="mb-4 p-3 bg-purple-500/5 border border-purple-500/30 rounded-lg">
              <div className="max-w-lg mx-auto">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <h3 className="text-sm font-medium text-white">Resolution locked on-chain</h3>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-neutral-400">
                    <svg className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-neutral-300">Immutable outcome</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-400">
                    <svg className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-neutral-300">Resolution timestamped</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-400">
                    <svg className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="text-neutral-300">SHA-256 resolution hash</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-400">
                    <svg className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-neutral-300">Publicly verifiable</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Explanatory sentence */}
            <p className="text-xs text-neutral-500 mb-4">
              Resolution recorded on-chain via Digital Evidence.
            </p>

            {/* Technical proof details */}
            <div className="space-y-2.5 text-sm">
              {/* Resolution Transaction Hash */}
              {prediction.resolutionDeReference && (
                <div>
                  <div className="text-xs text-neutral-500 mb-1">
                    Resolution transaction
                  </div>
                  <div className="flex items-start gap-2">
                    {prediction.resolutionDeReference && getDigitalEvidenceFingerprintUrl(prediction.resolutionDeReference) ? (
                      <a
                        href={getDigitalEvidenceFingerprintUrl(prediction.resolutionDeReference)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-purple-400 hover:text-purple-300 font-mono break-all underline flex-1"
                      >
                        {prediction.resolutionDeReference}
                      </a>
                    ) : (
                      <div className="text-sm text-neutral-300 font-mono break-all flex-1">
                        {prediction.resolutionDeReference}
                      </div>
                    )}
                    <CopyButton text={prediction.resolutionDeReference || ""} iconSize="sm" />
                  </div>
                </div>
              )}

              {/* Resolution Block Timestamp */}
              {prediction.resolutionDeTimestamp && (
                <div className="flex justify-between items-start gap-4">
                  <span className="text-neutral-400">Resolution block timestamp</span>
                  <div className="text-neutral-300 font-mono text-right text-xs">
                    {new Date(prediction.resolutionDeTimestamp).toUTCString()}
                  </div>
                </div>
              )}

              {/* Resolution Hash (SHA-256) */}
              <div>
                <div className="text-xs text-neutral-400 mb-1.5">
                  Resolution Data Hash (SHA-256)
                </div>
                <div className="flex items-start gap-2 bg-black/40 p-2.5 rounded border border-neutral-800/50">
                  <code className="text-xs text-neutral-300 font-mono break-all flex-1">
                    {prediction.resolutionDeHash}
                  </code>
                  <CopyButton text={prediction.resolutionDeHash} iconSize="sm" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending confirmation section */}
        {prediction.onChainStatus !== "confirmed" && (
          <div className="mb-6">
            <div className="text-xs text-neutral-500 uppercase tracking-wide mb-3">
              On-Chain Proof
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Status</span>
                <span className="text-neutral-400">Pending confirmation</span>
              </div>
              <div>
                <div className="text-xs text-neutral-400 mb-1.5">
                  Content Hash (SHA-256)
                </div>
                <div className="font-mono text-xs text-neutral-300 bg-black/40 p-2.5 rounded border border-neutral-800 break-all">
                  {prediction.hash}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-neutral-800">
          <p className="text-sm text-neutral-500 text-center mb-3">
            This proof cannot be edited after creation.
          </p>
          <div className="text-center">
            <Link href="/" className="text-xs text-neutral-500 hover:text-white transition-colors">
              ProofLocker
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
