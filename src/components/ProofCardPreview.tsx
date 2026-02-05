"use client";

import PredictionCard from "./PredictionCard";
import { Prediction } from "@/lib/storage";
import { useRef, useState } from "react";

export default function ProofCardPreview() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Diverse sample predictions showcasing different outcomes and categories
  const samplePredictions: Prediction[] = [
    {
      id: "sample-btc-250k",
      userId: null,
      anonId: "sample-anon-1",
      authorNumber: 8421,
      text: "Bitcoin exceeds $250K by Dec 31, 2026",
      textPreview: "Bitcoin exceeds $250K by Dec 31, 2026",
      hash: "481d8d02351695940e4412672a4c4e53d6264d0d291f2ed08342aeba445f1be3",
      timestamp: "2026-02-15T12:00:00.000Z",
      dagTransaction: "sample-dag-tx-1",
      proofId: "sample-proof-1",
      publicSlug: "sample-proof-slug-1",
      onChainStatus: "confirmed",
      outcome: "correct",
      category: "Crypto",
      deReference: "sample-de-ref-1",
      deEventId: "sample-event-1",
      deStatus: "CONFIRMED",
      deSubmittedAt: "2026-02-15T12:00:00.000Z",
      confirmedAt: "2026-02-15T12:05:00.000Z",
      resolutionDeStatus: "CONFIRMED",
      resolvedAt: "2026-12-28T14:00:00.000Z",
      resolutionNote: "Bitcoin reached $252,100 on December 28, 2026",
      moderationStatus: "active",
    },
    {
      id: "sample-chiefs-sb",
      userId: null,
      anonId: "sample-anon-2",
      authorNumber: 5932,
      text: "Chiefs win Super Bowl LX — Feb 2026",
      textPreview: "Chiefs win Super Bowl LX — Feb 2026",
      hash: "7f3c9a1b4e6d8f2a5c9e1d4b7a3f6c9e2d5b8a1c4e7f0a3d6b9c2e5f8a1b4d7",
      timestamp: "2026-01-10T18:30:00.000Z",
      dagTransaction: "sample-dag-tx-2",
      proofId: "sample-proof-2",
      publicSlug: "sample-proof-slug-2",
      onChainStatus: "confirmed",
      outcome: "pending",
      category: "Sports",
      deReference: "sample-de-ref-2",
      deEventId: "sample-event-2",
      deStatus: "CONFIRMED",
      deSubmittedAt: "2026-01-10T18:30:00.000Z",
      confirmedAt: "2026-01-10T18:35:00.000Z",
      moderationStatus: "active",
    },
    {
      id: "sample-personal-goal",
      userId: null,
      anonId: "sample-anon-3",
      authorNumber: 7123,
      text: "Complete first marathon under 3:45 by my 35th birthday",
      textPreview: "Complete first marathon under 3:45 by my 35th birthday",
      hash: "4b7e0d3a6c9f2e5b8d1a4c7f0e3b6d9a2c5f8e1b4d7a0c3f6e9d2a5c8f1b4e7",
      timestamp: "2025-01-01T00:00:00.000Z",
      dagTransaction: "sample-dag-tx-3",
      proofId: "sample-proof-3",
      publicSlug: "sample-proof-slug-3",
      onChainStatus: "confirmed",
      outcome: "correct",
      category: "Personal",
      deReference: "sample-de-ref-3",
      deEventId: "sample-event-3",
      deStatus: "CONFIRMED",
      deSubmittedAt: "2025-01-01T00:00:00.000Z",
      confirmedAt: "2025-01-01T00:05:00.000Z",
      resolutionDeStatus: "CONFIRMED",
      resolvedAt: "2025-11-15T18:00:00.000Z",
      resolutionNote: "Completed NYC Marathon with time of 3:42:18",
      moderationStatus: "active",
    },
    {
      id: "sample-business-arr",
      userId: null,
      anonId: "sample-anon-4",
      authorNumber: 4567,
      text: "Achieve $500M ARR by Q4 2027 as stated to shareholders",
      textPreview: "Achieve $500M ARR by Q4 2027 as stated to shareholders",
      hash: "9e2d5a8c1f4b7e0d3a6c9f2e5b8d1a4c7f0e3b6d9a2c5f8e1b4d7a0c3f6e9d2",
      timestamp: "2026-01-05T14:00:00.000Z",
      dagTransaction: "sample-dag-tx-4",
      proofId: "sample-proof-4",
      publicSlug: "sample-proof-slug-4",
      onChainStatus: "confirmed",
      outcome: "pending",
      category: "Other",
      deReference: "sample-de-ref-4",
      deEventId: "sample-event-4",
      deStatus: "CONFIRMED",
      deSubmittedAt: "2026-01-05T14:00:00.000Z",
      confirmedAt: "2026-01-05T14:05:00.000Z",
      moderationStatus: "active",
    },
    {
      id: "sample-agi",
      userId: null,
      anonId: "sample-anon-5",
      authorNumber: 9876,
      text: "Major AI model reaches AGI benchmark by 2030",
      textPreview: "Major AI model reaches AGI benchmark by 2030",
      hash: "2c5e8f1d4a7b0c3f6e9d2a5c8f1b4e7d0a3c6f9e2b5d8a1f4c7e0b3d6a9c2f5",
      timestamp: "2026-01-20T10:00:00.000Z",
      dagTransaction: "sample-dag-tx-5",
      proofId: "sample-proof-5",
      publicSlug: "sample-proof-slug-5",
      onChainStatus: "confirmed",
      outcome: "pending",
      category: "Tech",
      deReference: "sample-de-ref-5",
      deEventId: "sample-event-5",
      deStatus: "CONFIRMED",
      deSubmittedAt: "2026-01-20T10:00:00.000Z",
      confirmedAt: "2026-01-20T10:05:00.000Z",
      moderationStatus: "active",
    },
    {
      id: "sample-election",
      userId: null,
      anonId: "sample-anon-6",
      authorNumber: 3245,
      text: "U.S. election decided via on-chain vote tally by 2028",
      textPreview: "U.S. election decided via on-chain vote tally by 2028",
      hash: "c6f9e2b5d8a1f4c7e0b3d6a9c2f5e8d1a4c7f0e3b6d9a2c5f8e1b4d7a0c3f6e",
      timestamp: "2026-01-12T08:00:00.000Z",
      dagTransaction: "sample-dag-tx-6",
      proofId: "sample-proof-6",
      publicSlug: "sample-proof-slug-6",
      onChainStatus: "confirmed",
      outcome: "pending",
      category: "Politics",
      deReference: "sample-de-ref-6",
      deEventId: "sample-event-6",
      deStatus: "CONFIRMED",
      deSubmittedAt: "2026-01-12T08:00:00.000Z",
      confirmedAt: "2026-01-12T08:05:00.000Z",
      moderationStatus: "active",
    },
    {
      id: "sample-eth-flip",
      userId: null,
      anonId: "sample-anon-7",
      authorNumber: 6789,
      text: "Ethereum flips Bitcoin market cap by 2029",
      textPreview: "Ethereum flips Bitcoin market cap by 2029",
      hash: "f1e4b7c0a3d6e9f2b5c8e1d4a7c0f3e6b9d2c5f8e1b4d7a0c3f6e9d2a5c8f1",
      timestamp: "2026-01-18T16:00:00.000Z",
      dagTransaction: "sample-dag-tx-7",
      proofId: "sample-proof-7",
      publicSlug: "sample-proof-slug-7",
      onChainStatus: "confirmed",
      outcome: "pending",
      category: "Markets",
      deReference: "sample-de-ref-7",
      deEventId: "sample-event-7",
      deStatus: "CONFIRMED",
      deSubmittedAt: "2026-01-18T16:00:00.000Z",
      confirmedAt: "2026-01-18T16:05:00.000Z",
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

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 20);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
  };

  return (
    <div className="relative z-10 py-12 md:py-16 px-8 bg-gradient-to-b from-[#0a0a0a] via-[#1A0033]/20 to-[#0a0a0a]">
      {/* Enhanced cyber radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
        <div
          className="w-[900px] h-[900px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(167, 139, 250, 0.3) 0%, rgba(0, 224, 255, 0.15) 50%, transparent 70%)'
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-10 fade-in-up">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-3 bg-gradient-to-r from-[#00E0FF] via-[#A78BFA] to-[#00FFE5] bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-montserrat)', filter: 'drop-shadow(0 0 25px rgba(0, 224, 255, 0.3))' }}>
            Real Calls Real Proof
          </h2>
          <p className="text-sm md:text-base text-white/75 font-semibold">
            Wins, misses, and permanent accountability
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative group">
          {/* Left Arrow - show on hover (desktop) */}
          {showLeftArrow && (
            <button
              onClick={() => scroll("left")}
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-9 h-9 items-center justify-center bg-[#111111]/60 border border-white/5 rounded-full hover:bg-[#1a1a1a] hover:border-[#2E5CFF]/30 transition-all opacity-40 hover:opacity-100"
              aria-label="Scroll left"
            >
              <svg
                className="w-4 h-4 text-gray-400 hover:text-[#2E5CFF]"
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
          )}

          {/* Scrollable Cards Container */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="overflow-x-auto scrollbar-hide snap-x snap-mandatory flex gap-5 pb-4 px-2"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {samplePredictions.map((prediction) => (
              <div
                key={prediction.id}
                className="flex-shrink-0 w-[82vw] sm:w-[400px] md:w-[420px] snap-center"
              >
                <PredictionCard
                  prediction={prediction}
                  currentUserId={null}
                  isPreview={true}
                />
              </div>
            ))}
          </div>

          {/* Right Arrow - show on hover (desktop) */}
          {showRightArrow && (
            <button
              onClick={() => scroll("right")}
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-9 h-9 items-center justify-center bg-[#111111]/60 border border-white/5 rounded-full hover:bg-[#1a1a1a] hover:border-[#2E5CFF]/30 transition-all opacity-40 hover:opacity-100"
              aria-label="Scroll right"
            >
              <svg
                className="w-4 h-4 text-gray-400 hover:text-[#2E5CFF]"
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
          )}
        </div>

        {/* Pagination Dots for Mobile */}
        <div className="flex justify-center gap-2 mt-6 md:hidden">
          {samplePredictions.slice(0, 5).map((_, index) => (
            <div
              key={index}
              className="w-2 h-2 rounded-full bg-white/20"
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
