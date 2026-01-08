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
  if (outcome === "correct") return "text-green-500";
  if (outcome === "incorrect") return "text-red-500";
  return "text-yellow-500";
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
      <div className="min-h-screen bg-white text-black flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center border border-neutral-300 rounded-lg p-8">
          <h2 className="text-xl font-semibold mb-2">Content Removed</h2>
          <p className="text-neutral-600 mb-6 text-sm">
            This proof has been removed for violating the rules.
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-medium rounded transition-colors text-sm"
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
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center text-neutral-500 hover:text-black transition-colors mb-8 text-sm"
          >
            ← Back
          </Link>
        </div>

        {/* Above the fold */}
        <div className="mb-12">
          {/* Prediction text - hero */}
          <h1 className="text-3xl font-serif leading-relaxed mb-8 text-black">
            {prediction.text}
          </h1>

          {/* Key metadata grid - ultra clean */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <div className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
                Locked
              </div>
              <div className="font-mono text-sm text-black">
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
              <div className="font-mono text-sm text-black break-all">
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
              className={`inline-block px-3 py-1 border rounded text-sm font-medium ${getOutcomeColor(
                prediction.outcome
              )}`}
              style={{ borderColor: "currentColor" }}
            >
              {getOutcomeLabel(prediction.outcome, prediction.resolvedAt)}
            </div>
          </div>

          {/* Resolution info if present */}
          {isResolved && prediction.resolvedAt && (
            <div className="mt-6 pt-6 border-t border-neutral-200">
              <div className="text-xs text-neutral-500 uppercase tracking-wide mb-3">
                Resolution
              </div>
              {prediction.resolutionNote && (
                <p className="text-sm text-neutral-700 mb-3 leading-relaxed">
                  {prediction.resolutionNote}
                </p>
              )}
              {prediction.resolutionUrl && (
                <a
                  href={prediction.resolutionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline break-all"
                >
                  {prediction.resolutionUrl}
                </a>
              )}
              <div className="text-xs text-neutral-400 mt-2">
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
        <div className="pt-8 border-t border-neutral-200 space-y-6">
          <div>
            <div className="text-xs text-neutral-500 uppercase tracking-wide mb-2">
              On-Chain Reference
            </div>
            {prediction.onChainStatus === "confirmed" && prediction.deReference ? (
              <div className="font-mono text-xs text-neutral-700 bg-neutral-50 p-3 rounded border border-neutral-200 break-all">
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
            <div className="text-sm text-black">Constellation Network (DAG)</div>
          </div>

          <div>
            <div className="text-xs text-neutral-500 uppercase tracking-wide mb-2">
              Timestamp Source
            </div>
            <div className="text-sm text-black">
              {prediction.onChainStatus === "confirmed"
                ? "On-chain (Constellation Digital Evidence)"
                : "Proof creation timestamp"}
            </div>
          </div>

          <div>
            <div className="text-xs text-neutral-500 uppercase tracking-wide mb-2">
              SHA-256 Hash
            </div>
            <div className="font-mono text-xs text-neutral-700 bg-neutral-50 p-3 rounded border border-neutral-200 break-all">
              {prediction.hash}
            </div>
          </div>
        </div>

        {/* Immutability note */}
        <div className="mt-12 pt-8 border-t border-neutral-200">
          <p className="text-sm text-neutral-500 text-center">
            This proof cannot be edited after creation.
          </p>
        </div>

        {/* Footer branding */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-xs text-neutral-400 hover:text-black transition-colors">
            ProofLocker
          </Link>
        </div>
      </div>
    </div>
  );
}
