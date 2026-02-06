"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Prediction, type PredictionOutcome } from "@/lib/storage";
import { formatRelativeTime } from "@/lib/utils";
import { getSiteUrl } from "@/lib/config";
import Link from "next/link";
import ResolveModal from "./ResolveModal";
import ResolutionModalWithEvidence from "./ResolutionModalWithEvidence";
import ContestModal from "./ContestModal";
import OutcomeBadge from "./OutcomeBadge";
import EvidenceGradeBadge from "./EvidenceGradeBadge";
import { getTierInfo, type ReliabilityTier } from "@/lib/user-scoring";
import { getTierInfo as getEvidenceTierInfo } from "@/lib/evidence-scoring";

interface PredictionCardProps {
  prediction: Prediction & {
    // Extended fields from new schema (may not exist on all predictions yet)
    lifecycleStatus?: "draft" | "locked" | "resolved" | "contested" | "final";
    finalOutcome?: PredictionOutcome;
    adminOverridden?: boolean;
    adminNote?: string;
    resolvedBy?: string;
    evidence_score?: number; // New evidence score field (0-100)
    author_reliability_tier?: ReliabilityTier; // Author's reliability tier
  };
  currentUserId?: string | null; // Current authenticated user ID
  onOutcomeUpdate?: () => void; // Callback to refresh predictions
  onHide?: (id: string) => void; // Callback to hide prediction
  isPreview?: boolean; // If true, renders as non-clickable mockup for landing page
}

export default function PredictionCard({ prediction, currentUserId, onOutcomeUpdate, onHide, isPreview = false }: PredictionCardProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showContestModal, setShowContestModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReportMenu, setShowReportMenu] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(0);
  const [isVoting, setIsVoting] = useState(false);

  // Fallback for older predictions without authorNumber
  const authorNumber = prediction.authorNumber || 1000;
  const onChainStatus = prediction.onChainStatus || "pending";
  const isClaimed = !!prediction.userId;
  const isOwner = currentUserId && prediction.userId === currentUserId;
  const isResolved = prediction.outcome === "correct" || prediction.outcome === "incorrect";

  // Fetch vote status on mount if user is authenticated and prediction is resolved
  useEffect(() => {
    if (currentUserId && isResolved && !isPreview) {
      fetchVoteStatus();
    }
  }, [currentUserId, isResolved, isPreview, prediction.id]);

  const fetchVoteStatus = async () => {
    try {
      const response = await fetch(`/api/predictions/${prediction.id}/vote`);
      if (response.ok) {
        const data = await response.json();
        setHasVoted(data.voted);
        setVoteCount(data.voteCount);
      }
    } catch (error) {
      console.error('Error fetching vote status:', error);
    }
  };

  const handleVote = async () => {
    if (!currentUserId || isVoting) return;

    setIsVoting(true);
    try {
      const response = await fetch(`/api/predictions/${prediction.id}/vote`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Failed to vote');
        return;
      }

      const data = await response.json();
      setHasVoted(data.voted);

      // Update vote count locally
      if (data.voted) {
        setVoteCount(prev => prev + 1);
      } else {
        setVoteCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  const copyHash = async () => {
    await navigator.clipboard.writeText(prediction.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = async () => {
    const url = `${getSiteUrl()}/proof/${prediction.publicSlug}`;

    // Try native share on mobile devices
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ProofLocker Prediction',
          text: prediction.textPreview,
          url: url
        });
        // Track share after successful share
        trackShare(prediction.id);
        return; // Success, don't show copied state
      } catch (err) {
        // User cancelled or share failed, fall back to copy
        if ((err as Error).name === 'AbortError') {
          return; // User cancelled, don't copy
        }
      }
    }

    // Fallback to clipboard copy
    await navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);

    // Track share after copy
    trackShare(prediction.id);
  };

  const trackShare = async (predictionId: string) => {
    try {
      await fetch('/api/analytics/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ predictionId }),
      });
    } catch (error) {
      console.error('Error tracking share:', error);
      // Don't show error to user, just log it
    }
  };

  const handleResolveClick = () => {
    // Always navigate to the full resolve page (consistent with proof page behavior)
    router.push(`/resolve/${prediction.id}`);
  };

  const handleReport = async (reason: string) => {
    try {
      await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          predictionId: prediction.id,
          reason,
        }),
      });
      setShowMenu(false);
      setShowReportMenu(false);
      alert('Thank you for your report. We will review this prediction.');
    } catch (error) {
      console.error('Error reporting:', error);
      alert('Failed to submit report. Please try again.');
    }
  };

  const handleHide = () => {
    if (onHide) {
      onHide(prediction.id);
    }
    setShowMenu(false);
  };

  // Determine on-chain status
  const isOnChain = () => {
    const deStatus = prediction.deStatus?.toUpperCase();
    return deStatus === "CONFIRMED" || onChainStatus === "confirmed";
  };

  // Determine if resolution is on-chain
  const isResolutionOnChain = () => {
    // Show "Resolved on-chain" if prediction is resolved (has resolvedAt timestamp or resolutionDeStatus confirmed)
    if (!isResolved) return false;

    const resolutionDeStatus = prediction.resolutionDeStatus?.toUpperCase();
    const hasResolvedTimestamp = !!prediction.resolvedAt;
    const hasResolvedTx = resolutionDeStatus === "CONFIRMED";

    return hasResolvedTimestamp || hasResolvedTx;
  };

  // Determine if user can resolve (owner and still pending)
  const canResolve = isOwner && prediction.outcome === "pending";
  const isPending = prediction.outcome === "pending";

  // Truncate title to max 150 characters
  const MAX_TITLE_LENGTH = 150;
  const displayTitle = prediction.textPreview.length > MAX_TITLE_LENGTH
    ? prediction.textPreview.slice(0, MAX_TITLE_LENGTH) + "…"
    : prediction.textPreview;

  // Helper to get category styling - Subtle professional colors
  const getCategoryStyle = (category: string) => {
    switch (category.toLowerCase()) {
      case 'crypto':
        return 'bg-blue-500/10 border-blue-400/30 text-blue-300';
      case 'sports':
        return 'bg-orange-500/10 border-orange-400/30 text-orange-300';
      case 'tech':
        return 'bg-slate-500/10 border-slate-400/30 text-slate-300';
      case 'personal':
        return 'bg-violet-500/10 border-violet-400/30 text-violet-300';
      case 'politics':
        return 'bg-rose-500/10 border-rose-400/30 text-rose-300';
      case 'markets':
        return 'bg-emerald-500/10 border-emerald-400/30 text-emerald-300';
      case 'osint':
        return 'bg-indigo-500/10 border-indigo-400/30 text-indigo-300';
      case 'culture':
        return 'bg-pink-500/10 border-pink-400/30 text-pink-300';
      case 'other':
      default:
        return 'bg-stone-500/10 border-stone-400/30 text-stone-300';
    }
  };

  // Helper to get category icon
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'crypto':
        return (
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.89.66 1.96 1.64h1.71c-.08-1.49-1.13-2.79-2.67-3.15V5h-2v1.5c-1.52.37-2.67 1.41-2.67 2.95 0 1.88 1.55 2.81 3.81 3.39 2.02.53 2.41 1.3 2.41 2.14 0 .68-.42 1.43-2.1 1.43-1.69 0-2.31-.72-2.4-1.64H8.41c.1 1.7 1.36 2.66 2.92 3.01V19h2v-1.5c1.52-.37 2.68-1.33 2.68-2.97 0-2.32-1.81-3.13-3.7-3.39z"/>
          </svg>
        );
      case 'sports':
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 2a10 10 0 0 0 0 20M12 2a10 10 0 0 1 0 20M2 12h20"/>
          </svg>
        );
      case 'tech':
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <path d="M8 21h8M12 17v4"/>
          </svg>
        );
      case 'politics':
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
        );
      case 'markets':
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
          </svg>
        );
      case 'osint':
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/>
          </svg>
        );
      case 'personal':
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        );
      case 'culture':
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
          </svg>
        );
      default:
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
          </svg>
        );
    }
  };

  // Get evidence tier info if score exists
  const evidenceTier = prediction.evidence_score ?
    getEvidenceTierInfo(
      prediction.evidence_score >= 76 ? 'strong' :
      prediction.evidence_score >= 51 ? 'solid' :
      prediction.evidence_score >= 26 ? 'basic' : 'unverified'
    ) : null;

  // Get author reliability tier info
  const authorTierInfo = prediction.author_reliability_tier ?
    getTierInfo(prediction.author_reliability_tier) : null;

  // Handler for view button click
  const handleViewClick = (e: React.MouseEvent) => {
    if (isPreview) {
      e.preventDefault();
      return;
    }
    // Navigate to proof page
    router.push(`/proof/${prediction.publicSlug}`);
  };

  // Determine card border style - Clean professional styling like V4
  const getCardBorderStyle = () => {
    if (prediction.outcome === 'correct') {
      return 'border-emerald-500/20 bg-white/5 shadow-sm hover:shadow-md transition-all';
    }
    if (prediction.outcome === 'incorrect') {
      return 'border-rose-500/20 bg-white/5 shadow-sm hover:shadow-md transition-all';
    }
    // Pending
    return 'border-slate-700 bg-white/5 shadow-sm hover:shadow-md transition-all';
  };

  // Card content (shared between Link and div versions)
  const cardContent = (
    <>
      {/* Header - V4 format */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white text-sm font-semibold">
            {authorNumber.toString().slice(-2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              {isPreview ? (
                <span className="text-white font-medium">Anon #{authorNumber}</span>
              ) : (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push(`/user/${prediction.userId || prediction.anonId}`);
                  }}
                  className="text-white font-medium hover:text-slate-300 transition-colors"
                >
                  Anon #{authorNumber}
                </button>
              )}
              {authorTierInfo && (
                <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${authorTierInfo.bgColor} ${authorTierInfo.color}`}>
                  {authorTierInfo.label}
                </span>
              )}
            </div>
            <span className="text-xs text-slate-400">{formatRelativeTime(prediction.timestamp)}</span>
          </div>
        </div>

        {/* Right side verified/on-chain badges or menu */}
        {!isPreview && (
          <div className="relative flex-shrink-0">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 text-gray-400 hover:text-gray-200" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(false); }} />
              <div className="absolute right-0 top-full mt-1 w-48 bg-[#1a1a1a] border border-slate-700 rounded-lg shadow-lg z-50 py-1">
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleHide(); }} className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                  Hide this
                </button>
                <div className="relative">
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowReportMenu(!showReportMenu); }} className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Report
                    </div>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  {showReportMenu && (
                    <div className="absolute left-full top-0 ml-1 w-40 bg-[#1a1a1a] border border-slate-700 rounded-lg shadow-lg py-1">
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleReport('spam'); }} className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-slate-800 transition-colors">Spam</button>
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleReport('low_quality'); }} className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-slate-800 transition-colors">Low Quality</button>
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleReport('inappropriate'); }} className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-slate-800 transition-colors">Inappropriate</button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          </div>
        )}
      </div>

      {/* Category - V4 format: single badge no icon */}
      {prediction.category && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/50 text-slate-300 text-xs font-medium rounded-md mb-3">
          {prediction.category}
        </div>
      )}

      {/* Title - V4 format */}
      <h3 className="text-white text-base font-medium leading-relaxed mb-4">
        {displayTitle}
      </h3>

      {/* Status & Evidence - V4 format */}
      <div className="flex items-center gap-4 mb-4">
        {prediction.outcome === 'correct' ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 text-sm font-medium rounded-lg">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
            Correct
          </div>
        ) : prediction.outcome === 'incorrect' ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 text-rose-400 text-sm font-medium rounded-lg">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Incorrect
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-400 text-sm font-medium rounded-lg">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
            </svg>
            Pending
          </div>
        )}

        {/* Evidence Score - V4 format: "Evidence 94/100" */}
        {prediction.evidence_score !== undefined && prediction.evidence_score !== null && isResolved && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Evidence</span>
            <span className="font-semibold text-white">{prediction.evidence_score}/100</span>
          </div>
        )}
      </div>

      {/* Footer - V4 format */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800">
        <div className="flex items-center gap-3">
          {/* Upvote button - only for resolved predictions */}
          {isResolved && !isPreview && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVote(); }}
              disabled={!currentUserId || isVoting || isOwner}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${
                hasVoted ? 'text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/15' : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800'
              } ${(!currentUserId || isOwner) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              title={!currentUserId ? 'Sign in to vote' : isOwner ? 'Cannot vote on your own prediction' : hasVoted ? 'Remove upvote' : 'Upvote this prediction'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
              {voteCount}
            </button>
          )}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleViewClick(e); }}
            className={`px-4 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium ${isPreview ? 'cursor-default opacity-60' : 'cursor-pointer'}`}
          >
            View
          </button>
        </div>
        <code className="text-xs text-slate-500 font-mono">{prediction.hash.slice(0, 12)}...{prediction.hash.slice(-8)}</code>
      </div>
      {/* Resolve Modal */}
      {showResolveModal && (
        <ResolutionModalWithEvidence
          predictionId={prediction.id}
          currentOutcome={prediction.outcome}
          currentNote={prediction.resolutionNote}
          currentUrl={prediction.resolutionUrl}
          onClose={() => setShowResolveModal(false)}
          onSuccess={() => {
            setShowResolveModal(false);
            onOutcomeUpdate?.();
          }}
        />
      )}

      {/* Contest Modal */}
      {showContestModal && (
        <ContestModal
          predictionId={prediction.id}
          predictionText={prediction.textPreview}
          onClose={() => setShowContestModal(false)}
          onSuccess={() => {
            setShowContestModal(false);
            onOutcomeUpdate?.();
          }}
        />
      )}
    </>
  );

  // Render as non-clickable div for preview mode (landing page)
  if (isPreview) {
    return (
      <div className={`group relative glass rounded-xl p-5 transition-all duration-300 flex flex-col h-full overflow-hidden border ${getCardBorderStyle()}`}>
        {cardContent}
      </div>
    );
  }

  // Render as Link for feed page (clickable)
  return (
    <Link
      href={`/proof/${prediction.publicSlug}`}
      className={`group relative glass rounded-xl p-5 transition-all duration-300 flex flex-col h-full overflow-hidden border cursor-pointer hover:-translate-y-1 hover:shadow-2xl ${getCardBorderStyle()}`}
    >
      {cardContent}
    </Link>
  );
}
