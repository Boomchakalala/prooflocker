"use client";

import { useState } from "react";
import type { PredictionOutcome } from "@/lib/storage";
import type { EvidenceGrade, EvidenceItemInput } from "@/lib/evidence-types";
import { EvidenceGradeInfo, validateEvidenceRequirements } from "@/lib/evidence-types";
import { sha256Url, sha256File } from "@/lib/evidence-hashing";
import { getAccessToken } from "@/lib/auth";

interface ResolutionModalWithEvidenceProps {
  predictionId: string;
  currentOutcome: PredictionOutcome;
  currentNote?: string;
  currentUrl?: string;
  onClose: () => void;
  onSuccess: (outcome: PredictionOutcome) => void;
}

export default function ResolutionModalWithEvidence({
  predictionId,
  currentOutcome,
  currentNote,
  currentUrl,
  onClose,
  onSuccess,
}: ResolutionModalWithEvidenceProps) {
  const [outcome, setOutcome] = useState<"correct" | "incorrect">(
    currentOutcome === "incorrect" ? "incorrect" : "correct"
  );
  const [resolutionNote, setResolutionNote] = useState(currentNote || "");
  const [resolutionUrl, setResolutionUrl] = useState(currentUrl || "");

  // Evidence fields
  const [evidenceGrade, setEvidenceGrade] = useState<EvidenceGrade>("D");
  const [evidenceSummary, setEvidenceSummary] = useState("");
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItemInput[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);

  // Add link evidence
  const [showAddLink, setShowAddLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");

  const maxNoteChars = 280;
  const maxSummaryChars = 280;

  const handleAddLink = () => {
    if (!linkUrl.trim()) {
      setError("Please enter a valid URL");
      return;
    }

    try {
      new URL(linkUrl); // Validate URL
    } catch {
      setError("Invalid URL format");
      return;
    }

    setEvidenceItems([...evidenceItems, {
      type: "link",
      url: linkUrl.trim(),
      title: linkTitle.trim() || undefined,
      sourceKind: "secondary",
    }]);

    setLinkUrl("");
    setLinkTitle("");
    setShowAddLink(false);
    setError("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "application/pdf", "text/plain"];
    if (!allowedTypes.includes(file.type)) {
      setError("File type not supported. Use PNG, JPG, WEBP, PDF, or TXT");
      return;
    }

    setUploadingFile(true);
    setError("");

    try {
      // Upload file to server first
      const token = await getAccessToken();
      if (!token) {
        throw new Error("You must be logged in to upload files");
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('predictionId', predictionId);

      const uploadResponse = await fetch('/api/evidence/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }

      const uploadData = await uploadResponse.json();

      // Add uploaded file info to evidence items
      setEvidenceItems([...evidenceItems, {
        type: "file",
        url: uploadData.publicUrl,
        title: file.name,
        sourceKind: "secondary",
        hash: uploadData.hash,
        mimeType: uploadData.mimeType,
        fileSizeBytes: uploadData.fileSize,
      }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleRemoveEvidence = (index: number) => {
    setEvidenceItems(evidenceItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate evidence requirements
      const validation = validateEvidenceRequirements(
        evidenceGrade,
        evidenceSummary,
        evidenceItems.length
      );

      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Prepare evidence items with hashes
      const evidenceItemsWithHashes = await Promise.all(
        evidenceItems.map(async (item) => {
          if (item.type === "link" && item.url) {
            const hash = item.hash || await sha256Url(item.url);
            return { ...item, hash };
          } else if (item.type === "file") {
            // File already uploaded with hash
            return item;
          }
          return item;
        })
      );

      // Get access token for authentication
      const token = await getAccessToken();

      if (!token) {
        throw new Error("You must be logged in to resolve a claim");
      }

      const response = await fetch(`/api/predictions/${predictionId}/resolve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          outcome,
          resolutionNote: resolutionNote.trim() || undefined,
          resolutionUrl: resolutionUrl.trim() || undefined,
          evidenceGrade,
          evidenceSummary: evidenceSummary.trim() || undefined,
          evidenceItems: evidenceItemsWithHashes,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update resolution");
      }

      onSuccess(outcome);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update resolution");
    } finally {
      setLoading(false);
    }
  };

  const gradeInfo = EvidenceGradeInfo[evidenceGrade];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[500] p-4 overflow-y-auto">
      <div className="glass border border-white/10 rounded-2xl max-w-3xl w-full shadow-2xl my-8 bg-gradient-to-br from-slate-900/95 to-slate-800/95 pb-[env(safe-area-inset-bottom)]">
        <div className="p-6 md:p-8 border-b border-white/10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-white">Resolve Claim</h2>
              <p className="text-sm text-neutral-400 mt-1">
                Add evidence to boost your reputation score
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Outcome selection */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-3">
              Outcome
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setOutcome("correct")}
                className={`flex-1 px-4 py-3 rounded-lg border transition-all text-sm font-semibold ${
                  outcome === "correct"
                    ? "bg-green-500/15 border-green-500/50 text-green-300 ring-1 ring-green-500/30"
                    : "bg-white/[0.03] border-white/[0.08] text-white/60 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                Correct
              </button>
              <button
                type="button"
                onClick={() => setOutcome("incorrect")}
                className={`flex-1 px-4 py-3 rounded-lg border transition-all text-sm font-semibold ${
                  outcome === "incorrect"
                    ? "bg-red-500/15 border-red-500/50 text-red-300 ring-1 ring-red-500/30"
                    : "bg-white/[0.03] border-white/[0.08] text-white/60 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                Incorrect
              </button>
            </div>
          </div>

          {/* Evidence Grade */}
          <div className="border border-blue-500/20 bg-blue-500/5 rounded-lg p-4">
            <label className="block text-sm font-semibold text-white mb-2">
              Evidence Quality Grade
            </label>
            <p className="text-xs text-neutral-400 mb-3">
              No receipts = no reputation. Evidence boosts your score.
            </p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {(["A", "B", "C", "D"] as EvidenceGrade[]).map((grade) => {
                const info = EvidenceGradeInfo[grade];
                return (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => setEvidenceGrade(grade)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      evidenceGrade === grade
                        ? "bg-white/10 border-white/30 ring-1 ring-white/20"
                        : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/15"
                    }`}
                  >
                    <div className="font-bold text-white text-sm mb-0.5">{info.label.split(" ")[0]}</div>
                    <div className="text-[10px] text-neutral-400 line-clamp-1">{info.label.split(" ").slice(1).join(" ")}</div>
                  </button>
                );
              })}
            </div>
            <div className="text-xs p-2 rounded bg-white/5 text-neutral-300 border border-white/10">
              Selected: {gradeInfo.label}
            </div>
          </div>

          {/* Evidence Summary */}
          {(evidenceGrade === "A" || evidenceGrade === "B") && (
            <div>
              <label htmlFor="summary" className="block text-sm font-medium text-white/90 mb-2">
                Evidence Summary <span className="text-red-400">*</span>
              </label>
              <textarea
                id="summary"
                value={evidenceSummary}
                onChange={(e) => setEvidenceSummary(e.target.value)}
                maxLength={maxSummaryChars}
                rows={3}
                required
                placeholder="Explain why this evidence proves your claim..."
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm resize-none transition-all"
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-neutral-500">Required for Grade A/B</span>
                <span
                  className={`text-xs ${
                    evidenceSummary.length > maxSummaryChars - 20 ? "text-red-400" : "text-neutral-400"
                  }`}
                >
                  {evidenceSummary.length}/{maxSummaryChars}
                </span>
              </div>
            </div>
          )}

          {/* Evidence Items */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Evidence Items
              {evidenceGrade !== "D" && <span className="text-red-400 ml-1">* (min 1)</span>}
            </label>

            {/* Evidence items list */}
            {evidenceItems.length > 0 && (
              <div className="space-y-2 mb-3">
                {evidenceItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white truncate">
                        {item.type === "link" ? (
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline">
                            {item.title || item.url}
                          </a>
                        ) : (
                          <span>{item.title}</span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-500 capitalize">{item.type}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveEvidence(index)}
                      className="text-red-400 hover:text-red-300 p-1.5 hover:bg-white/10 rounded transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add evidence buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddLink(!showAddLink)}
                className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg text-sm font-medium transition-all"
              >
                + Add Link
              </button>
              <label className="flex-1">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept="image/*,.pdf,.txt"
                  className="hidden"
                  disabled={uploadingFile}
                />
                <div className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg text-sm font-medium transition-all text-center cursor-pointer">
                  {uploadingFile ? "Uploading..." : "+ Add File"}
                </div>
              </label>
            </div>

            {/* Add link form */}
            {showAddLink && (
              <div className="mt-3 p-3 border border-white/10 bg-white/5 rounded-lg space-y-2">
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <input
                  type="text"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  placeholder="Title (optional)"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-all"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddLink(false);
                      setLinkUrl("");
                      setLinkTitle("");
                    }}
                    className="flex-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg text-sm transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Resolution note */}
          <div>
            <label htmlFor="note" className="block text-sm font-medium text-white/90 mb-2">
              Resolution Note <span className="text-neutral-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="note"
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              maxLength={maxNoteChars}
              rows={2}
              placeholder="Additional context..."
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm resize-none transition-all"
            />
            <div className="flex justify-end mt-1">
              <span className={`text-xs ${resolutionNote.length > maxNoteChars - 20 ? "text-red-400" : "text-neutral-400"}`}>
                {resolutionNote.length}/{maxNoteChars}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all text-sm font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploadingFile}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl transition-all text-sm font-semibold disabled:opacity-50 shadow-lg hover:shadow-xl"
            >
              {loading ? "Saving..." : "Save Resolution"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
