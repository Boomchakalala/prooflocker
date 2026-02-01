"use client";

import PredictionCard from "./PredictionCard";
import { Prediction } from "@/lib/storage";
import { useRef } from "react";

export default function ProofCardPreview() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Diverse sample predictions showcasing different outcomes and categories
  const samplePredictions: Prediction[] = [
    {
      id: "sample-btc-100k",
      userId: null,
      anonId: "sample-anon-1",
      authorNumber: 1234,
      text: "Bitcoin will hit $100K before the end of 2024",
      textPreview: "Bitcoin will hit $100K before the end of 2024",
      hash: "481d8d02351695940e4412672a4c4e53d6264d0d291f2ed08342aeba445f1be3",
      timestamp: "2024-01-15T12:00:00.000Z",
      dagTransaction: "sample-dag-tx-1",
      proofId: "sample-proof-1",
      publicSlug: "sample-proof-slug-1",
      onChainStatus: "confirmed",
      outcome: "correct",
      category: "Crypto",
      deReference: "sample-de-ref-1",
      deEventId: "sample-event-1",
      deStatus: "CONFIRMED",
      deSubmittedAt: "2024-01-15T12:00:00.000Z",
      confirmedAt: "2024-01-15T12:05:00.000Z",
      resolutionDeStatus: "CONFIRMED",
      resolvedAt: "2024-12-28T14:00:00.000Z",
      resolutionNote: "Bitcoin reached $102,500 on December 28, 2024",
      moderationStatus: "active",
    },
    {
      id: "sample-chiefs-sb",
      userId: null,
      anonId: "sample-anon-2",
      authorNumber: 5678,
      text: "The Kansas City Chiefs will win Super Bowl LIX in February 2025",
      textPreview: "The Kansas City Chiefs will win Super Bowl LIX in February 2025",
      hash: "7f3c9a1b4e6d8f2a5c9e1d4b7a3f6c9e2d5b8a1c4e7f0a3d6b9c2e5f8a1b4d7",
      timestamp: "2024-09-10T18:30:00.000Z",
      dagTransaction: "sample-dag-tx-2",
      proofId: "sample-proof-2",
      publicSlug: "sample-proof-slug-2",
      onChainStatus: "confirmed",
      outcome: "pending",
      category: "Sports",
      deReference: "sample-de-ref-2",
      deEventId: "sample-event-2",
      deStatus: "CONFIRMED",
      deSubmittedAt: "2024-09-10T18:30:00.000Z",
      confirmedAt: "2024-09-10T18:35:00.000Z",
      moderationStatus: "active",
    },
    {
      id: "sample-election",
      userId: null,
      anonId: "sample-anon-3",
      authorNumber: 9012,
      text: "Trump will NOT run for president in 2024",
      textPreview: "Trump will NOT run for president in 2024",
      hash: "2c5e8f1d4a7b0c3f6e9d2a5c8f1b4e7d0a3c6f9e2b5d8a1f4c7e0b3d6a9c2f5",
      timestamp: "2023-01-20T10:00:00.000Z",
      dagTransaction: "sample-dag-tx-3",
      proofId: "sample-proof-3",
      publicSlug: "sample-proof-slug-3",
      onChainStatus: "confirmed",
      outcome: "wrong",
      category: "Politics",
      deReference: "sample-de-ref-3",
      deEventId: "sample-event-3",
      deStatus: "CONFIRMED",
      deSubmittedAt: "2023-01-20T10:00:00.000Z",
      confirmedAt: "2023-01-20T10:05:00.000Z",
      resolutionDeStatus: "CONFIRMED",
      resolvedAt: "2023-11-15T20:00:00.000Z",
      resolutionNote: "Trump officially announced his 2024 presidential campaign on November 15, 2023",
      moderationStatus: "active",
    },
    {
      id: "sample-grok-release",
      userId: null,
      anonId: "sample-anon-4",
      authorNumber: 3456,
      text: "Grok AI will be released to the public within 6 months of X Premium launch",
      textPreview: "Grok AI will be released to the public within 6 months of X Premium launch",
      hash: "9e2d5a8c1f4b7e0d3a6c9f2e5b8d1a4c7f0e3b6d9a2c5f8e1b4d7a0c3f6e9d2",
      timestamp: "2023-11-05T14:00:00.000Z",
      dagTransaction: "sample-dag-tx-4",
      proofId: "sample-proof-4",
      publicSlug: "sample-proof-slug-4",
      onChainStatus: "confirmed",
      outcome: "correct",
      category: "Tech",
      deReference: "sample-de-ref-4",
      deEventId: "sample-event-4",
      deStatus: "CONFIRMED",
      deSubmittedAt: "2023-11-05T14:00:00.000Z",
      confirmedAt: "2023-11-05T14:05:00.000Z",
      resolutionDeStatus: "CONFIRMED",
      resolvedAt: "2024-03-20T16:00:00.000Z",
      resolutionNote: "Grok was released to X Premium subscribers in March 2024",
      moderationStatus: "active",
    },
    {
      id: "sample-personal-goal",
      userId: null,
      anonId: "sample-anon-5",
      authorNumber: 7890,
      text: "I will run my first marathon before my 30th birthday (June 2025)",
      textPreview: "I will run my first marathon before my 30th birthday (June 2025)",
      hash: "4b7e0d3a6c9f2e5b8d1a4c7f0e3b6d9a2c5f8e1b4d7a0c3f6e9d2a5c8f1b4e7",
      timestamp: "2024-01-01T00:00:00.000Z",
      dagTransaction: "sample-dag-tx-5",
      proofId: "sample-proof-5",
      publicSlug: "sample-proof-slug-5",
      onChainStatus: "confirmed",
      outcome: "correct",
      category: "Personal",
      deReference: "sample-de-ref-5",
      deEventId: "sample-event-5",
      deStatus: "CONFIRMED",
      deSubmittedAt: "2024-01-01T00:00:00.000Z",
      confirmedAt: "2024-01-01T00:05:00.000Z",
      resolutionDeStatus: "CONFIRMED",
      resolvedAt: "2025-05-15T18:00:00.000Z",
      resolutionNote: "Completed the Boston Marathon on May 15, 2025 with a time of 3:45:23",
      moderationStatus: "active",
    },
    {
      id: "sample-eth-merge",
      userId: null,
      anonId: "sample-anon-6",
      authorNumber: 2345,
      text: "Ethereum will successfully complete 'The Merge' to Proof of Stake by end of Q3 2022",
      textPreview: "Ethereum will successfully complete 'The Merge' to Proof of Stake by end of Q3 2022",
      hash: "c6f9e2b5d8a1f4c7e0b3d6a9c2f5e8d1a4c7f0e3b6d9a2c5f8e1b4d7a0c3f6e",
      timestamp: "2022-01-10T08:00:00.000Z",
      dagTransaction: "sample-dag-tx-6",
      proofId: "sample-proof-6",
      publicSlug: "sample-proof-slug-6",
      onChainStatus: "confirmed",
      outcome: "correct",
      category: "Crypto",
      deReference: "sample-de-ref-6",
      deEventId: "sample-event-6",
      deStatus: "CONFIRMED",
      deSubmittedAt: "2022-01-10T08:00:00.000Z",
      confirmedAt: "2022-01-10T08:05:00.000Z",
      resolutionDeStatus: "CONFIRMED",
      resolvedAt: "2022-09-15T08:00:00.000Z",
      resolutionNote: "The Merge successfully completed on September 15, 2022",
      moderationStatus: "active",
    },
  ];

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 400;
    const newScrollLeft =
      scrollContainerRef.current.scrollLeft +
      (direction === "left" ? -scrollAmount : scrollAmount);
    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative z-10 py-16 md:py-20 px-4 bg-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Real Predictions. Real Proofs. Locked Forever.
          </h2>
          <p className="text-base md:text-lg text-gray-400">
            Swipe through real locked examples
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scroll("left")}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-14 h-14 items-center justify-center bg-slate-800 border border-blue-500/30 rounded-full shadow-2xl hover:bg-slate-700 hover:scale-110 hover:border-blue-400 transition-all"
            aria-label="Scroll left"
          >
            <svg
              className="w-7 h-7 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Scrollable Cards Container */}
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto scrollbar-hide snap-x snap-mandatory flex gap-6 pb-4 px-2"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {samplePredictions.map((prediction) => (
              <div
                key={prediction.id}
                className={`flex-shrink-0 w-[85vw] sm:w-[450px] md:w-[520px] snap-center ${
                  prediction.outcome === "correct" ? "ring-2 ring-green-500/50 rounded-2xl shadow-2xl shadow-green-500/20" : ""
                }`}
              >
                <PredictionCard
                  prediction={prediction}
                  currentUserId={null}
                />
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll("right")}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-14 h-14 items-center justify-center bg-slate-800 border border-blue-500/30 rounded-full shadow-2xl hover:bg-slate-700 hover:scale-110 hover:border-blue-400 transition-all"
            aria-label="Scroll right"
          >
            <svg
              className="w-7 h-7 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Scroll Hint for Mobile */}
        <p className="text-center text-sm text-gray-500 mt-6 md:hidden">
          Swipe to see more examples →
        </p>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
