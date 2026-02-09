"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { type CardViewModel } from "@/lib/card-view-model";
import { formatRelativeTime } from "@/lib/utils";
import StatusBadge from "./StatusBadge";
import OnChainBadge from "./OnChainBadge";
import { getTierInfo } from "@/lib/user-scoring";

interface UnifiedCardProps {
  card: CardViewModel;
  variant?: "full" | "compact";
  currentUserId?: string | null;
  onViewOnMap?: () => void;
}

export default function UnifiedCard({ card, variant = "full", currentUserId, onViewOnMap }: UnifiedCardProps) {
  const router = useRouter();
  const [hasVoted, setHasVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(card.upvotesCount || 0);
  const [isVoting, setIsVoting] = useState(false);

  const isCompact = variant === "compact";
  const isOsint = card.type === "osint";
  const isClaim = card.type === "claim";
  const authorTierInfo = card.author_reputation_tier ? getTierInfo(card.author_reputation_tier) : null;

  // Truncate title
  const MAX_TITLE_LENGTH = isCompact ? 100 : 150;
  const displayTitle = card.title.length > MAX_TITLE_LENGTH
    ? card.title.slice(0, MAX_TITLE_LENGTH) + "…"
    : card.title;

  const handleVote = async () => {
    if (!currentUserId || isVoting || !card._original?.id) return;

    setIsVoting(true);
    try {
      const response = await fetch(`/api/predictions/${card._original.id}/vote`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Failed to vote');
        return;
      }

      const data = await response.json();
      setHasVoted(data.voted);
      setVoteCount(prev => data.voted ? prev + 1 : Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  const handleViewOnX = () => {
    if (card.sourceUrl) {
      window.open(card.sourceUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Card border style - red for OSINT, purple for claims/predictions
  const getCardBorderStyle = () => {
    if (isOsint) {
      return 'border-red-500/30 bg-red-500/5 hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]';
    }
    if (card.status === 'correct') {
      return 'border-emerald-500/20 bg-white/5 hover:border-emerald-500/30';
    }
    if (card.status === 'incorrect') {
      return 'border-rose-500/20 bg-white/5 hover:border-rose-500/30';
    }
    return 'border-slate-700 bg-white/5 hover:border-purple-500/40';
  };

  // Render compact variant (for Globe)
  if (isCompact) {
    return (
      <div
        onClick={() => router.push(`/proof/${card.publicSlug}`)}
        className={`group relative glass rounded-lg p-3 transition-all duration-200 flex flex-col overflow-hidden border cursor-pointer hover:shadow-lg ${getCardBorderStyle()}`}
      >
        {/* Header */}
        <div className="flex items-start gap-2 mb-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${
            isOsint ? 'bg-gradient-to-br from-red-600 to-red-800' : 'bg-gradient-to-br from-slate-700 to-slate-800'
          }`}>
            {card.authorNumber.toString().slice(-2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* For OSINT: show source name + handle */}
              {isOsint ? (
                <>
                  <span className="text-white text-xs font-medium">{card.source}</span>
                  {card.sourceHandle && (
                    <span className="text-red-400 text-[10px]">{card.sourceHandle}</span>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(`/user/${card.userId || card.anonId}`);
                    }}
                    className="text-white text-xs font-medium hover:text-slate-300 transition-colors"
                  >
                    {card.authorName}
                  </button>
                  {authorTierInfo && (
                    <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${authorTierInfo.bgColor} ${authorTierInfo.color}`}>
                      {authorTierInfo.label}
                    </span>
                  )}
                </>
              )}
              <span className="text-[10px] text-slate-500">•</span>
              <span className="text-[10px] text-slate-500">{formatRelativeTime(card.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Badges row */}
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          {/* Category badge - show OSINT tags or claim category */}
          {card.category && (
            <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${
              isOsint ? 'bg-red-500/10 border border-red-400/30 text-red-300' : 'bg-slate-800/50 text-slate-300'
            }`}>
              {card.category}
            </span>
          )}

          {/* Status badge */}
          <StatusBadge status={card.status} variant="compact" />

          {/* On-chain badge (for claims/predictions, not OSINT) */}
          {!isOsint && <OnChainBadge variant="compact" />}

          {/* OSINT-specific tags */}
          {isOsint && card.tags && card.tags.slice(1, 3).map((tag, i) => (
            <span key={i} className="px-1.5 py-0.5 bg-red-500/10 border border-red-400/20 text-red-400 text-[9px] font-medium rounded">
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3 className={`text-[13px] font-medium leading-snug mb-2 line-clamp-2 ${
          isOsint ? 'text-red-50' : 'text-white'
        }`}>
          {displayTitle}
        </h3>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/50">
          <div className="flex items-center gap-1.5">
            {/* Upvote */}
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVote(); }}
              disabled={!currentUserId || isVoting}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                hasVoted ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800'
              } ${!currentUserId ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
              {voteCount}
            </button>

            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/proof/${card.publicSlug}`); }}
              className="px-2 py-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded text-[11px] font-medium transition-colors"
            >
              View
            </button>

            {/* OSINT-specific: View on X button */}
            {isOsint && card.sourceUrl && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleViewOnX(); }}
                className="px-2 py-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded text-[11px] font-medium transition-colors"
              >
                View on 𝕏
              </button>
            )}

            {/* View on Map button */}
            {onViewOnMap && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onViewOnMap(); }}
                className="px-2 py-1 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded text-[11px] font-medium transition-colors"
              >
                Map
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render full variant (for Feed) - Similar to compact but with more spacing
  return (
    <Link
      href={`/proof/${card.publicSlug}`}
      className={`group relative glass rounded-xl p-5 transition-all duration-300 flex flex-col h-full overflow-hidden border cursor-pointer hover:-translate-y-1 hover:shadow-2xl ${getCardBorderStyle()}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
            isOsint ? 'bg-gradient-to-br from-red-600 to-red-800' : 'bg-gradient-to-br from-slate-700 to-slate-800'
          }`}>
            {card.authorNumber.toString().slice(-2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              {isOsint ? (
                <>
                  <span className="text-white font-medium">{card.source}</span>
                  {card.sourceHandle && (
                    <span className="text-red-400 text-sm">{card.sourceHandle}</span>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(`/user/${card.userId || card.anonId}`);
                    }}
                    className="text-white font-medium hover:text-slate-300 transition-colors"
                  >
                    {card.authorName}
                  </button>
                  {authorTierInfo && (
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${authorTierInfo.bgColor} ${authorTierInfo.color}`}>
                      {authorTierInfo.label}
                    </span>
                  )}
                </>
              )}
            </div>
            <span className="text-xs text-slate-400">{formatRelativeTime(card.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Badges row */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {card.category && (
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md ${
            isOsint ? 'bg-red-500/10 border border-red-400/30 text-red-300' : 'bg-slate-800/50 text-slate-300'
          }`}>
            {card.category}
          </div>
        )}

        <StatusBadge status={card.status} variant="full" />

        {!isOsint && <OnChainBadge variant="full" />}

        {isOsint && card.tags && card.tags.slice(1, 3).map((tag, i) => (
          <span key={i} className="px-2 py-0.5 bg-red-500/10 border border-red-400/20 text-red-400 text-xs font-medium rounded">
            {tag}
          </span>
        ))}
      </div>

      {/* Title */}
      <h3 className={`text-base font-medium leading-relaxed mb-4 ${
        isOsint ? 'text-red-50' : 'text-white'
      }`}>
        {displayTitle}
      </h3>

      {/* Evidence score if resolved */}
      {card.evidence_score !== undefined && card.evidence_score !== null && card.status !== 'pending' && (
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
          <span>Evidence</span>
          <span className="font-semibold text-white">{card.evidence_score}/100</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800 mt-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVote(); }}
            disabled={!currentUserId || isVoting}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${
              hasVoted ? 'text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/15' : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800'
            } ${!currentUserId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
            {voteCount}
          </button>

          {isOsint && card.sourceUrl && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleViewOnX(); }}
              className="px-4 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-medium"
            >
              View on 𝕏
            </button>
          )}
        </div>
        <code className="text-xs text-slate-500 font-mono">{card.hash.slice(0, 12)}...{card.hash.slice(-8)}</code>
      </div>
    </Link>
  );
}
