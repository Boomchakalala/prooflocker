"use client";

import { useState } from "react";
import { Prediction } from "@/lib/storage";

interface PredictionCardProps {
  prediction: Prediction;
}

export default function PredictionCard({ prediction }: PredictionCardProps) {
  const [copied, setCopied] = useState(false);

  const copyHash = async () => {
    await navigator.clipboard.writeText(prediction.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-5 hover:border-[#2a2a2a] transition-colors">
      {/* Header with badge */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-[#e0e0e0] text-[15px] leading-relaxed mb-2">
            {prediction.textPreview}
          </p>
        </div>
        <div className="ml-4">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium whitespace-nowrap">
            <svg
              className="w-3 h-3 mr-1.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Locked on DAG
          </span>
        </div>
      </div>

      {/* Metadata section */}
      <div className="space-y-2.5 mb-4">
        {/* Timestamp */}
        <div className="flex items-center text-sm">
          <span className="text-[#6b6b6b] min-w-[80px]">Locked</span>
          <span className="text-[#a0a0a0]">
            {new Date(prediction.timestamp).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* Hash */}
        <div className="flex items-start text-sm">
          <span className="text-[#6b6b6b] min-w-[80px] pt-0.5">Hash</span>
          <div className="flex-1 flex items-center gap-2">
            <code className="font-mono text-xs text-[#a0a0a0] break-all">
              {prediction.hash.slice(0, 16)}...{prediction.hash.slice(-8)}
            </code>
            <button
              onClick={copyHash}
              className="flex-shrink-0 p-1.5 hover:bg-[#1f1f1f] rounded transition-colors"
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
                  className="w-4 h-4 text-[#6b6b6b]"
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
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-[#1f1f1f]">
        <a
          href={`/verify?proofId=${prediction.proofId}`}
          className="flex-1 text-center px-4 py-2 text-sm font-medium text-[#e0e0e0] bg-[#1a1a1a] hover:bg-[#202020] border border-[#2a2a2a] rounded-lg transition-colors"
        >
          Verify
        </a>
        <button
          onClick={() => {
            const url = `${window.location.origin}/verify?proofId=${prediction.proofId}`;
            navigator.clipboard.writeText(url);
          }}
          className="px-4 py-2 text-sm font-medium text-[#e0e0e0] bg-[#1a1a1a] hover:bg-[#202020] border border-[#2a2a2a] rounded-lg transition-colors"
          title="Copy link"
        >
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
        </button>
      </div>
    </div>
  );
}
