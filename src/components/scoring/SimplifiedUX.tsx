/**
 * Simplified UX Components
 * User-friendly components that hide complexity behind progressive disclosure
 */

import React, { useState } from 'react';
import {
  getTierFromScore,
  getTierConfig,
  getNextTierInfo,
  getEvidenceQuality,
  getEvidenceQualityConfig,
  getSimplifiedStats,
  formatAuthorLine,
  formatTimeAgo,
  formatLeaderboardStats,
  type SimplifiedTier,
} from '@/lib/scoring-ux-utils';

// ============================================================================
// TIER BADGE COMPONENT
// ============================================================================

interface TierBadgeProps {
  reliabilityScore: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  showScore?: boolean;
}

export function TierBadge({
  reliabilityScore,
  size = 'md',
  showLabel = true,
  showScore = false,
}: TierBadgeProps) {
  const tier = getTierFromScore(reliabilityScore);
  const config = getTierConfig(tier);

  const sizeClasses = {
    xs: 'text-xs px-1.5 py-0.5 gap-1',
    sm: 'text-sm px-2 py-1 gap-1.5',
    md: 'text-base px-3 py-1.5 gap-2',
    lg: 'text-xl px-4 py-2 gap-2',
    xl: 'text-3xl px-6 py-3 gap-3',
  };

  const iconSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };

  return (
    <div
      className={`inline-flex items-center rounded-full ${config.bgColor} ${sizeClasses[size]} border border-${config.color.replace('text-', '')}/20`}
    >
      <span className={iconSizes[size]}>{config.icon}</span>
      {showLabel && (
        <span className={`font-semibold ${config.color}`}>
          {config.label}
        </span>
      )}
      {showScore && (
        <span className="text-gray-400 text-sm ml-1">
          {reliabilityScore}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// TIER PROGRESS BAR
// ============================================================================

interface TierProgressProps {
  currentScore: number;
  showText?: boolean;
}

export function TierProgress({ currentScore, showText = true }: TierProgressProps) {
  const nextTier = getNextTierInfo(currentScore);

  if (!nextTier.nextTier) {
    return (
      <div className="text-center">
        <div className="inline-flex items-center gap-2 text-yellow-400 font-semibold">
          <span>🏆</span>
          <span>Maximum Tier Reached!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {showText && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">
            Progress to {nextTier.nextTierConfig!.icon} {nextTier.nextTierConfig!.label}
          </span>
          <span className={nextTier.nextTierConfig!.color}>
            {nextTier.pointsNeeded} pts needed
          </span>
        </div>
      )}
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden relative">
        <div
          className={`h-full bg-gradient-to-r ${nextTier.nextTierConfig!.gradient} transition-all duration-500 ease-out`}
          style={{ width: `${nextTier.progressPercent}%` }}
        />
        {/* Glow effect */}
        <div
          className={`absolute top-0 h-full blur-sm bg-gradient-to-r ${nextTier.nextTierConfig!.gradient} opacity-50`}
          style={{ width: `${nextTier.progressPercent}%` }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// EVIDENCE QUALITY LABEL
// ============================================================================

interface EvidenceQualityLabelProps {
  evidenceScore: number;
  showIcon?: boolean;
}

export function EvidenceQualityLabel({
  evidenceScore,
  showIcon = true,
}: EvidenceQualityLabelProps) {
  const quality = getEvidenceQuality(evidenceScore);
  const config = getEvidenceQualityConfig(quality);

  return (
    <span className={`inline-flex items-center gap-1.5 ${config.color} text-sm font-medium`}>
      {showIcon && <span>{config.icon}</span>}
      <span>{config.label}</span>
    </span>
  );
}

// ============================================================================
// SIMPLIFIED PROFILE CARD
// ============================================================================

interface SimplifiedProfileCardProps {
  stats: {
    reliabilityScore: number;
    totalPoints: number;
    correctResolves: number;
    totalResolves: number;
    locksCount: number;
    currentStreak: number;
    categoryStats: Record<string, { correct: number; total: number }>;
  };
  anonId: string;
  showBreakdown?: boolean;
}

export function SimplifiedProfileCard({
  stats,
  anonId,
  showBreakdown = false,
}: SimplifiedProfileCardProps) {
  const [expanded, setExpanded] = useState(showBreakdown);
  const simplified = getSimplifiedStats(stats);

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-6">
      {/* PRIMARY: Tier Badge + Score */}
      <div className="text-center space-y-3">
        <TierBadge reliabilityScore={stats.reliabilityScore} size="xl" />
        <div>
          <div className={`text-5xl font-bold ${simplified.tierColor}`}>
            {stats.reliabilityScore}
          </div>
          <div className="text-gray-500 text-sm">/ 1000</div>
        </div>

        {/* Progress to next tier */}
        {simplified.nextTier && (
          <TierProgress currentScore={stats.reliabilityScore} />
        )}
      </div>

      {/* SECONDARY: Quick Stats */}
      <div className="text-center space-y-2 pt-4 border-t border-gray-800">
        <div className="text-gray-400 text-sm">@anon-{anonId.slice(-4)}</div>
        <div className="text-2xl font-bold text-gray-200">
          {stats.totalPoints.toLocaleString()} <span className="text-sm text-gray-500">pts</span>
        </div>
      </div>

      {/* Track Record */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl text-green-400">✓</span>
          <span className="text-gray-200 font-semibold">{stats.correctResolves}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl text-red-400">✗</span>
          <span className="text-gray-200 font-semibold">
            {stats.totalResolves - stats.correctResolves}
          </span>
        </div>
        <div className="text-gray-400">
          {stats.totalResolves} resolved
        </div>
      </div>

      {/* Activity Summary */}
      <div className="text-center text-sm text-gray-400">
        <div>{simplified.trackRecord}</div>
        {(simplified.categoryExpertise || simplified.streak) && (
          <div className="mt-1 flex items-center justify-center gap-2 flex-wrap">
            {simplified.categoryExpertise && (
              <span className="text-blue-400">{simplified.categoryExpertise}</span>
            )}
            {simplified.streak && (
              <span className="text-orange-400">{simplified.streak}</span>
            )}
          </div>
        )}
      </div>

      {/* Expandable Details */}
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-400 transition-colors py-2"
        >
          <span>See Breakdown</span>
          <span className={`transition-transform ${expanded ? 'rotate-180' : ''}`}>▼</span>
        </button>

        {expanded && (
          <div className="mt-4 space-y-4 pt-4 border-t border-gray-800">
            <div className="text-center text-sm font-semibold text-gray-300 mb-3">
              💡 How Your Score Works
            </div>

            {/* Accuracy */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">🎯 Accuracy (50%)</span>
                <span className="text-gray-200">
                  {Math.round((stats.correctResolves / (stats.totalResolves || 1)) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                  style={{
                    width: `${(stats.correctResolves / (stats.totalResolves || 1)) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Evidence (placeholder - would need avg evidence score) */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">📋 Evidence Quality (30%)</span>
                <span className="text-gray-200">-</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 w-3/4" />
              </div>
            </div>

            {/* Activity */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">📈 Activity (20%)</span>
                <span className="text-gray-200">{stats.totalResolves} resolved</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  style={{ width: `${Math.min((stats.totalResolves / 20) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// PREDICTION CARD AUTHOR LINE
// ============================================================================

interface PredictionCardAuthorProps {
  anonId: string;
  reliabilityScore: number;
  createdAt: Date | string;
}

export function PredictionCardAuthor({
  anonId,
  reliabilityScore,
  createdAt,
}: PredictionCardAuthorProps) {
  const tier = getTierFromScore(reliabilityScore);
  const config = getTierConfig(tier);
  const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  const authorLine = formatAuthorLine(anonId, reliabilityScore, date);

  return (
    <div className="flex items-center gap-2 text-sm text-gray-400">
      <TierBadge reliabilityScore={reliabilityScore} size="xs" showLabel={false} />
      <span className={config.color}>@anon-{anonId.slice(-4)}</span>
      <span>·</span>
      <span>{config.label}</span>
      <span>·</span>
      <span>{formatTimeAgo(date)}</span>
    </div>
  );
}

// ============================================================================
// LEADERBOARD ENTRY
// ============================================================================

interface LeaderboardEntryProps {
  rank: number;
  anonId: string;
  stats: {
    reliabilityScore: number;
    totalPoints: number;
    correctResolves: number;
    totalResolves: number;
    currentStreak: number;
    categoryStats: Record<string, { correct: number; total: number }>;
  };
  trend?: 'up' | 'down' | 'stable';
  isCurrentUser?: boolean;
}

export function LeaderboardEntry({
  rank,
  anonId,
  stats,
  trend = 'stable',
  isCurrentUser = false,
}: LeaderboardEntryProps) {
  const tier = getTierFromScore(stats.reliabilityScore);
  const config = getTierConfig(tier);

  const trendIcons = {
    up: '↗',
    down: '↘',
    stable: '─',
  };

  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    stable: 'text-gray-500',
  };

  const leaderboardStats = formatLeaderboardStats(
    stats.reliabilityScore,
    stats.correctResolves,
    stats.totalResolves,
    stats.currentStreak,
    stats.categoryStats
  );

  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-lg ${
        isCurrentUser
          ? 'bg-blue-500/10 border border-blue-500/30'
          : 'bg-gray-900/30 hover:bg-gray-900/50'
      } transition-colors`}
    >
      {/* Rank */}
      <div className="flex-shrink-0 w-8 text-center">
        <div className="text-gray-400 font-semibold">#{rank}</div>
      </div>

      {/* Tier Badge */}
      <div className="flex-shrink-0 mt-0.5">
        <TierBadge reliabilityScore={stats.reliabilityScore} size="sm" showLabel={false} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span className={`font-semibold ${config.color}`}>@anon-{anonId.slice(-4)}</span>
          {isCurrentUser && (
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
              You
            </span>
          )}
        </div>
        <div className="text-sm text-gray-400">{leaderboardStats}</div>
      </div>

      {/* Score + Trend */}
      <div className="flex-shrink-0 text-right space-y-1">
        <div className={`text-xl font-bold ${config.color}`}>
          {stats.reliabilityScore}
        </div>
        <div className={`text-lg ${trendColors[trend]}`}>
          {trendIcons[trend]}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MINI STATS (for compact displays)
// ============================================================================

interface MiniStatsProps {
  reliabilityScore: number;
  correctResolves: number;
  totalResolves: number;
}

export function MiniStats({ reliabilityScore, correctResolves, totalResolves }: MiniStatsProps) {
  const accuracy = totalResolves > 0 ? Math.round((correctResolves / totalResolves) * 100) : 0;

  return (
    <div className="flex items-center gap-3 text-sm">
      <TierBadge reliabilityScore={reliabilityScore} size="xs" showLabel={false} />
      <span className="text-gray-400">
        {correctResolves}✓ {totalResolves - correctResolves}✗
      </span>
      <span className="text-gray-500">·</span>
      <span className={accuracy >= 70 ? 'text-green-400' : 'text-gray-400'}>
        {accuracy}%
      </span>
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  TierBadge,
  TierProgress,
  EvidenceQualityLabel,
  SimplifiedProfileCard,
  PredictionCardAuthor,
  LeaderboardEntry,
  MiniStats,
};
