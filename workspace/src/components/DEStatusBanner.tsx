"use client";

import { useEffect, useState } from "react";

/**
 * Development banner that shows when Digital Evidence API is not configured
 * Only visible when DE keys are missing
 */
export default function DEStatusBanner() {
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if Digital Evidence is enabled
    fetch("/api/de-status")
      .then((res) => res.json())
      .then((data) => setIsEnabled(data.enabled))
      .catch(() => setIsEnabled(false));
  }, []);

  // Don't show anything while loading
  if (isEnabled === null) return null;

  // Don't show banner if DE is enabled
  if (isEnabled) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 glass border border-yellow-500/30 rounded-lg p-3 shadow-lg shadow-yellow-500/10 fade-in">
      <div className="flex items-start gap-3">
        <svg
          className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-yellow-400 mb-1">
            Development Mode
          </p>
          <p className="text-xs text-[#a0a0a0] leading-relaxed">
            Digital Evidence keys not configured. Proofs will remain <span className="text-yellow-400 font-medium">pending</span> until API keys are added. Set <code className="text-[11px] bg-black/30 px-1 py-0.5 rounded">DE_API_KEY</code>, <code className="text-[11px] bg-black/30 px-1 py-0.5 rounded">DE_ORG_ID</code>, and <code className="text-[11px] bg-black/30 px-1 py-0.5 rounded">DE_TENANT_ID</code> in your environment.
          </p>
        </div>
      </div>
    </div>
  );
}
