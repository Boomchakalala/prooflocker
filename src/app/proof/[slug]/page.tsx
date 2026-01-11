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
  if (outcome === "correct") return "Resolved: True";
  if (outcome === "incorrect") return "Resolved: False";
  return "Pending";
}

function getOutcomeColor(outcome: string): string {
  if (outcome === "correct") return "bg-green-500/10 text-green-400 border-green-500/30";
  if (outcome === "incorrect") return "bg-red-500/10 text-red-400 border-red-500/30";
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
        {/* Header - tightened */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-neutral-400 hover:text-white transition-colors mb-4 text-sm"
          >
            ← Back to ProofLocker
          </Link>
        </div>

        {/* Above the fold - tightened */}
        <div className="mb-6">
          {/* Prediction text - hero */}
          <h1 className="text-3xl leading-relaxed mb-6 text-white font-medium">
            {prediction.text}
          </h1>

          {/* Timestamps - Clear separation between locked and resolved */}
          <div className="mb-5 pb-5 border-b border-neutral-800">
            <div className="space-y-3">
              {/* Locked timestamp */}
              <div>
                <div className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
                  Locked On
                </div>
                <div className="font-mono text-base text-white">
                  {lockedDate.toLocaleString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    timeZone: "UTC",
                  })} UTC
                </div>
                <div className="font-mono text-xs text-neutral-500 mt-1">
                  Your local: {lockedDate.toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZoneName: "short",
                  })}
                </div>
              </div>

              {/* Resolved timestamp (only if resolved) */}
              {isResolved && prediction.resolvedAt && (
                <div>
                  <div className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
                    Resolved On
                  </div>
                  <div className="font-mono text-base text-white">
                    {new Date(prediction.resolvedAt).toLocaleString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      timeZone: "UTC",
                    })} UTC
                  </div>
                  <div className="font-mono text-xs text-neutral-500 mt-1">
                    Your local: {new Date(prediction.resolvedAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZoneName: "short",
                    })}
                  </div>
                </div>
              )}

              {/* Immutability note */}
              <div className="pt-2">
                <p className="text-xs text-neutral-400 leading-relaxed">
                  The original statement is permanently locked. Only the resolution status can be updated.
                </p>
              </div>
            </div>
          </div>

          {/* On-chain Status */}
          <div className="mb-4">
            <div className="text-xs text-neutral-500 uppercase tracking-wide mb-2">
              On-Chain Status
            </div>
            <div
              className={`inline-block px-3 py-1.5 border rounded text-sm font-medium ${
                prediction.onChainStatus === "confirmed"
                  ? "bg-green-500/10 text-green-400 border-green-500/30"
                  : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
              }`}
            >
              {prediction.onChainStatus === "confirmed" ? "Locked on Constellation Network" : "Pending Confirmation"}
            </div>
          </div>

          {/* Outcome Status (only for claimed predictions) */}
          {prediction.userId && (
            <div className="mb-2">
              <div className="text-xs text-neutral-500 uppercase tracking-wide mb-2">
                Outcome
              </div>
              <OutcomeBadge outcome={prediction.outcome} size="md" showLabel="long" />
            </div>
          )}

          {/* Resolution info if present */}
          {isResolved && prediction.resolvedAt && prediction.resolutionNote && (
            <div className="mt-6 pt-6 border-t border-neutral-800">
              <div className="text-xs text-neutral-500 uppercase tracking-wide mb-3">
                Resolution Note
              </div>
              <p className="text-sm text-neutral-300 mb-3 leading-relaxed">
                {prediction.resolutionNote}
              </p>
              {prediction.resolutionUrl && (
                <a
                  href={prediction.resolutionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-cyan-400 hover:underline break-all"
                >
                  {prediction.resolutionUrl}
                </a>
              )}
            </div>
          )}
        </div>

        {/* VERIFY THIS PROOF - Enhanced verification section */}
        {prediction.onChainStatus === "confirmed" && prediction.deReference && (
          <div className="mb-8 p-5 bg-neutral-900/50 border-2 border-cyan-500/30 rounded-lg">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              VERIFY THIS PROOF
            </h2>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <svg className="w-4 h-4 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-neutral-300">Immutable record</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs text-neutral-300">Timestamped (UTC)</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 118 0v5m-8 4h8" />
                </svg>
                <span className="text-xs text-neutral-300">SHA-256 content hash</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs text-neutral-300">Publicly verifiable</span>
              </div>
            </div>

            {/* Technical Details */}
            <div className="space-y-4">
              {/* Network */}
              <div>
                <div className="text-xs text-neutral-400 uppercase tracking-wide mb-1.5">
                  Network
                </div>
                <div className="text-sm text-white font-medium">
                  Constellation Network (DAG)
                </div>
              </div>

              {/* Transaction Hash with Copy */}
              <div>
                <div className="text-xs text-neutral-400 uppercase tracking-wide mb-2">
                  Transaction Hash
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
                <div>
                  <div className="text-xs text-neutral-400 uppercase tracking-wide mb-1">
                    Block Timestamp (UTC)
                  </div>
                  <div className="text-sm text-white font-mono">
                    {new Date(prediction.confirmedAt).toUTCString()}
                  </div>
                </div>
              )}

              {/* Content Hash */}
              <div>
                <div className="text-xs text-neutral-400 uppercase tracking-wide mb-2">
                  Content Hash (SHA-256)
                </div>
                <div className="flex items-start gap-2 bg-black/40 p-3 rounded border border-neutral-800/50">
                  <code className="text-sm text-neutral-300 font-mono break-all flex-1">
                    {prediction.hash}
                  </code>
                  <CopyButton text={prediction.hash} iconSize="sm" />
                </div>
              </div>
            </div>

            {/* Single concise explanation */}
            <div className="mt-4 pt-4 border-t border-neutral-700/50">
              <p className="text-xs text-neutral-400 leading-relaxed">
                Anchored on Constellation Network (DAG). The statement is immutable—only the outcome can be updated.
              </p>
            </div>
          </div>
        )}

        {/* Below the fold - Additional technical details (only if not confirmed) */}
        {prediction.onChainStatus !== "confirmed" && (
          <div className="pt-8 border-t border-neutral-800 space-y-6">
            <div>
              <div className="text-xs text-neutral-500 uppercase tracking-wide mb-2">
                On-Chain Reference
              </div>
              <div className="text-sm text-neutral-500">Pending confirmation</div>
            </div>

            <div>
              <div className="text-xs text-neutral-500 uppercase tracking-wide mb-2">
                Content Hash (SHA-256)
              </div>
              <div className="font-mono text-xs text-neutral-300 bg-black/40 p-3 rounded border border-neutral-800 break-all">
                {prediction.hash}
              </div>
            </div>
          </div>
        )}

        {/* Immutability note */}
        <div className="mt-12 pt-8 border-t border-neutral-800">
          <p className="text-sm text-neutral-500 text-center">
            This proof cannot be edited after creation.
          </p>
        </div>

        {/* Footer branding */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-xs text-neutral-500 hover:text-white transition-colors">
            ProofLocker
          </Link>
        </div>
      </div>
    </div>
  );
}
