import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPredictionBySlug, type Prediction } from "@/lib/storage";

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
  });

  // Shorten text for preview (max ~100 chars for social cards)
  const previewText = prediction.text.length > 100
    ? prediction.text.substring(0, 97) + "..."
    : prediction.text;

  // Shortened proof ID (first 8 chars)
  const shortProofId = prediction.proofId.substring(0, 8);

  const title = `${previewText} | ProofLocker`;
  const description = `Locked on ${dateStr} • Proof ${shortProofId} • Immutable timestamp proof on Constellation Network`;

  return {
    title,
    description,
    openGraph: {
      title: previewText,
      description: `Locked on ${dateStr} • Proof ${shortProofId}`,
      type: "website",
      siteName: "ProofLocker",
    },
    twitter: {
      card: "summary",
      title: previewText,
      description: `Locked on ${dateStr} • Proof ${shortProofId}`,
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center text-neutral-400 hover:text-white transition-colors mb-8 text-sm"
          >
            ← Back to ProofLocker
          </Link>
        </div>

        {/* Above the fold */}
        <div className="mb-12">
          {/* Prediction text - hero */}
          <h1 className="text-3xl leading-relaxed mb-8 text-white font-medium">
            {prediction.text}
          </h1>

          {/* Key metadata grid */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <div className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
                Locked
              </div>
              <div className="font-mono text-sm text-neutral-200">
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

            <div>
              <div className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
                Proof ID
              </div>
              <div className="font-mono text-sm text-neutral-200 break-all">
                {prediction.proofId.substring(0, 16)}...
              </div>
            </div>
          </div>

          {/* Status badge */}
          <div className="mb-2">
            <div className="text-xs text-neutral-500 uppercase tracking-wide mb-2">
              Status
            </div>
            <div
              className={`inline-block px-3 py-1.5 border rounded text-sm font-medium ${getOutcomeColor(
                prediction.outcome
              )}`}
            >
              {getOutcomeLabel(prediction.outcome, prediction.resolvedAt)}
            </div>
          </div>

          {/* Resolution info if present */}
          {isResolved && prediction.resolvedAt && (
            <div className="mt-6 pt-6 border-t border-neutral-800">
              <div className="text-xs text-neutral-500 uppercase tracking-wide mb-3">
                Resolution
              </div>
              {prediction.resolutionNote && (
                <p className="text-sm text-neutral-300 mb-3 leading-relaxed">
                  {prediction.resolutionNote}
                </p>
              )}
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
              <div className="text-xs text-neutral-500 mt-2">
                Resolved on{" "}
                {new Date(prediction.resolvedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
          )}
        </div>

        {/* Below the fold - technical details */}
        <div className="pt-8 border-t border-neutral-800 space-y-6">
          <div>
            <div className="text-xs text-neutral-500 uppercase tracking-wide mb-2">
              On-Chain Reference
            </div>
            {prediction.onChainStatus === "confirmed" && prediction.deReference ? (
              <div className="font-mono text-xs text-neutral-300 bg-black/40 p-3 rounded border border-neutral-800 break-all">
                {prediction.deReference}
              </div>
            ) : (
              <div className="text-sm text-neutral-500">Pending confirmation</div>
            )}
          </div>

          <div>
            <div className="text-xs text-neutral-500 uppercase tracking-wide mb-2">
              Network
            </div>
            <div className="text-sm text-neutral-200">Constellation Network (DAG)</div>
          </div>

          <div>
            <div className="text-xs text-neutral-500 uppercase tracking-wide mb-2">
              Timestamp Source
            </div>
            <div className="text-sm text-neutral-200">
              {prediction.onChainStatus === "confirmed"
                ? "On-chain (Constellation Digital Evidence)"
                : "Proof creation timestamp"}
            </div>
          </div>

          <div>
            <div className="text-xs text-neutral-500 uppercase tracking-wide mb-2">
              SHA-256 Hash
            </div>
            <div className="font-mono text-xs text-neutral-300 bg-black/40 p-3 rounded border border-neutral-800 break-all">
              {prediction.hash}
            </div>
          </div>
        </div>

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
