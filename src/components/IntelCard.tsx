/**
 * ProofLocker OSINT Intel Card Component
 *
 * Displays a single intel item (news/OSINT signal) with:
 * - Source name and type badge
 * - Title (clickable link)
 * - Summary
 * - Timestamp and location
 * - Image thumbnail (if available)
 * - Freshness indicators (NEW/BREAKING)
 *
 * Used by both /app feed and /globe sidebar
 */

'use client';

import { memo } from 'react';

interface IntelCardProps {
  item: {
    id: string;
    source_name: string;
    source_type: string;
    title: string;
    url: string;
    summary: string | null;
    published_at: string | null;
    created_at: string;
    image_url: string | null;
    place_name: string | null;
    country_code: string | null;
    tags: string[] | null;
  };
  compact?: boolean; // Compact layout for globe sidebar
}

export default memo(function IntelCard({ item, compact = false }: IntelCardProps) {
  // Map tags to category
  const getCategory = () => {
    if (!item.tags || item.tags.length === 0) return 'general';
    const tagStr = item.tags.join(' ').toLowerCase();

    // Primary categories with broader keyword matching
    if (tagStr.match(/crypto|bitcoin|ethereum|blockchain|defi|nft|token/)) return 'crypto';
    if (tagStr.match(/markets|economy|finance|trading|stock|forex|nasdaq|dow|sp500|fed|inflation/)) return 'markets';
    if (tagStr.match(/military|war|conflict|drone|missile|attack|battle|ukraine|russia|taiwan|iran|defense|weapon|combat/)) return 'military';
    if (tagStr.match(/politics|election|government|diplomatic|congress|senate|president|policy|legislation/)) return 'politics';
    if (tagStr.match(/tech|technology|ai|software|hardware|apple|google|meta|microsoft|startup|cyber/)) return 'tech';
    if (tagStr.match(/science|research|discovery|space|nasa|physics|chemistry|biology|study/)) return 'science';
    if (tagStr.match(/sports|football|basketball|soccer|baseball|nba|nfl|olympics|tennis/)) return 'sports';
    if (tagStr.match(/health|medical|pandemic|covid|virus|vaccine|hospital|doctor|disease|healthcare/)) return 'health';
    if (tagStr.match(/climate|environment|weather|temperature|carbon|emissions|energy|renewable/)) return 'climate';
    if (tagStr.match(/culture|art|music|film|entertainment|celebrity|media|movie|show|festival/)) return 'culture';

    return 'general';
  };

  // Get color for category
  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      crypto: 'bg-orange-500/20 text-orange-300 border border-orange-500/40',
      markets: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
      military: 'bg-red-500/20 text-red-300 border border-red-500/40',
      politics: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
      tech: 'bg-purple-500/20 text-purple-300 border border-purple-500/40',
      science: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
      sports: 'bg-green-500/20 text-green-300 border border-green-500/40',
      health: 'bg-pink-500/20 text-pink-300 border border-pink-500/40',
      climate: 'bg-teal-500/20 text-teal-300 border border-teal-500/40',
      general: 'bg-slate-700/30 text-slate-300 border border-slate-600/40',
    };
    return colors[cat] || colors['general'];
  };

  const category = getCategory();

  // Calculate time ago
  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  // Determine freshness
  const getMinutesAgo = (dateStr: string) => {
    return (Date.now() - new Date(dateStr).getTime()) / 60000;
  };

  const minutesAgo = getMinutesAgo(item.created_at);
  const isBreaking = minutesAgo < 5;
  const isRecent = minutesAgo >= 5 && minutesAgo < 60;

  // Source badge color
  const getSourceBadgeColor = () => {
    if (item.source_type === 'google_news_rss') return 'bg-red-600/80 text-white';
    if (item.source_type === 'rss') return 'bg-orange-600/80 text-white';
    if (item.source_type === 'gdelt') return 'bg-purple-600/80 text-white';
    return 'bg-slate-600/80 text-white';
  };

  const timeAgo = getTimeAgo(item.published_at || item.created_at);
  const location = item.place_name || (item.country_code ? `Unknown, ${item.country_code}` : null);

  if (compact) {
    // Compact layout for globe sidebar
    return (
      <div className="bg-slate-900/40 border border-red-500/20 rounded-lg p-3 hover:border-red-500/40 transition-all">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${getSourceBadgeColor()}`}>
            Intel
          </span>
          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase ${getCategoryColor(category)}`}>
            {category}
          </span>
          <span className="text-[10px] text-red-400 font-semibold truncate flex-1">
            {item.source_name}
          </span>
          {isBreaking && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
              BREAKING
            </span>
          )}
          {isRecent && !isBreaking && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
              NEW
            </span>
          )}
        </div>

        {/* Title */}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-white font-medium hover:text-red-400 transition-colors line-clamp-2 mb-1.5"
        >
          {item.title}
        </a>

        {/* Summary */}
        {item.summary && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-2">
            {item.summary}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <span>{timeAgo}</span>
          {location && (
            <>
              <span>•</span>
              <span className="truncate">{location}</span>
            </>
          )}
        </div>
      </div>
    );
  }

  // Full layout for /app feed
  return (
    <div className="bg-slate-900/40 border border-red-500/30 rounded-xl p-4 hover:border-red-500/50 transition-all shadow-lg hover:shadow-red-500/10">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase shrink-0 ${getSourceBadgeColor()}`}>
            Intel
          </span>
          <span className={`text-[10px] font-semibold px-2 py-1 rounded uppercase shrink-0 ${getCategoryColor(category)}`}>
            {category}
          </span>
          <span className="text-xs text-red-400 font-semibold truncate">
            {item.source_name}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isBreaking && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
              BREAKING
            </span>
          )}
          {isRecent && !isBreaking && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
              NEW
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex gap-4">
        {/* Image thumbnail */}
        {item.image_url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-slate-800"
          >
            <img
              src={item.image_url}
              alt=""
              className="w-full h-full object-cover hover:scale-105 transition-transform"
            />
          </a>
        )}

        {/* Text content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base text-white font-semibold hover:text-red-400 transition-colors line-clamp-2 mb-2 block"
          >
            {item.title}
          </a>

          {/* Summary */}
          {item.summary && (
            <p className="text-sm text-slate-400 line-clamp-3 mb-3">
              {item.summary}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>{timeAgo}</span>
            {location && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {location}
                </span>
              </>
            )}
            {item.tags && item.tags.length > 0 && (
              <>
                <span>•</span>
                <div className="flex gap-1.5">
                  {item.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[10px] bg-slate-800/50 px-1.5 py-0.5 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
