"use client";

import { useState, useEffect } from "react";
import type { EvidenceItem } from "@/lib/evidence-types";
import { formatHashForDisplay } from "@/lib/evidence-hashing";

interface EvidenceListProps {
  predictionId: string;
  evidenceSummary?: string;
  resolutionFingerprint?: string;
  legacyResolutionUrl?: string;
  legacyResolutionNote?: string;
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

  const hasEvidence = evidenceItems.length > 0 || legacyResolutionUrl;
  const hasLegacyOnly = legacyResolutionUrl && evidenceItems.length === 0;

  return (
    <div className="space-y-5">
      {/* Resolution Explanation */}
      {(evidenceSummary || legacyResolutionNote) && (
        <div className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center mt-0.5">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-white mb-1">Explanation</h4>
              <p className="text-sm text-white/80 leading-relaxed">
                {evidenceSummary || legacyResolutionNote}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Evidence Items */}
      {hasEvidence ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-white/90">
              Evidence ({evidenceItems.length + (hasLegacyOnly ? 1 : 0)})
            </h4>
            {hasLegacyOnly && (
              <span className="text-xs px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                Legacy Format
              </span>
            )}
          </div>

          <div className="space-y-2">
            {/* New Evidence Items */}
            {evidenceItems.map((item) => {
              const hashDisplay = formatHashForDisplay(item.sha256);
              const iconColor = item.sourceKind === "primary" ? "text-emerald-400" :
                               item.sourceKind === "secondary" ? "text-blue-400" :
                               "text-neutral-400";

              return (
                <div
                  key={item.id}
                  className="group p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/8 hover:border-white/20 transition-all"
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center ${iconColor}`}>
                      {item.type === "link" && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      )}
                      {item.type === "screenshot" && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                      {item.type === "file" && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline block mb-1 break-all"
                        >
                          {item.title || item.url}
                        </a>
                      ) : (
                        <div className="text-sm font-medium text-white/90 mb-1">{item.title}</div>
                      )}

                      {item.notes && (
                        <p className="text-xs text-neutral-400 mb-2">{item.notes}</p>
                      )}

                      {/* Hash */}
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                        <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Integrity Hash</span>
                        <code className="text-xs text-neutral-400 font-mono flex-1">
                          {hashDisplay.truncated}
                        </code>
                        <button
                          onClick={() => copyHash(item.sha256)}
                          className="text-neutral-400 hover:text-white transition-colors p-1"
                          title="Copy full hash"
                        >
                          {copiedHash === item.sha256 ? (
                            <svg className="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Legacy Evidence (if no new evidence items) */}
            {hasLegacyOnly && (
              <div className="group p-4 bg-white/5 border border-amber-500/20 rounded-lg hover:bg-white/8 transition-all">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <a
                      href={legacyResolutionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline block mb-1 break-all"
                    >
                      {legacyResolutionUrl}
                    </a>
                    <p className="text-xs text-neutral-400 italic">
                      Added before structured evidence system. Integrity hash not available.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 bg-white/5 border border-white/10 rounded-lg text-center">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm text-neutral-400 mb-1">No evidence provided</p>
          <p className="text-xs text-neutral-500">Resolution marked without supporting evidence</p>
        </div>
      )}

      {/* Resolution Fingerprint (if evidence exists) */}
      {resolutionFingerprint && hasEvidence && (
        <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h4 className="text-xs font-semibold text-white/90 uppercase tracking-wide">
              Resolution Fingerprint
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <code className="text-xs text-neutral-300 font-mono break-all flex-1">
              {formatHashForDisplay(resolutionFingerprint).truncated}
            </code>
            <button
              onClick={() => copyHash(resolutionFingerprint)}
              className="text-neutral-400 hover:text-white transition-colors p-1 flex-shrink-0"
            >
              {copiedHash === resolutionFingerprint ? (
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Cryptographic proof of resolution integrity
          </p>
        </div>
      )}
    </div>
  );
}
