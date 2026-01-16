import PredictionCard from "./PredictionCard";
import { Prediction } from "@/lib/storage";

export default function ProofCardPreview() {
  // Sample prediction data that looks like a real card
  const samplePrediction: Prediction = {
    id: "sample-prediction-landing",
    userId: null,
    anonId: "sample-anon-id",
    authorNumber: 1234,
    text: "Bitcoin will hit $100K before the end of 2024",
    textPreview: "Bitcoin will hit $100K before the end of 2024",
    hash: "481d8d02351695940e4412672a4c4e53d6264d0d291f2ed08342aeba445f1be3",
    timestamp: "2026-01-16T12:00:00.000Z",
    dagTransaction: "sample-dag-tx",
    proofId: "sample-proof-id",
    publicSlug: "sample-proof-slug",
    onChainStatus: "confirmed",
    outcome: "correct",
    category: "Crypto",
    deReference: "sample-de-ref",
    deEventId: "sample-event-id",
    deStatus: "CONFIRMED",
    deSubmittedAt: "2026-01-16T12:00:00.000Z",
    confirmedAt: "2026-01-16T12:00:00.000Z",
    resolutionDeStatus: "CONFIRMED",
    resolvedAt: "2026-01-16T14:00:00.000Z",
    resolutionNote: "Bitcoin reached $102,500 on December 28, 2024",
    moderationStatus: "active",
  };

  return (
    <div className="relative z-10 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-sm text-neutral-500 uppercase tracking-wide mb-2">Example proof</p>
          <h3 className="text-2xl font-bold text-white">See how it looks</h3>
        </div>

        {/* Use the actual PredictionCard component with sample data */}
        <PredictionCard
          prediction={samplePrediction}
          currentUserId={null}
          onOutcomeUpdate={() => {}}
        />
      </div>
    </div>
  );
}
