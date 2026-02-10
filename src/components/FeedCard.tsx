'use client';

import Link from 'next/link';
import { useState } from 'react';

// Card variant configuration
const VARIANT_CONFIG = {
  osint: {
    accent: 'red',
    borderColor: 'border-red-500/30 hover:border-red-500/50',
    pillBg: 'bg-red-500/10',
    pillText: 'text-red-400',
    primaryAction: 'View source',
    secondaryAction: 'Map',
  },
  claim: {
    accent: 'purple',
    borderColor: 'border-purple-500/30 hover:border-purple-500/50',
    pillBg: 'bg-purple-500/10',
    pillText: 'text-purple-400',
    primaryAction: 'View evidence',
    secondaryAction: 'Share',
  },
};

type FeedCardVariant = 'osint' | 'claim';

interface FeedCardProps {
  variant: FeedCardVariant;
  // Common fields
  id: string;
  title: string;
  content?: string;
  location?: { city?: string; country?: string; coordinates?: string };
  timeAgo: string;
  category?: string;

  // Source/Author identity
  sourceOrAuthor?: {
    name: string;
    handle?: string;
    platform?: 'twitter' | 'telegram' | 'reddit' | 'web';
    avatar?: string;
  };

  // Claim-specific badges
  status?: 'pending' | 'resolved_correct' | 'resolved_incorrect';
  reputationScore?: number;

  // Actions
  onPrimaryAction: () => void;
  onSecondaryAction?: () => void;

  // Engagement
  votes?: { up: number; down: number };
  comments?: number;

  // Priority indicator (optional)
  isPriority?: boolean;
}

export default function FeedCard({
  variant,
  id,
  title,
  content,
  location,
  timeAgo,
  category,
  sourceOrAuthor,
  status,
  reputationScore,
  onPrimaryAction,
  onSecondaryAction,
  votes,
  comments,
  isPriority = false,
}: FeedCardProps) {
  const config = VARIANT_CONFIG[variant];
  const [upvoted, setUpvoted] = useState(false);
  const [downvoted, setDownvoted] = useState(false);

  // Claim cards get slightly heavier styling
  const cardPadding = variant === 'claim' ? 'p-5' : 'p-4';
  const cardBorder = variant === 'claim' ? `border-2 ${config.borderColor}` : `border ${config.borderColor}`;

  return (
    <div
      className={`
        ${cardPadding} ${cardBorder}
        bg-black/40 backdrop-blur-sm rounded-lg
        transition-all duration-200
        hover:shadow-lg hover:scale-[1.01]
        ${variant === 'claim' ? 'hover:shadow-purple-500/20' : 'hover:shadow-red-500/20'}
        relative
      `}
    >
      {/* A) Header Row */}
      <div className="flex items-center justify-between mb-3">
        {/* Left: Category pill + time */}
        <div className="flex items-center gap-2">
          <span className={`${config.pillBg} ${config.pillText} px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide`}>
            {variant === 'osint' ? 'INTEL' : 'CLAIM'}
          </span>
          <span className="text-xs text-neutral-500">{timeAgo}</span>
        </div>

        {/* Right: Badges cluster */}
        <div className="flex items-center gap-2">
          {isPriority && (
            <div className="text-yellow-400" title="High priority">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
              </svg>
            </div>
          )}

          {/* Claim-specific badges */}
          {variant === 'claim' && status && (
            <div
              className={`
                px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5
                ${status === 'resolved_correct' ? 'bg-green-500/10 text-green-400 border border-green-500/30' :
                  status === 'resolved_incorrect' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                  'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'}
              `}
            >
              {status === 'resolved_correct' && (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {status === 'resolved_incorrect' && (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              {status === 'pending' && (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {status === 'resolved_correct' ? 'Correct' : status === 'resolved_incorrect' ? 'Incorrect' : 'Pending'}
            </div>
          )}

          {variant === 'claim' && reputationScore !== undefined && (
            <div className="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-md text-xs font-semibold">
              Rep {reputationScore}
            </div>
          )}
        </div>
      </div>

      {/* B) Title Line */}
      <h3 className="text-white font-semibold text-base leading-snug line-clamp-2 mb-2">
        {title}
      </h3>

      {/* C) Meta Row - Location + Source/Author Identity */}
      <div className="flex items-center gap-3 mb-3 text-sm">
        {/* Location chip */}
        {location && (location.city || location.country) && (
          <div className="flex items-center gap-1.5 text-neutral-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs">
              {location.city && location.country ? `${location.city}, ${location.country}` :
               location.city || location.country}
            </span>
          </div>
        )}

        {/* Source/Author identity */}
        {sourceOrAuthor && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              {sourceOrAuthor.avatar && (
                <img
                  src={sourceOrAuthor.avatar}
                  alt={sourceOrAuthor.name}
                  className="w-4 h-4 rounded-full"
                />
              )}
              <span className="text-neutral-300 text-xs font-medium">{sourceOrAuthor.name}</span>
              {sourceOrAuthor.handle && (
                <span className="text-neutral-500 text-xs">@{sourceOrAuthor.handle}</span>
              )}
            </div>

            {/* Platform icon */}
            {sourceOrAuthor.platform && (
              <div className="text-neutral-500">
                {sourceOrAuthor.platform === 'twitter' && (
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                )}
                {sourceOrAuthor.platform === 'telegram' && (
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                  </svg>
                )}
                {sourceOrAuthor.platform === 'reddit' && (
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                  </svg>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* D) Content Preview */}
      {content && (
        <p className="text-neutral-400 text-sm leading-relaxed line-clamp-3 mb-4">
          {content}
        </p>
      )}

      {/* E) Footer Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        {/* Left: Primary + Secondary buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPrimaryAction}
            className={`
              px-3 py-1.5 rounded-md text-sm font-medium transition-colors
              ${variant === 'osint'
                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30'
                : 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/30'}
            `}
          >
            {config.primaryAction}
          </button>

          {onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="px-3 py-1.5 rounded-md text-sm font-medium text-neutral-400 hover:text-neutral-300 hover:bg-white/5 transition-colors"
            >
              {config.secondaryAction}
            </button>
          )}
        </div>

        {/* Right: Engagement icons */}
        <div className="flex items-center gap-4">
          {votes && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setUpvoted(!upvoted)}
                className={`transition-colors ${upvoted ? 'text-green-400' : 'text-neutral-500 hover:text-green-400'}`}
              >
                <svg className="w-4 h-4" fill={upvoted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <span className="text-xs text-neutral-400 font-medium min-w-[20px] text-center">
                {votes.up - votes.down}
              </span>
              <button
                onClick={() => setDownvoted(!downvoted)}
                className={`transition-colors ${downvoted ? 'text-red-400' : 'text-neutral-500 hover:text-red-400'}`}
              >
                <svg className="w-4 h-4" fill={downvoted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}

          {comments !== undefined && (
            <div className="flex items-center gap-1.5 text-neutral-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-xs">{comments}</span>
            </div>
          )}

          <button className="text-neutral-500 hover:text-neutral-300 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
