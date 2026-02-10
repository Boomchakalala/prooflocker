/**
 * Link OSINT Modal Component
 *
 * Allows users to link OSINT signals to their existing claims as evidence.
 * Shows time gap and reputation boost preview.
 */

'use client';

import { useState, useEffect } from 'react';
import type { OsintSignal } from '@/lib/osint-types';
import type { Prediction } from '@/lib/storage';

interface LinkOsintModalProps {
  osintSignal: OsintSignal;
  onClose: () => void;
  onLinked?: () => void;
  currentUserId?: string | null;
}

export default function LinkOsintModal({
  osintSignal,
  onClose,
  onLinked,
  currentUserId,
}: LinkOsintModalProps) {
  const [userClaims, setUserClaims] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUserClaims();
  }, []);

  const fetchUserClaims = async () => {
    try {
      setLoading(true);
      // Fetch user's claims (pending or recent)
      const anonId = localStorage.getItem('prooflocker_user_id');
      const params = new URLSearchParams();

      if (currentUserId) {
        params.append('userId', currentUserId);
      } else if (anonId) {
        params.append('anonId', anonId);
      }

      const response = await fetch(`/api/predictions?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch claims');

      const data = await response.json();
      setUserClaims(data.predictions || []);
    } catch (error) {
      console.error('Error fetching claims:', error);
      setUserClaims([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeGap = (claimDate: string, osintDate: string) => {
    const claim = new Date(claimDate);
    const osint = new Date(osintDate);
    const diffMs = osint.getTime() - claim.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs < 0) {
      return { text: 'OSINT came before claim', early: false, multiplier: 0 };
    }

    if (diffHours < 1) {
      return { text: 'Less than 1 hour early', early: true, multiplier: 1.1 };
    } else if (diffHours < 24) {
      return { text: `${diffHours} hours early`, early: true, multiplier: 1.2 };
    } else if (diffDays < 7) {
      return { text: `${diffDays} days early`, early: true, multiplier: 1.5 };
    } else if (diffDays < 30) {
      return { text: `${diffDays} days early`, early: true, multiplier: 2.0 };
    } else if (diffDays < 90) {
      return { text: `${diffDays} days early`, early: true, multiplier: 3.0 };
    } else {
      return { text: `${diffDays} days early`, early: true, multiplier: 5.0 };
    }
  };

  const handleLink = async () => {
    if (!selectedClaim) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/link-osint-evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          predictionId: selectedClaim,
          osintSignalId: osintSignal.id,
          osintData: osintSignal,
        }),
      });

      if (!response.ok) throw new Error('Failed to link evidence');

      alert('OSINT signal linked as evidence! Your reputation will be updated.');
      onLinked?.();
      onClose();
    } catch (error) {
      console.error('Error linking evidence:', error);
      alert('Failed to link evidence. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedClaimData = userClaims.find(c => c.id === selectedClaim);
  const timeGap = selectedClaimData
    ? calculateTimeGap(selectedClaimData.timestamp, osintSignal.publishedAt)
    : null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-xl glass border border-purple-500/30 shadow-2xl flex flex-col pb-[env(safe-area-inset-bottom)]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Link OSINT as Evidence</h2>
              <p className="text-sm text-gray-400">
                Select which claim this OSINT signal confirms
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* OSINT Signal Preview */}
        <div className="p-4 bg-red-950/20 border-b border-red-800/30">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z"/>
            </svg>
            <div className="flex-1">
              <div className="text-sm font-medium text-white mb-1">{osintSignal.title}</div>
              <div className="text-xs text-gray-400">
                {osintSignal.sourceName} • {new Date(osintSignal.publishedAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Claims List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading your claims...</div>
          ) : userClaims.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">No claims found</div>
              <p className="text-sm text-gray-500">Make a prediction first, then link OSINT as evidence!</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-400 mb-4">
                Select the claim this OSINT signal confirms:
              </p>
              {userClaims.map((claim) => {
                const gap = calculateTimeGap(claim.timestamp, osintSignal.publishedAt);
                const isSelected = selectedClaim === claim.id;

                return (
                  <button
                    key={claim.id}
                    onClick={() => setSelectedClaim(claim.id)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500/10 shadow-lg'
                        : 'border-slate-700 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white line-clamp-2 mb-1">
                          {claim.textPreview || claim.text}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>Locked {new Date(claim.timestamp).toLocaleDateString()}</span>
                          {claim.category && (
                            <>
                              <span>•</span>
                              <span>{claim.category}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <svg className="w-5 h-5 text-purple-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>

                    {/* Time Gap */}
                    {gap.early ? (
                      <div className="flex items-center gap-2 px-2 py-1 rounded bg-green-500/10 border border-green-500/20">
                        <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs font-medium text-green-400">
                          Claimed {gap.text} • {gap.multiplier}x bonus
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-2 py-1 rounded bg-red-500/10 border border-red-500/20">
                        <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs font-medium text-red-400">
                          {gap.text} (not early)
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800">
          {selectedClaim && timeGap?.early && (
            <div className="mb-4 p-3 rounded-lg bg-purple-950/30 border border-purple-500/30">
              <div className="text-sm font-medium text-white mb-1">Reputation Boost Preview</div>
              <div className="text-xs text-gray-400">
                Early prediction bonus: <span className="text-purple-400 font-semibold">{timeGap.multiplier}x</span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg border border-slate-700 text-gray-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleLink}
              disabled={!selectedClaim || submitting}
              className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:from-purple-500 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Linking...' : 'Link as Evidence'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
