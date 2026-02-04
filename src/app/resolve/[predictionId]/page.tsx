"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PredictionOutcome } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import type { EvidenceGrade, EvidenceItemInput } from "@/lib/evidence-types";
import { EvidenceGradeInfo, validateEvidenceRequirements } from "@/lib/evidence-types";
import { sha256, sha256File } from "@/lib/evidence-hashing";

type Props = {
  params: Promise<{ predictionId: string }>;
};

export default function ResolvePage({ params }: Props) {
  const router = useRouter();
  const [predictionId, setPredictionId] = useState<string>("");
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [outcome, setOutcome] = useState<PredictionOutcome>("correct");
  const [evidenceGrade, setEvidenceGrade] = useState<EvidenceGrade>("C");
  const [evidenceSummary, setEvidenceSummary] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItemInput[]>([]);

  // Add evidence state
  const [showAddLink, setShowAddLink] = useState(false);
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkTitle, setNewLinkTitle] = useState("");

  // Unwrap params
  useEffect(() => {
    params.then(p => setPredictionId(p.predictionId));
  }, [params]);

  // Fetch prediction
  useEffect(() => {
    if (!predictionId) return;

    const fetchPrediction = async () => {
      try {
        const { data, error } = await supabase
          .from("predictions")
          .select("*")
          .eq("id", predictionId)
          .single();

        if (error) throw error;

        setPrediction(data);
        setOutcome(data.outcome === "pending" ? "correct" : data.outcome);
        setResolutionNote(data.resolution_note || "");
        setEvidenceSummary(data.evidence_summary || "");
        setEvidenceGrade((data.evidence_grade as EvidenceGrade) || "C");
      } catch (err) {
        console.error("Error fetching prediction:", err);
        setError("Failed to load prediction");
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [predictionId]);

  const handleAddLink = async () => {
    if (!newLinkUrl.trim()) {
      setError("Please enter a URL");
      return;
    }

    try {
      // Create evidence item
      const item: EvidenceItemInput = {
        type: "link",
        url: newLinkUrl.trim(),
        title: newLinkTitle.trim() || undefined,
      };

      setEvidenceItems([...evidenceItems, item]);
      setNewLinkUrl("");
      setNewLinkTitle("");
      setShowAddLink(false);
      setError("");
    } catch (err) {
      setError("Failed to add link");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Create evidence item
      const item: EvidenceItemInput = {
        type: file.type.startsWith("image/") ? "screenshot" : "file",
        file,
        title: file.name,
      };

      setEvidenceItems([...evidenceItems, item]);
      setError("");
    } catch (err) {
      setError("Failed to add file");
    }

    // Reset input
    e.target.value = "";
  };

  const removeEvidenceItem = (index: number) => {
    setEvidenceItems(evidenceItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
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

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error("You must be logged in to resolve predictions");
      }

      const response = await fetch(`/api/predictions/${predictionId}/resolve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          outcome,
          evidenceGrade,
          evidenceSummary: evidenceSummary.trim() || undefined,
          resolutionNote: resolutionNote.trim() || undefined,
          evidenceItems,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resolve prediction");
      }

      console.log("[ResolvePage] Success:", data);

      // Navigate to proof page
      if (prediction?.public_slug) {
        router.push(`/proof/${prediction.public_slug}`);
      } else {
        router.push("/app");
      }
    } catch (err) {
      console.error("[ResolvePage] Error:", err);
      setError(err instanceof Error ? err.message : "Failed to resolve prediction");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !prediction) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center glass border border-white/10 rounded-xl p-8">
          <h2 className="text-xl font-semibold text-white mb-2">Error</h2>
          <p className="text-neutral-400 mb-6 text-sm">{error}</p>
          <button
            onClick={() => router.push("/app")}
            className="inline-block px-5 py-2 bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-lg transition-all"
          >
            Back to feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg text-white relative">
      {/* Decorative gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Header with back button */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
        </div>

        {/* Hero Card - Prediction */}
        {prediction && (
          <div className="glass border border-white/10 rounded-2xl overflow-hidden mb-6 shadow-2xl">
            <div className="p-6 md:p-8 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Resolve Prediction</span>
                <div className="h-px flex-1 bg-gradient-to-r from-blue-500/30 to-transparent"></div>
              </div>
              <h1 className="text-2xl md:text-3xl leading-relaxed text-white font-semibold break-words mb-4">
                {prediction.text_preview || prediction.text}
              </h1>
              <p className="text-sm text-neutral-400">
                Provide evidence and mark the outcome. Your credibility score depends on evidence quality.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Outcome */}
          <div className="glass border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Outcome</h2>
                  <p className="text-xs text-neutral-400">Select how the prediction turned out</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["correct", "incorrect", "invalid", "pending"].map((o) => {
                  const isSelected = outcome === o;
                  const colors = {
                    correct: "bg-green-500/15 border-green-500/50 text-green-300 ring-green-500/30",
                    incorrect: "bg-red-500/15 border-red-500/50 text-red-300 ring-red-500/30",
                    invalid: "bg-gray-500/15 border-gray-500/50 text-gray-300 ring-gray-500/30",
                    pending: "bg-yellow-500/15 border-yellow-500/50 text-yellow-300 ring-yellow-500/30",
                  };
                  return (
                    <button
                      key={o}
                      type="button"
                      onClick={() => setOutcome(o as PredictionOutcome)}
                      className={`h-12 rounded-lg border font-semibold text-sm transition-all ${
                        isSelected
                          ? `${colors[o as keyof typeof colors]} ring-1`
                          : "bg-white/[0.03] border-white/[0.08] text-white/60 hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      {o.charAt(0).toUpperCase() + o.slice(1)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 2: Evidence Pack */}
          <div className="glass border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Evidence</h2>
                  <p className="text-xs text-neutral-400">Add evidence to increase your credibility score</p>
                </div>
              </div>

            {/* Evidence Grade Selector */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-white/90 mb-3">Evidence Quality</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(["A", "B", "C", "D"] as EvidenceGrade[]).map((grade) => {
                  const info = EvidenceGradeInfo[grade];
                  const isSelected = evidenceGrade === grade;
                  return (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => setEvidenceGrade(grade)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        isSelected
                          ? "bg-white/10 border-white/30 ring-1 ring-white/20"
                          : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/15"
                      }`}
                      title={info.description}
                    >
                      <div className="font-bold text-white text-sm mb-0.5">{info.label.split(" ")[0]}</div>
                      <div className="text-[10px] text-neutral-400 line-clamp-1">{info.label.split(" ").slice(1).join(" ")}</div>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-neutral-500 mt-2">{EvidenceGradeInfo[evidenceGrade].description}</p>
            </div>

            {/* Add Evidence Buttons */}
            <div className="space-y-3 mb-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddLink(!showAddLink)}
                  className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Add Link
                </button>
                <label className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Upload File
                  <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf,.txt" />
                </label>
              </div>

              {/* Add Link Form */}
              {showAddLink && (
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg space-y-2">
                  <input
                    type="url"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    placeholder="https://example.com/proof"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <input
                    type="text"
                    value={newLinkTitle}
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                    placeholder="Title (optional)"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddLink}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-all"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddLink(false);
                        setNewLinkUrl("");
                        setNewLinkTitle("");
                      }}
                      className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white/70 text-sm rounded-lg transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Evidence Items List */}
            {evidenceItems.length > 0 && (
              <div className="space-y-2 mb-4">
                <p className="text-xs font-medium text-white/70 uppercase tracking-wide">Added Evidence ({evidenceItems.length})</p>
                {evidenceItems.map((item, index) => (
                  <div key={index} className="p-3 bg-white/5 border border-white/10 rounded-lg flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded w-fit mb-1 capitalize">
                        {item.type}
                      </div>
                      {item.url && (
                        <p className="text-sm text-white/90 truncate">{item.title || item.url}</p>
                      )}
                      {item.file && (
                        <p className="text-sm text-white/90 truncate">{item.title || item.file.name}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeEvidenceItem(index)}
                      className="flex-shrink-0 p-1.5 hover:bg-white/10 rounded transition-colors text-red-400 hover:text-red-300"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Evidence Summary */}
            <div>
              <label htmlFor="evidence-summary" className="block text-sm font-medium text-white/90 mb-2">
                Evidence Summary
                {["A", "B"].includes(evidenceGrade) && <span className="text-red-400 ml-1">*</span>}
              </label>
              <textarea
                id="evidence-summary"
                value={evidenceSummary}
                onChange={(e) => setEvidenceSummary(e.target.value)}
                placeholder="Explain how the evidence proves the outcome..."
                maxLength={280}
                rows={3}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none transition-all"
              />
              <p className="text-xs text-white/40 mt-1">{evidenceSummary.length}/280</p>
            </div>
            </div>
          </div>

          {/* Section 3: Optional Notes */}
          <div className="glass border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Additional Notes</h2>
                  <p className="text-xs text-neutral-400">Optional context or explanation</p>
                </div>
              </div>
              <textarea
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="Any additional context..."
                maxLength={280}
                rows={3}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none transition-all"
              />
              <p className="text-xs text-white/40 mt-1">{resolutionNote.length}/280</p>
            </div>
          </div>

          {/* Error Message */}
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

          {/* Submit Section */}
          <div className="glass border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 md:p-8">
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-base rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl mb-3"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Confirm Resolution
                  </>
                )}
              </button>
              <p className="text-xs text-neutral-500 text-center">
                This resolution is public and permanent. Your credibility score will be updated.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
