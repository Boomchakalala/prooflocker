"use client";

import { useState, useEffect } from "react";
import type { EvidenceItem } from "@/lib/evidence-types";
import { formatHashForDisplay } from "@/lib/evidence-hashing";

interface EvidenceListProps {
  predictionId: string;
  evidenceSummary?: string;
  resolutionFingerprint?: string;
  legacyResolutionUrl?: string; // Legacy evidence link from before evidence system
  legacyResolutionNote?: string; // Legacy resolution note
}

export default function EvidenceList({
  predictionId,
  evidenceSummary,
  resolutionFingerprint,
  legacyResolutionUrl,
  legacyResolutionNote,
}: EvidenceListProps) {
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedHash, setCopiedHash] = useState("");

  useEffect(() => {
    fetchEvidenceItems();
  }, [predictionId]);

  const fetchEvidenceItems = async () => {
    try {
      const response = await fetch(`/api/predictions/${predictionId}/evidence`);
      if (!response.ok) {
        throw new Error("Failed to load evidence");
      }
      const data = await response.json();
      setEvidenceItems(data.items || []);
    } catch (err) {
      console.error("Error fetching evidence:", err);
      setError("Failed to load evidence");
    } finally {
      setLoading(false);
    }
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(""), 2000);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-white/5 rounded w-3/4"></div>
        <div className="h-4 bg-white/5 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-sm text-red-400">{error}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Evidence Summary */}
      {evidenceSummary && (
        <div>
          <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">
            Evidence Summary
          </h4>
          <p className="text-sm text-white/90 leading-relaxed">{evidenceSummary}</p>
        </div>
      )}

      {/* Evidence Items */}
      {evidenceItems.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">
            Evidence Items ({evidenceItems.length})
          </h4>
          <div className="space-y-2">
            {evidenceItems.map((item) => {
              const hashDisplay = formatHashForDisplay(item.sha256);
              return (
                <div
                  key={item.id}
                  className="p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded capitalize font-medium">
                          {item.type}
                        </span>
                        {item.sourceKind && (
                          <span className="text-xs text-neutral-500 capitalize">
                            {item.sourceKind}
                          </span>
                        )}
                      </div>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-400 hover:text-blue-300 hover:underline truncate block"
                        >
                          {item.title || item.url}
                        </a>
                      )}
                      {!item.url && item.title && (
                        <div className="text-sm text-white/80">{item.title}</div>
                      )}
                      {item.notes && (
                        <p className="text-xs text-neutral-400 mt-1">{item.notes}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <code className="text-xs text-neutral-500 font-mono">
                          {hashDisplay.truncated}
                        </code>
                        <button
                          onClick={() => copyHash(item.sha256)}
                          className="text-xs text-neutral-400 hover:text-white transition-colors"
                          title="Copy full hash"
                        >
                          {copiedHash === item.sha256 ? (
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legacy Evidence Link (from before evidence system) */}
      {legacyResolutionUrl && evidenceItems.length === 0 && (
        <div>
          <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">
            Evidence Link
          </h4>
          <div className="p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded capitalize font-medium">
                Link
              </span>
              <span className="text-xs text-neutral-500 bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded">
                Legacy
              </span>
            </div>
            <a
              href={legacyResolutionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-400 hover:text-blue-300 hover:underline break-all block"
            >
              {legacyResolutionUrl}
            </a>
            {legacyResolutionNote && (
              <p className="text-xs text-neutral-400 mt-2">{legacyResolutionNote}</p>
            )}
          </div>
          <p className="text-xs text-neutral-500 mt-2 italic">
            This evidence was added before the structured evidence system. Consider migrating to the new format for better verification.
          </p>
        </div>
      )}

      {/* Resolution Fingerprint */}
      {resolutionFingerprint && (
        <div>
          <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">
            Resolution Integrity Hash
          </h4>
          <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
            <div className="flex items-center justify-between gap-3">
              <code className="text-xs text-neutral-300 font-mono break-all flex-1">
                {formatHashForDisplay(resolutionFingerprint).truncated}
              </code>
              <button
                onClick={() => copyHash(resolutionFingerprint)}
                className="text-neutral-400 hover:text-white transition-colors flex-shrink-0"
                title="Copy full hash"
              >
                {copiedHash === resolutionFingerprint ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <p className="text-xs text-neutral-500 mt-2">
              SHA-256 hash of outcome + evidence hashes. Verifies resolution integrity.
            </p>
          </div>
        </div>
      )}

      {evidenceItems.length === 0 && !evidenceSummary && !legacyResolutionUrl && (
        <div className="text-sm text-neutral-500 italic">
          No evidence provided for this resolution
        </div>
      )}
    </div>
  );
}
