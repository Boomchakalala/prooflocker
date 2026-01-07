"use client";

import { useState } from "react";
import { Prediction } from "@/lib/storage";
import { formatRelativeTime } from "@/lib/utils";
import OutcomeDropdown from "./OutcomeDropdown";
import Link from "next/link";

interface PredictionCardProps {
  prediction: Prediction;
  currentUserId?: string | null; // Current authenticated user ID
  onOutcomeUpdate?: () => void; // Callback to refresh predictions
}

export default function PredictionCard({ prediction, currentUserId, onOutcomeUpdate }: PredictionCardProps) {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Fallback for older predictions without authorNumber
  const authorNumber = prediction.authorNumber || 1000;
  const onChainStatus = prediction.onChainStatus || "pending";
  const isClaimed = !!prediction.userId;
  const isOwner = currentUserId && prediction.userId === currentUserId;

  // Determine status display based on deStatus (more accurate than onChainStatus)
  const getStatusDisplay = () => {
    const deStatus = prediction.deStatus?.toUpperCase();

    // If we have a DE status, use it for accurate display
    if (deStatus) {
      if (deStatus === "CONFIRMED") {
        return {
          label: "Confirmed on-chain",
          color: "green",
          className: "bg-green-500/10 border border-green-500/30 text-green-400",
        };
      } else if (deStatus === "PENDING" || deStatus === "NEW") {
        return {
          label: "Pending on-chain",
          color: "yellow",
          className: "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400",
        };
      } else if (deStatus === "FAILED" || deStatus === "REJECTED") {
        return {
          label: "Failed on-chain",
          color: "red",
          className: "bg-red-500/10 border border-red-500/30 text-red-400",
        };
      }
    }

    // Fallback to onChainStatus for older predictions
    if (onChainStatus === "confirmed") {
      return {
        label: "Confirmed on-chain",
        color: "green",
        className: "bg-green-500/10 border border-green-500/30 text-green-400",
      };
    }

    return {
      label: "Pending on-chain",
      color: "yellow",
      className: "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400",
    };
  };

  const statusDisplay = getStatusDisplay();

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

  return (
    <div className={`glass rounded-xl p-4 hover:border-white/10 transition-all card-hover glow-blue ${isNew() ? 'ring-1 ring-blue-500/20' : ''}`}>
      {/* Header: Author + Time + Status + Claimed + Outcome */}
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">
              {authorNumber.toString().slice(0, 2)}
            </div>
            <span className="text-xs text-[#888]">
              Anon #{authorNumber}
            </span>
          </div>
          <span className="text-xs text-[#666]">•</span>
          <span className={`text-xs ${isNew() ? 'text-blue-400 font-medium' : 'text-[#666]'}`}>
            {formatRelativeTime(prediction.timestamp)}
          </span>
          {isClaimed && (
            <>
              <span className="text-xs text-[#666]">•</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-500/10 border border-blue-500/30 text-blue-400">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Claimed
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${statusDisplay.className}`}
          >
            {statusDisplay.label}
          </span>
        </div>
      </div>

      {/* Prediction text - MOST PROMINENT */}
      <p className="text-[#e0e0e0] text-base leading-relaxed mb-2 font-medium">
        {prediction.textPreview}
      </p>

      {/* Outcome section - only for claimed predictions */}
      {isClaimed && (
        <div className="mb-2">
          {isOwner ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#888]">Outcome:</span>
              <OutcomeDropdown
                predictionId={prediction.id}
                currentOutcome={prediction.outcome}
                onOutcomeChange={onOutcomeUpdate}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#888]">Outcome:</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                prediction.outcome === 'correct' ? 'bg-green-500/10 border border-green-500/30 text-green-400' :
                prediction.outcome === 'incorrect' ? 'bg-red-500/10 border border-red-500/30 text-red-400' :
                prediction.outcome === 'invalid' ? 'bg-gray-500/10 border border-gray-500/30 text-gray-400' :
                'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400'
              }`}>
                {prediction.outcome.charAt(0).toUpperCase() + prediction.outcome.slice(1)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Accountability line */}
      <p className="text-[10px] text-[#666] mb-3 flex items-center gap-1">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        Locked publicly. Cannot be edited. Ever.
      </p>

      {/* Hash section - LIGHTER/MONOSPACE */}
      <div className="bg-black/20 border border-white/5 rounded-lg p-2.5 mb-3">
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

      {/* Actions - PRIMARY Verify, SECONDARY Share */}
      <div className="flex gap-2">
        <Link
          href={`/proof/${prediction.publicSlug}`}
          className="flex-1 text-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all btn-glow"
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
  );
}
