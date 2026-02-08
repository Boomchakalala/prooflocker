"use client";

import { useEffect, useState } from "react";

interface ResolutionCelebrationProps {
  isCorrect: boolean;
  pointsEarned: number;
  oldRank?: number;
  newRank?: number;
  oldStreak: number;
  newStreak: number;
  totalPoints: number;
  accuracy: number;
  tier: string;
  categoryBadgeUnlocked?: string;
  proofUrl: string;
  onClose: () => void;
}

export default function ResolutionCelebration({
  isCorrect,
  pointsEarned,
  oldRank,
  newRank,
  oldStreak,
  newStreak,
  totalPoints,
  accuracy,
  tier,
  categoryBadgeUnlocked,
  proofUrl,
  onClose,
}: ResolutionCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isCorrect) {
      setShowConfetti(true);
      // Auto-dismiss confetti after animation
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [isCorrect]);

  const rankChange = oldRank && newRank ? oldRank - newRank : 0;
  const streakBonus = newStreak > oldStreak ? (newStreak - oldStreak) * 10 : 0;

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'legend': return 'text-purple-400';
      case 'master': return 'text-blue-400';
      case 'expert': return 'text-green-400';
      case 'trusted': return 'text-yellow-400';
      default: return 'text-neutral-400';
    }
  };

  const shareToTwitter = () => {
    const text = `I called it! Just earned +${pointsEarned} reputation points on @ProofLocker. ${rankChange > 0 ? `Jumped ${rankChange} places!` : ''} Proof: ${proofUrl}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const copyProofCard = () => {
    navigator.clipboard.writeText(proofUrl);
    // Could add a toast here
  };

  if (!isCorrect) {
    // Supportive modal for incorrect resolutions
    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Miss Logged</h2>
            <p className="text-slate-400 text-sm">Accountability builds trust</p>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Points:</span>
                <span className="text-rose-400 font-semibold">{pointsEarned} pts</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Your accuracy:</span>
                <span className="text-white font-semibold">{accuracy}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Streak:</span>
                <span className="text-slate-500">Reset, but next correct starts fresh</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-300 text-center">
              👊 <strong>Keep Building:</strong> The best predictors aren't perfect—they're accountable.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all"
            >
              Close
            </button>
            <a
              href="/lock"
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all text-center"
            >
              Make Another Claim
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Celebration modal for correct resolutions
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10%',
                backgroundColor: ['#10B981', '#00E0FF', '#5B21B6', '#F59E0B'][Math.floor(Math.random() * 4)],
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${2 + Math.random()}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="bg-gradient-to-br from-emerald-900/30 to-slate-900 border-2 border-emerald-500/50 rounded-2xl p-8 max-w-lg w-full shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none animate-pulse" />

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/50 animate-bounce">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-emerald-400 mb-2">🎉 CORRECT!</h2>
            <div className="text-4xl font-black text-white mb-1">+{pointsEarned} Points</div>
            <p className="text-slate-400">Your call was verified</p>
          </div>

          {/* Impact Section */}
          <div className="bg-slate-900/70 border border-emerald-500/30 rounded-xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
              <h3 className="text-white font-bold">Impact:</h3>
            </div>

            <div className="space-y-3">
              {rankChange > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Rank:</span>
                  <span className="text-purple-400 font-bold">
                    #{oldRank} → #{newRank} <span className="text-emerald-400">(↑{rankChange} places!)</span>
                  </span>
                </div>
              )}
              {newStreak > oldStreak && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Streak:</span>
                  <span className="text-orange-400 font-bold">
                    {oldStreak} → {newStreak} 🔥 <span className="text-emerald-400">(+{streakBonus} pts bonus)</span>
                  </span>
                </div>
              )}
              {categoryBadgeUnlocked && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Badge:</span>
                  <span className="text-yellow-400 font-bold">
                    {categoryBadgeUnlocked} unlocked! 🏆
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Your Stats */}
          <div className="bg-slate-900/50 rounded-xl p-4 mb-6">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              Your Stats:
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-cyan-400">{totalPoints.toLocaleString()}</div>
                <div className="text-xs text-slate-400">Total Points</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-400">{accuracy}%</div>
                <div className="text-xs text-slate-400">Accuracy</div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${getTierColor(tier)}`}>{tier}</div>
                <div className="text-xs text-slate-400">Tier</div>
              </div>
            </div>
          </div>

          {/* Share Section */}
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3 text-center">Share Your Win:</h3>
            <div className="flex gap-3">
              <button
                onClick={shareToTwitter}
                className="flex-1 px-4 py-3 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                Twitter
              </button>
              <button
                onClick={copyProofCard}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
                Copy Link
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all"
            >
              Close
            </button>
            <a
              href="/leaderboard"
              className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all text-center"
            >
              View Leaderboard
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  );
}
