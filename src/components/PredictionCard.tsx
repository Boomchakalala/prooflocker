"use client";

import { useState } from "react";
import { Prediction } from "@/lib/storage";
import { formatRelativeTime } from "@/lib/utils";

interface PredictionCardProps {
  prediction: Prediction;
}

export default function PredictionCard({ prediction }: PredictionCardProps) {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const copyHash = async () => {
    await navigator.clipboard.writeText(prediction.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = async () => {
    const url = `${window.location.origin}/verify?proofId=${prediction.proofId}`;
    await navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div className="glass rounded-xl p-5 hover:border-white/10 transition-all card-hover glow-blue">
      {/* Header: Author + Time + Status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">
              {prediction.authorNumber.toString().slice(0, 2)}
            </div>
            <span className="text-sm text-[#888]">
              Anon #{prediction.authorNumber}
            </span>
          </div>
          <span className="text-xs text-[#666]">•</span>
          <span className="text-xs text-[#666]">
            {formatRelativeTime(prediction.timestamp)}
          </span>
        </div>
        <span
          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
            prediction.onChainStatus === "confirmed"
              ? "bg-green-500/10 border border-green-500/30 text-green-400"
              : "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400"
          }`}
        >
          {prediction.onChainStatus === "confirmed"
            ? "Confirmed on-chain"
            : "Pending on-chain"}
        </span>
      </div>

      {/* Prediction text */}
      <p className="text-[#e0e0e0] text-[15px] leading-relaxed mb-4">
        {prediction.textPreview}
      </p>

      {/* Hash section */}
      <div className="glass border border-white/5 rounded-lg p-3 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <label className="block text-xs font-semibold text-[#6b6b6b] mb-1">
              FINGERPRINT
            </label>
            <code className="font-mono text-xs text-[#a0a0a0] break-all">
              {prediction.hash.slice(0, 24)}...{prediction.hash.slice(-16)}
            </code>
          </div>
          <button
            onClick={copyHash}
            className="ml-3 flex-shrink-0 p-2 hover:bg-white/10 rounded transition-colors"
            title="Copy hash"
          >
            {copied ? (
              <svg
                className="w-4 h-4 text-green-500"
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
                className="w-4 h-4 text-[#888]"
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

      {/* Actions */}
      <div className="flex gap-2">
        <a
          href={`/verify?proofId=${prediction.proofId}`}
          className="flex-1 text-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all btn-glow"
        >
          Verify
        </a>
        <button
          onClick={copyLink}
          className="px-4 py-2.5 text-sm font-medium text-[#e0e0e0] bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all flex items-center gap-2"
          title="Copy link"
        >
          {linkCopied ? (
            <>
              <svg
                className="w-4 h-4 text-green-500"
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
                className="w-4 h-4"
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
