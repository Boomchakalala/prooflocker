"use client";

import { useState } from "react";
import { Prediction, type PredictionOutcome } from "@/lib/storage";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";
import ResolveModal from "./ResolveModal";
import ContestModal from "./ContestModal";

interface PredictionCardProps {
  prediction: Prediction & {
    // Extended fields from new schema (may not exist on all predictions yet)
    lifecycleStatus?: "draft" | "locked" | "resolved" | "contested" | "final";
    finalOutcome?: PredictionOutcome;
    adminOverridden?: boolean;
    adminNote?: string;
    resolvedBy?: string;
  };
  currentUserId?: string | null; // Current authenticated user ID
  onOutcomeUpdate?: () => void; // Callback to refresh predictions
}

export default function PredictionCard({ prediction, currentUserId, onOutcomeUpdate }: PredictionCardProps) {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showContestModal, setShowContestModal] = useState(false);

  // Fallback for older predictions without authorNumber
  const authorNumber = prediction.authorNumber || 1000;
  const onChainStatus = prediction.onChainStatus || "pending";
  const isClaimed = !!prediction.userId;
  const isOwner = currentUserId && prediction.userId === currentUserId;
  const lifecycleStatus = prediction.lifecycleStatus || "locked";
  const displayOutcome = prediction.adminOverridden ? prediction.finalOutcome : prediction.outcome;

  const getOutcomeLabel = (outcome: PredictionOutcome): string => {
    if (outcome === "correct") return "True";
    if (outcome === "incorrect") return "False";
    if (outcome === "invalid") return "Invalid";
    return "Pending";
  };

  const getOutcomeClass = (outcome: PredictionOutcome): string => {
    if (outcome === "correct") return "bg-green-500/10 border border-green-500/30 text-green-400";
    if (outcome === "incorrect") return "bg-red-500/10 border border-red-500/30 text-red-400";
    if (outcome === "invalid") return "bg-gray-500/10 border border-gray-500/30 text-gray-400";
    return "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400";
  };

  // Get lifecycle status badge
  const getLifecycleStatusBadge = () => {
    switch (lifecycleStatus) {
      case "locked":
        return {
          label: "Locked",
          className: "bg-blue-500/10 border border-blue-500/30 text-blue-400",
        };
      case "resolved":
        return {
          label: "Resolved",
          className: "bg-green-500/10 border border-green-500/30 text-green-400",
        };
      case "contested":
        return {
          label: "Contested",
          className: "bg-orange-500/10 border border-orange-500/30 text-orange-400",
        };
      case "final":
        return {
          label: "Final",
          className: "bg-purple-500/10 border border-purple-500/30 text-purple-400 ring-1 ring-purple-500/20",
        };
      default:
        return {
          label: "Locked",
          className: "bg-blue-500/10 border border-blue-500/30 text-blue-400",
        };
    }
  };

  // Determine on-chain status display based on deStatus
  const getOnChainStatusDisplay = () => {
    const deStatus = prediction.deStatus?.toUpperCase();

    if (deStatus) {
      if (deStatus === "CONFIRMED") {
        return {
          label: "On-chain",
          className: "bg-green-500/10 border border-green-500/30 text-green-400",
        };
      } else if (deStatus === "PENDING" || deStatus === "NEW") {
        return {
          label: "Pending",
          className: "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400",
        };
      } else if (deStatus === "FAILED" || deStatus === "REJECTED") {
        return {
          label: "Failed",
          className: "bg-red-500/10 border border-red-500/30 text-red-400",
        };
      }
    }

    if (onChainStatus === "confirmed") {
      return {
        label: "On-chain",
        className: "bg-green-500/10 border border-green-500/30 text-green-400",
      };
    }

    return {
      label: "Pending",
      className: "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400",
    };
  };

  const onChainStatusDisplay = getOnChainStatusDisplay();
  const lifecycleStatusBadge = getLifecycleStatusBadge();

  const copyHash = async () => {
    await navigator.clipboard.writeText(prediction.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = async () => {
    const url = `${window.location.origin}/proof/${prediction.publicSlug}`;
    await navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // Check if prediction is new (within last 5 minutes)
  const isNew = () => {
    const now = new Date();
    const past = new Date(prediction.timestamp);
    const diffMs = now.getTime() - past.getTime();
    return diffMs < 5 * 60 * 1000; // 5 minutes
  };

  // Determine if user can resolve (owner and not finalized)
  const canResolve = isOwner && lifecycleStatus !== "final";

  // Determine if user can contest (authenticated, not owner, prediction is resolved/contested)
  const canContest =
    currentUserId &&
    !isOwner &&
    (lifecycleStatus === "resolved" || lifecycleStatus === "contested");

  return (
    <div
      className={`glass rounded-xl p-4 hover:border-white/10 transition-all card-hover glow-blue h-full flex flex-col ${
        isNew() ? "ring-1 ring-blue-500/20" : ""
      }`}
    >
      {/* Header: Author + Time + Status Badges */}
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">
              {authorNumber.toString().slice(0, 2)}
            </div>
            <span className="text-xs text-[#888]">Anon #{authorNumber}</span>
          </div>
          <span className="text-xs text-[#666]">•</span>
          <span
            className={`text-xs ${
              isNew() ? "text-blue-400 font-medium" : "text-[#666]"
            }`}
          >
            {formatRelativeTime(prediction.timestamp)}
          </span>
          {isClaimed && (
            <>
              <span className="text-xs text-[#666]">•</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-500/10 border border-blue-500/30 text-blue-400">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Claimed
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Lifecycle status badge */}
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${lifecycleStatusBadge.className}`}
          >
            {lifecycleStatusBadge.label}
          </span>
          {/* On-chain status badge */}
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${onChainStatusDisplay.className}`}
          >
            {onChainStatusDisplay.label}
          </span>
        </div>
      </div>

      {/* Prediction text - MOST PROMINENT */}
      <p className="text-[#e0e0e0] text-base leading-relaxed mb-3 font-medium">
        {prediction.textPreview}
      </p>

      {/* Outcome section */}
      {isClaimed && (
        <div className="mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[#888]">Outcome:</span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${getOutcomeClass(
                displayOutcome || "pending"
              )}`}
            >
              {getOutcomeLabel(displayOutcome || "pending")}
              {prediction.adminOverridden && (
                <svg
                  className="w-3 h-3 ml-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  title="Admin finalized"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </span>
          </div>

          {/* Resolution note */}
          {prediction.resolutionNote && (
            <div className="mt-2 p-2 bg-white/5 border border-white/10 rounded-lg">
              <p className="text-xs text-[#888] mb-1">Resolution note:</p>
              <p className="text-sm text-[#e0e0e0]">{prediction.resolutionNote}</p>
            </div>
          )}

          {/* Resolution URL */}
          {prediction.resolutionUrl && (
            <div className="mt-2">
              <a
                href={prediction.resolutionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 underline flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Evidence
              </a>
            </div>
          )}

          {/* Admin note */}
          {prediction.adminOverridden && prediction.adminNote && (
            <div className="mt-2 p-2 bg-purple-500/5 border border-purple-500/20 rounded-lg">
              <p className="text-xs text-purple-400 mb-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Admin note:
              </p>
              <p className="text-sm text-[#e0e0e0]">{prediction.adminNote}</p>
            </div>
          )}
        </div>
      )}

      {/* Accountability line */}
      <p className="text-[10px] text-[#666] mb-3 flex items-center gap-1">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
        Publicly locked • Verifiable forever
      </p>

      {/* Hash section - SOFTER ON MOBILE */}
      <div className="bg-black/20 border border-white/5 rounded-lg p-2.5 mb-3 sm:block hidden">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-semibold text-[#666] mb-1 uppercase tracking-wider">
              Fingerprint
            </label>
            <code className="font-mono text-[11px] text-[#999] break-all">
              {prediction.hash.slice(0, 24)}...{prediction.hash.slice(-16)}
            </code>
          </div>
          <button
            onClick={copyHash}
            className="ml-2 flex-shrink-0 p-1.5 hover:bg-white/10 rounded transition-colors"
            title="Copy fingerprint"
          >
            {copied ? (
              <svg
                className="w-3.5 h-3.5 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-3.5 h-3.5 text-[#888]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-2 mt-auto">
        {/* Primary actions: Resolve / Contest */}
        {(canResolve || canContest) && (
          <div className="flex gap-2">
            {canResolve && (
              <button
                onClick={() => setShowResolveModal(true)}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-600/80 to-emerald-600/80 hover:from-green-600 hover:to-emerald-600 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Resolve
              </button>
            )}
            {canContest && (
              <button
                onClick={() => setShowContestModal(true)}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-600/80 to-red-600/80 hover:from-orange-600 hover:to-red-600 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Contest
              </button>
            )}
          </div>
        )}

        {/* Secondary actions: View Proof + Share */}
        <div className="flex gap-2">
          <Link
            href={`/proof/${prediction.publicSlug}`}
            className="flex-1 text-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-600 hover:to-purple-600 rounded-lg transition-all"
            title="View permanent proof page"
          >
            View Proof
          </Link>
          <button
            onClick={copyLink}
            className="px-3 py-2 text-sm font-medium text-[#888] bg-white/5 hover:bg-white/10 hover:text-[#e0e0e0] border border-white/10 rounded-lg transition-all flex items-center gap-1.5"
            title="Copy link"
          >
            {linkCopied ? (
              <>
                <svg
                  className="w-3.5 h-3.5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-green-500 text-xs">Copied</span>
              </>
            ) : (
              <>
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                <span className="text-xs">Share</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Resolve Modal */}
      {showResolveModal && (
        <ResolveModal
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
    </div>
  );
}
