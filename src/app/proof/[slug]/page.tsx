"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Prediction } from "@/lib/storage";

export default function ProofPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const response = await fetch(`/api/proof/${slug}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("Proof not found");
          } else {
            setError("Failed to load proof");
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setPrediction(data.prediction);
      } catch (err) {
        console.error("Error fetching proof:", err);
        setError("Failed to load proof");
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [slug]);

  const getOutcomeBadgeColor = (outcome: string) => {
    switch (outcome) {
      case "correct":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "incorrect":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "invalid":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default:
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    }
  };

  const getOutcomeLabel = (outcome: string) => {
    return outcome.charAt(0).toUpperCase() + outcome.slice(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
            <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-bold text-white mb-2">{error}</h2>
            <p className="text-white/60 mb-6">This proof does not exist or has been removed.</p>
            <Link href="/" className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const createdDate = new Date(prediction.timestamp);
  const isClaimed = !!prediction.userId;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-white/60 hover:text-white transition-colors mb-6">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to predictions
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Prediction Proof</h1>
          <p className="text-white/60">Permanent, immutable record</p>
        </div>

        {/* Main content card */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8 space-y-6">
          {/* Prediction text */}
          <div>
            <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-3">Prediction</h2>
            <p className="text-xl text-white leading-relaxed">{prediction.text}</p>
          </div>

          <div className="border-t border-[#2a2a2a]"></div>

          {/* Metadata grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Created timestamp */}
            <div>
              <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-2">Created (UTC)</h3>
              <p className="text-white font-mono text-sm">
                {createdDate.toUTCString()}
              </p>
            </div>

            {/* Status */}
            <div>
              <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-2">Status</h3>
              <div className="flex items-center gap-3">
                {isClaimed ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 text-sm font-medium">
                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Claimed by owner
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-md bg-gray-500/20 text-gray-400 border border-gray-500/30 text-sm font-medium">
                    Unclaimed
                  </span>
                )}
              </div>
            </div>

            {/* Outcome */}
            <div>
              <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-2">Outcome</h3>
              <span className={`inline-flex items-center px-3 py-1 rounded-md border text-sm font-medium ${getOutcomeBadgeColor(prediction.outcome)}`}>
                {getOutcomeLabel(prediction.outcome)}
              </span>
            </div>

            {/* Author */}
            <div>
              <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-2">Author</h3>
              <p className="text-white font-mono text-sm">
                Anon #{prediction.authorNumber}
              </p>
            </div>
          </div>

          <div className="border-t border-[#2a2a2a]"></div>

          {/* Cryptographic proof */}
          <div>
            <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-3">Cryptographic Proof</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-white/40 mb-1">SHA-256 Fingerprint</p>
                <p className="text-white/80 font-mono text-xs break-all bg-[#0a0a0a] p-3 rounded border border-[#2a2a2a]">
                  {prediction.hash}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Proof ID</p>
                <p className="text-white/80 font-mono text-xs break-all bg-[#0a0a0a] p-3 rounded border border-[#2a2a2a]">
                  {prediction.proofId}
                </p>
              </div>
              {prediction.onChainStatus === "confirmed" && prediction.deReference && (
                <div>
                  <p className="text-xs text-white/40 mb-1">On-Chain Reference</p>
                  <p className="text-white/80 font-mono text-xs break-all bg-[#0a0a0a] p-3 rounded border border-[#2a2a2a]">
                    {prediction.deReference}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* On-chain badge */}
          {prediction.onChainStatus === "confirmed" && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-green-400 font-medium text-sm">Confirmed on Constellation Network</p>
                  <p className="text-green-400/70 text-xs mt-1">This prediction has been permanently recorded on-chain</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="mt-8 text-center">
          <p className="text-white/40 text-sm">
            This proof is permanent and cannot be edited or deleted.
          </p>
        </div>
      </div>
    </div>
  );
}
