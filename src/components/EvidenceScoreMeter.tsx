"use client";

import { getTierInfo, type EvidenceScoreResult } from "@/lib/evidence-scoring";
import { useState } from "react";

interface EvidenceScoreMeterProps {
  score: number;
  tier: EvidenceScoreResult['tier'];
  breakdown: EvidenceScoreResult['breakdown'];
  variant?: 'compact' | 'detailed';
}

export default function EvidenceScoreMeter({
  score,
  tier,
  breakdown,
  variant = 'compact'
}: EvidenceScoreMeterProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const tierInfo = getTierInfo(tier);

  if (variant === 'compact') {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-white/5 border-white/10">
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${tierInfo.bgColor.replace('/10', '')}`} />
          <span className="text-sm font-semibold text-white">{tierInfo.label}</span>
        </div>
        <span className="text-xs text-neutral-400">{score}/100</span>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs text-neutral-400 mb-1">Evidence Quality</div>
          <div className="flex items-center gap-2">
            <span className={`text-lg font-bold ${tierInfo.color}`}>
              {tierInfo.label}
            </span>
            <span className="text-sm text-neutral-400">· {score}/100</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-white/5 rounded-full overflow-hidden mb-3">
        <div
          className={`absolute inset-y-0 left-0 ${tierInfo.barColor} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Breakdown Toggle */}
      {breakdown.length > 0 && (
        <div>
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
          >
            Why this score?
            <svg
              className={`w-3 h-3 transition-transform ${showBreakdown ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showBreakdown && (
            <ul className="mt-2 space-y-1.5">
              {breakdown.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs">
                  <span className="flex-shrink-0 text-sm">{item.icon}</span>
                  <span className="flex-1 text-neutral-300">{item.text}</span>
                  {item.points > 0 && (
                    <span className="text-neutral-500">+{item.points}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
