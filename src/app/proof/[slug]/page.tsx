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
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-neutral-400 hover:text-white transition-colors mb-6 text-sm"
          >
            ← Back to ProofLocker
          </Link>
        </div>

        {/* SECTION 1: Prediction Statement */}
        <div className="mb-8">
          <h1 className="text-3xl leading-relaxed text-white font-medium">
            {prediction.text}
          </h1>
        </div>

        {/* SECTION 2: Outcome + Resolution Date (for claimed predictions) */}
        {prediction.userId && (
          <div className="mb-8 pb-8 border-b border-neutral-800">
            <div className="text-xs text-neutral-500 uppercase tracking-wide mb-3">
              Outcome
            </div>
            <div className="mb-3">
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
        <div className="mb-8 pb-8 border-b border-neutral-800">
          <div className="text-xs text-neutral-500 uppercase tracking-wide mb-4">
            Record Details
          </div>
          <div className="space-y-3 text-sm">
            {/* Locked on */}
            <div className="flex justify-between items-start">
              <span className="text-neutral-400">Locked on</span>
              <div className="text-right">
                <div className="text-neutral-300 font-mono">
                  {lockedDate.toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "UTC",
                  })} UTC
                </div>
                <div className="text-xs text-neutral-500 mt-0.5">
                  {lockedDate.toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZoneName: "short",
                  })}
                </div>
              </div>
            </div>

            {/* Resolved on (if applicable) */}
            {isResolved && prediction.resolvedAt && (
              <div className="flex justify-between items-start">
                <span className="text-neutral-400">Resolved on</span>
                <div className="text-right">
                  <div className="text-neutral-300 font-mono">
                    {new Date(prediction.resolvedAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "UTC",
                    })} UTC
                  </div>
                  <div className="text-xs text-neutral-500 mt-0.5">
                    {new Date(prediction.resolvedAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZoneName: "short",
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* On-chain network */}
            <div className="flex justify-between items-center">
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

        {/* SECTION 4: Resolution Summary (if present) */}
        {isResolved && prediction.resolvedAt && prediction.resolutionNote && (
          <div className="mb-8 pb-8 border-b border-neutral-800">
            <div className="text-xs text-neutral-500 uppercase tracking-wide mb-3">
              Resolution Summary
            </div>
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
              <p className="text-sm text-neutral-300 leading-relaxed mb-3">
                {prediction.resolutionNote}
              </p>
              {prediction.resolutionUrl && (
                <a
                  href={prediction.resolutionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-cyan-400 hover:text-cyan-300 break-all underline"
                >
                  {prediction.resolutionUrl}
                </a>
              )}
            </div>
          </div>
        )}

        {/* SECTION 5: On-Chain Proof (confirmed only) */}
        {prediction.onChainStatus === "confirmed" && prediction.deReference && (
          <div className="mb-8">
            <div className="text-xs text-neutral-500 uppercase tracking-wide mb-4">
              On-Chain Proof
            </div>

            {/* Explanatory text */}
            <div className="mb-6 p-4 bg-neutral-900/30 border border-neutral-800 rounded-lg">
              <p className="text-sm text-neutral-300 leading-relaxed">
                This proof is recorded using Digital Evidence on the Constellation Network (DAG),
                providing an immutable, timestamped, and publicly verifiable record.
                The original statement is permanently locked and cannot be altered.
              </p>
            </div>

            {/* Technical proof details */}
            <div className="space-y-5">
              {/* Network */}
              <div>
                <div className="text-xs text-neutral-400 mb-1.5">
                  Network
                </div>
                <div className="text-sm text-neutral-300">
                  Constellation Network (DAG)
                </div>
              </div>

              {/* Transaction Hash */}
              <div>
                <div className="text-xs text-neutral-400 mb-2">
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
                  <div className="text-xs text-neutral-400 mb-1.5">
                    Block Timestamp (UTC)
                  </div>
                  <div className="text-sm text-neutral-300 font-mono">
                    {new Date(prediction.confirmedAt).toUTCString()}
                  </div>
                </div>
              )}

              {/* Content Hash (SHA-256) */}
              <div>
                <div className="text-xs text-neutral-400 mb-2">
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
          </div>
        )}

        {/* Pending confirmation section */}
        {prediction.onChainStatus !== "confirmed" && (
          <div className="mb-8">
            <div className="text-xs text-neutral-500 uppercase tracking-wide mb-4">
              On-Chain Proof
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-neutral-400 mb-1.5">
                  Status
                </div>
                <div className="text-sm text-neutral-400">Pending confirmation</div>
              </div>
              <div>
                <div className="text-xs text-neutral-400 mb-2">
                  Content Hash (SHA-256)
                </div>
                <div className="font-mono text-xs text-neutral-300 bg-black/40 p-3 rounded border border-neutral-800 break-all">
                  {prediction.hash}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-neutral-800">
          <p className="text-sm text-neutral-500 text-center mb-4">
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
