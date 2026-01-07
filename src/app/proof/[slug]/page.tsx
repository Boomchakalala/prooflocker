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
  const [linkCopied, setLinkCopied] = useState(false);

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

  const copyProofLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const getOutcomeBadgeColor = (outcome: string) => {
    switch (outcome) {
      case "correct":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "incorrect":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "invalid":
        return "bg-neutral-500/10 text-neutral-400 border-neutral-500/20";
      default:
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    }
  };

  const getOutcomeLabel = (outcome: string) => {
    return outcome.charAt(0).toUpperCase() + outcome.slice(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-neutral-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-8">
            <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-semibold text-white mb-2">{error}</h2>
            <p className="text-neutral-400 mb-6 text-sm">This proof does not exist or has been removed.</p>
            <Link href="/" className="inline-block px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-md transition-colors border border-neutral-700">
              Return to ProofLocker
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
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center text-neutral-400 hover:text-white transition-colors mb-8 text-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to ProofLocker
          </Link>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Proof Record</h1>
          <p className="text-neutral-400 text-sm">
            This prediction was recorded on ProofLocker and cannot be edited after creation.
          </p>
        </div>

        {/* Main content card */}
        <div className="bg-[#0d0d0d] border border-neutral-800 rounded-lg overflow-hidden">
          {/* Prediction text section */}
          <div className="p-8 border-b border-neutral-800">
            <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4 letter-spacing-wide">Prediction</h2>
            <p className="text-xl text-neutral-100 leading-relaxed">{prediction.text}</p>
          </div>

          {/* Metadata grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-800">
            {/* Timestamp */}
            <div className="p-6">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Timestamp (UTC)</h3>
              <p className="text-neutral-200 font-mono text-sm">
                {createdDate.toISOString()}
              </p>
              <p className="text-neutral-500 text-xs mt-1">
                {createdDate.toUTCString()}
              </p>
            </div>

            {/* Status */}
            <div className="p-6">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Status</h3>
              <div className="flex flex-col gap-2">
                {isClaimed ? (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-sm font-medium w-fit">
                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Claimed by owner
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-md bg-neutral-500/10 text-neutral-400 border border-neutral-500/20 text-sm font-medium w-fit">
                    Unclaimed
                  </span>
                )}
                {prediction.pseudonym && (
                  <div className="mt-1">
                    <p className="text-xs text-neutral-500 mb-1">Pseudonym</p>
                    <p className="text-neutral-200 font-medium text-sm">{prediction.pseudonym}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Outcome */}
            <div className="p-6">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Outcome</h3>
              <span className={`inline-flex items-center px-3 py-1.5 rounded-md border text-sm font-medium w-fit ${getOutcomeBadgeColor(prediction.outcome)}`}>
                {getOutcomeLabel(prediction.outcome)}
              </span>
            </div>

            {/* Author */}
            <div className="p-6">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Author ID</h3>
              <p className="text-neutral-200 font-mono text-sm">
                #{prediction.authorNumber}
              </p>
            </div>
          </div>

          {/* Cryptographic proof section */}
          <div className="p-8 border-t border-neutral-800 bg-[#08080a]">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">Cryptographic Proof</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-neutral-500 mb-2 uppercase tracking-wider">SHA-256 Fingerprint</p>
                <p className="text-neutral-300 font-mono text-xs break-all bg-black/40 p-3 rounded border border-neutral-800">
                  {prediction.hash}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-2 uppercase tracking-wider">Proof ID</p>
                <p className="text-neutral-300 font-mono text-xs break-all bg-black/40 p-3 rounded border border-neutral-800">
                  {prediction.proofId}
                </p>
              </div>
              {prediction.onChainStatus === "confirmed" && prediction.deReference && (
                <div>
                  <p className="text-xs text-neutral-500 mb-2 uppercase tracking-wider">On-Chain Reference</p>
                  <p className="text-neutral-300 font-mono text-xs break-all bg-black/40 p-3 rounded border border-neutral-800">
                    {prediction.deReference}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* On-chain confirmation badge */}
          {prediction.onChainStatus === "confirmed" && (
            <div className="p-6 border-t border-neutral-800 bg-green-500/5">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-green-400 font-medium text-sm">Confirmed on Constellation Network</p>
                  <p className="text-green-400/70 text-xs mt-1">This prediction has been permanently recorded on-chain and cannot be altered.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Copy link button */}
        <div className="mt-6">
          <button
            onClick={copyProofLink}
            className="w-full md:w-auto px-6 py-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 font-medium rounded-md transition-colors flex items-center justify-center gap-2 text-sm"
          >
            {linkCopied ? (
              <>
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Link copied</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy proof link</span>
              </>
            )}
          </button>
        </div>

        {/* Footer note */}
        <div className="mt-8 text-center">
          <p className="text-neutral-500 text-xs">
            This proof is permanent and immutable. It cannot be edited or deleted.
          </p>
        </div>
      </div>
    </div>
  );
}
