'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { mapClaimToCard, mapOsintToCard, sortCards, filterCards, type CardViewModel } from '@/lib/card-view-model';
import { useAuth } from '@/contexts/AuthContext';
import { getTierInfo, getReputationDisplay } from '@/lib/user-scoring';
import { getReputationTier } from '@/lib/reputation-scoring';
import { getEvidenceGrade } from '@/lib/evidence-grading';
import BottomSheet from '@/components/BottomSheet';
import LinkOsintModal from '@/components/LinkOsintModal';
import UnifiedHeader from '@/components/UnifiedHeader';

const GlobeMapbox = dynamic(() => import('@/components/GlobeMapbox'), {
  ssr: false,
});

interface Claim {
  id: number;
  publicSlug: string;
  claim: string;
  category?: string;
  lat: number;
  lng: number;
  status: 'verified' | 'pending' | 'disputed' | 'void';
  submitter: string;
  anonId?: string;
  rep: number;
  confidence: number;
  lockedDate: string;
  outcome: string | null;
  evidence_score?: number;
  createdAt?: string;
}

interface OsintItem {
  id: number;
  title: string;
  source: string;
  handle?: string;
  lat: number;
  lng: number;
  timestamp: string;
  createdAt?: string;
  tags: string[];
  category?: string;
}

type SortOption = 'new' | 'trust' | 'upvotes' | 'evidence';

export default function GlobePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [osint, setOsint] = useState<OsintItem[]>([]);
  const [resolutions, setResolutions] = useState<any[]>([]);
  const [totalResolutions, setTotalResolutions] = useState(0);
  const [currentTab, setCurrentTab] = useState<'claims' | 'osint' | 'resolutions'>('osint'); // Default to OSINT - more interesting!
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedOsint, setSelectedOsint] = useState<OsintItem | null>(null);
  const [showQuickLock, setShowQuickLock] = useState(false);

  // NEW: Metadata for live updates
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [counts, setCounts] = useState({ total: 0, claims: 0, osint: 0, resolved: 0 });

  // New filter states
  const [mapMode, setMapMode] = useState<'both' | 'claims' | 'osint'>('both');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string[]>(['all']);
  const [timeFilter, setTimeFilter] = useState<'24h' | '7d' | '30d' | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<{claims: Claim[], osint: OsintItem[], name: string} | null>(null);
  const [viewMode, setViewMode] = useState<'points' | 'heatmap'>('points');

  // Ticker state for live news rotation
  const [tickerIndex, setTickerIndex] = useState(0);

  // Mobile feed toggle state
  const [showMobileFeed, setShowMobileFeed] = useState(true);

  // Compute unique categories from current data
  const uniqueCategories = useMemo(() => {
    const cats = new Set<string>();
    if (currentTab === 'claims') {
      claims.forEach(c => {
        if (c.category) cats.add(c.category.toLowerCase());
      });
    } else if (currentTab === 'osint') {
      osint.forEach(o => {
        // Get category from tags if available
        o.tags?.forEach(tag => cats.add(tag.toLowerCase()));
      });
    } else {
      resolutions.forEach(r => {
        if (r.category) cats.add(r.category.toLowerCase());
      });
    }
    return ['all', ...Array.from(cats).sort()];
  }, [currentTab, claims, osint, resolutions]);

  // Fetch data from unified activity API
  const fetchActivity = async (showLoading = false) => {
    if (showLoading) setIsUpdating(true);

    try {
      const response = await fetch('/api/globe/activity?window=30d');
      const data = await response.json();

      if (data.meta && data.claims && data.osint) {
        // Dedupe on client as safety net (server already dedupes)
        const dedupeByKey = (items: any[]) => {
          const seen = new Map();
          items.forEach(item => {
            if (item.key && !seen.has(item.key)) {
              seen.set(item.key, item);
            }
          });
          return Array.from(seen.values());
        };

        setClaims(dedupeByKey(data.claims));
        setOsint(dedupeByKey(data.osint));
        setResolutions(dedupeByKey(data.resolved || []));
        setLastUpdated(new Date(data.meta.asOf));
        setCounts(data.meta.counts);
        setTotalResolutions(data.meta.counts.resolved);

        console.log('[Globe] Activity updated:', data.meta.counts);
      }
    } catch (err) {
      console.error('[Globe] Failed to load activity:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchActivity(true);
  }, []);

  // Polling: Update every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('[Globe] Polling for updates...');
      fetchActivity(false); // Silent update (no loading indicator)
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Live timer: Update "Xs ago" display every second
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1); // Force re-render every second
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Ticker rotation: rotate through 5 items every 4 seconds
  useEffect(() => {
    const tickerInterval = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % 5);
    }, 4000);
    return () => clearInterval(tickerInterval);
  }, []);

  // Format "last updated" time
  const getTimeSinceUpdate = () => {
    if (!lastUpdated) return 'Never';
    const seconds = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  // Ticker helper: get top 5 items (3 intel + 2 claims)
  const getTickerItems = () => {
    const items: { type: string; text: string; location: string; time: string }[] = [];

    // Add top 3 OSINT items
    osint.slice(0, 3).forEach(signal => {
      items.push({
        type: 'INTEL',
        text: signal.title,
        location: signal.category || signal.tags?.[0] || '',
        time: signal.timestamp
      });
    });

    // Add top 2 claims
    claims.slice(0, 2).forEach(claim => {
      items.push({
        type: 'CLAIM',
        text: claim.claim.slice(0, 80) + '...',
        location: claim.category || '',
        time: claim.lockedDate
      });
    });

    return items.slice(0, 5);
  };

  const tickerItems = getTickerItems();
  const currentTickerItem = tickerItems[tickerIndex] || {
    type: 'CLAIM',
    text: 'Loading live updates...',
    location: '',
    time: ''
  };

  // Freshness helpers for monitoring vibe
  const getMinutesAgo = (dateStr: string) => {
    if (!dateStr) return Infinity;
    return (Date.now() - new Date(dateStr).getTime()) / 60000;
  };

  const getFreshnessBadge = (dateStr: string) => {
    const mins = getMinutesAgo(dateStr);
    if (mins < 5) return { label: 'NEW', className: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse' };
    if (mins < 60) return { label: 'RECENT', className: 'bg-blue-500/15 text-blue-300 border border-blue-500/30' };
    return null;
  };

  const getIntelFreshnessClass = (dateStr: string) => {
    const mins = getMinutesAgo(dateStr);
    if (mins < 60) return 'border-red-500/50';
    if (mins < 360) return 'border-orange-500/30';
    return 'border-red-500/20';
  };

  const getDisplayItems = () => {
    let items: any[] = [];

    if (currentTab === 'claims') {
      items = claims;
    } else if (currentTab === 'osint') {
      items = osint;
    } else {
      items = resolutions;
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      items = items.filter(item => {
        const cat = item.category?.toLowerCase() || 'other';
        return cat === categoryFilter.toLowerCase();
      });
    }

    // Apply status filter for claims
    if (currentTab === 'claims' && !statusFilter.includes('all')) {
      items = items.filter(item => {
        const status = item.outcome || 'pending';
        return statusFilter.includes(status);
      });
    }

    // Apply time filter
    if (timeFilter !== 'all') {
      const now = Date.now();
      const windowMs = {
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
      }[timeFilter];

      items = items.filter(item => {
        const itemDate = new Date(item.lockedDate || item.createdAt || item.timestamp).getTime();
        return (now - itemDate) <= windowMs;
      });
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => {
        const text = (item.claim || item.title || '').toLowerCase();
        const category = (item.category || '').toLowerCase();
        return text.includes(query) || category.includes(query);
      });
    }

    // Apply existing filters for claims tab
    if (currentTab === 'claims') {
      let filtered = items;
      if (activeFilter === 'high-confidence') {
        filtered = items.filter((c: Claim) => c.confidence >= 75);
      } else if (activeFilter === 'verified') {
        filtered = items.filter((c: Claim) => c.status === 'verified');
      }
      return filtered;
    }

    return items;
  };

  const displayItems = getDisplayItems();

  // Filtered claims for map markers (applies same filters as sidebar)
  const filteredClaimsForMap = useMemo(() => {
    let items: Claim[] = [...claims];

    // Apply category filter
    if (categoryFilter !== 'all') {
      items = items.filter(item => {
        const cat = item.category?.toLowerCase() || 'other';
        return cat === categoryFilter.toLowerCase();
      });
    }

    // Apply status filter
    if (!statusFilter.includes('all')) {
      items = items.filter(item => {
        const status = item.outcome || 'pending';
        return statusFilter.includes(status);
      });
    }

    // Apply time filter
    if (timeFilter !== 'all') {
      const now = Date.now();
      const windowMs = {
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
      }[timeFilter];

      items = items.filter(item => {
        const itemDate = new Date(item.lockedDate || '').getTime();
        return (now - itemDate) <= windowMs;
      });
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => {
        const text = (item.claim || '').toLowerCase();
        const category = (item.category || '').toLowerCase();
        return text.includes(query) || category.includes(query);
      });
    }

    // Apply active filter
    if (activeFilter === 'high-confidence') {
      items = items.filter(c => c.confidence >= 75);
    } else if (activeFilter === 'verified') {
      items = items.filter(c => c.status === 'verified');
    }

    return items;
  }, [claims, categoryFilter, statusFilter, timeFilter, searchQuery, activeFilter]);

  // Filtered OSINT for map markers (applies same filters as sidebar)
  const filteredOsintForMap = useMemo(() => {
    let items: OsintItem[] = [...osint];

    // Apply category filter
    if (categoryFilter !== 'all') {
      items = items.filter(item => {
        const cat = item.tags?.[0]?.toLowerCase() || 'other';
        return cat === categoryFilter.toLowerCase();
      });
    }

    // Apply time filter
    if (timeFilter !== 'all') {
      const now = Date.now();
      const windowMs = {
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
      }[timeFilter];

      items = items.filter(item => {
        const itemDate = new Date(item.createdAt || item.timestamp).getTime();
        return (now - itemDate) <= windowMs;
      });
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => {
        const text = (item.title || '').toLowerCase();
        return text.includes(query);
      });
    }

    return items;
  }, [osint, categoryFilter, timeFilter, searchQuery]);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        :root {
          --bg-primary: #0A0A0F;
          --bg-secondary: #111118;
          --bg-overlay: rgba(10, 10, 15, 0.95);
          --text-primary: #f8fafc;
          --text-secondary: #94a3b8;
          --text-muted: #64748b;

          --claim-accent: #8b5cf6;
          --claim-accent-light: #a78bfa;
          --claim-bg: rgba(139, 92, 246, 0.1);
          --claim-border: rgba(139, 92, 246, 0.3);

          --osint-accent: #ef4444;
          --osint-accent-light: #f87171;
          --osint-bg: rgba(239, 68, 68, 0.1);
          --osint-border: rgba(239, 68, 68, 0.3);

          --color-verified: #14b8a6;
          --color-disputed: #ef4444;
          --color-pending: #f59e0b;
          --color-neutral: #6b7280;

          --border-subtle: rgba(91, 33, 182, 0.2);
          --border-medium: rgba(91, 33, 182, 0.3);
        }

        body {
          font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-b from-[#0A0A0F] via-[#111118] to-[#0A0A0F]">
        {/* Unified Header */}
        <UnifiedHeader currentView="globe" />

        {/* Live News Ticker - Below header, responsive */}
        <div className="fixed top-16 left-0 right-0 md:right-[360px] z-[150] bg-slate-900/40 backdrop-blur-xl border-b border-slate-700/30 px-4 py-2.5">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wide ${
              currentTickerItem.type === 'INTEL'
                ? 'bg-red-600/30 border border-red-500/50 text-red-200'
                : 'bg-purple-600/30 border border-purple-500/50 text-purple-200'
            }`}>
              {currentTickerItem.type}
            </span>
            <span className="text-sm text-white font-medium flex-1 truncate">
              {currentTickerItem.text}
            </span>
            {currentTickerItem.location && (
              <>
                <span className="text-neutral-500">•</span>
                <span className="text-xs text-neutral-400">{currentTickerItem.location}</span>
              </>
            )}
            <span className="text-xs text-neutral-500">{currentTickerItem.time}</span>
          </div>
        </div>

        {/* Map Container - Mobile-First Responsive - Adjusted for ticker */}
        <div className="fixed top-[108px] left-0 right-0 md:right-[360px] bottom-0 md:bottom-0">
          <GlobeMapbox claims={filteredClaimsForMap} osint={filteredOsintForMap} mapMode={mapMode} viewMode={viewMode} />
        </div>

        {/* Map Legend + Controls Overlay - Adjusted for ticker */}
        <div className="hidden md:flex fixed top-[124px] left-4 z-[100] items-start gap-2">
          {/* Compact Legend */}
          <div className="bg-[rgba(10,10,15,0.92)] backdrop-blur-xl border border-purple-500/20 rounded-xl p-3 shadow-2xl">
            <div className="flex items-center gap-4 text-[11px]">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6] shadow-[0_0_6px_rgba(139,92,246,0.6)]"></div>
                <span className="text-white">Claims</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shadow-[0_0_6px_rgba(239,68,68,0.6)]"></div>
                <span className="text-white">Intel</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom-left map controls */}
        <div className="hidden md:flex fixed bottom-6 left-4 z-[100] gap-2">
          <button
            onClick={() => setMapMode(mapMode === 'claims' ? 'both' : mapMode === 'both' ? 'osint' : mapMode === 'osint' ? 'claims' : 'both')}
            className="bg-[rgba(10,10,15,0.92)] backdrop-blur-xl border border-purple-500/20 rounded-xl px-3 py-2 text-[11px] font-semibold text-white shadow-2xl hover:bg-purple-500/10 transition-all"
          >
            View: {mapMode === 'both' ? 'All' : mapMode === 'claims' ? 'Claims' : 'Intel'}
          </button>
          <Link
            href="/dashboard"
            className="bg-[rgba(10,10,15,0.92)] backdrop-blur-xl border border-slate-700/30 rounded-xl px-3 py-2 text-[11px] font-medium text-slate-400 hover:text-white shadow-2xl hover:bg-white/5 transition-all"
          >
            My Stats
          </Link>
          <Link
            href="/profile"
            className="bg-[rgba(10,10,15,0.92)] backdrop-blur-xl border border-slate-700/30 rounded-xl px-3 py-2 text-[11px] font-medium text-slate-400 hover:text-white shadow-2xl hover:bg-white/5 transition-all"
          >
            My Claims
          </Link>
        </div>

        {/* Right Sidebar - Hidden on Mobile, Show on MD+ */}
        <aside className="hidden md:flex fixed top-16 right-0 w-[360px] h-[calc(100vh-64px)] bg-[rgba(10,10,15,0.98)] backdrop-blur-[30px] border-l border-purple-500/20 z-[200] flex-col">
          {/* Sidebar Header - Compact */}
          <div className="p-3 border-b border-purple-500/20 flex-shrink-0">
            {/* Tabs Row */}
            <div className="flex gap-1.5 mb-2">
              <button
                onClick={() => setCurrentTab('osint')}
                className={`flex-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                  currentTab === 'osint'
                    ? 'bg-[#ef4444] text-white'
                    : 'text-[#94a3b8] hover:text-white hover:bg-white/5'
                }`}
              >
                OSINT ({osint.length})
              </button>
              <button
                onClick={() => setCurrentTab('claims')}
                className={`flex-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                  currentTab === 'claims'
                    ? 'bg-[#8b5cf6] text-white'
                    : 'text-[#94a3b8] hover:text-white hover:bg-white/5'
                }`}
              >
                Claims ({claims.length})
              </button>
              <button
                onClick={() => setCurrentTab('resolutions')}
                className={`flex-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                  currentTab === 'resolutions'
                    ? 'bg-emerald-500 text-white'
                    : 'text-[#94a3b8] hover:text-white hover:bg-white/5'
                }`}
              >
                Resolved ({resolutions.length})
              </button>
            </div>

            {/* Inline filters: time + search */}
            <div className="flex gap-1.5 items-center">
              <div className="flex gap-0.5 bg-white/5 rounded-lg p-0.5">
                {(['24h', '7d', '30d', 'all'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeFilter(t)}
                    className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
                      timeFilter === t
                        ? 'bg-purple-500/30 text-purple-300'
                        : 'text-[#64748b] hover:text-white'
                    }`}
                  >
                    {t === 'all' ? 'All' : t}
                  </button>
                ))}
              </div>
              <div className="flex-1 relative">
                <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#64748b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-7 pr-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] text-white placeholder-[#64748b] focus:outline-none focus:border-[#8b5cf6]/40"
                />
              </div>
            </div>

            {/* Live update indicator */}
            <div className="flex items-center justify-between mt-2 text-[10px] text-[#64748b]">
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isUpdating ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                <span>Updated {getTimeSinceUpdate()}</span>
              </div>
              <button
                onClick={() => fetchActivity(true)}
                disabled={isUpdating}
                className="text-[#8b5cf6] hover:text-[#a78bfa] disabled:opacity-50 font-semibold"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Sidebar Content - Scrollable Feed */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">{currentTab === 'claims' ? (
              displayItems.length === 0 ? (
                <div className="text-center py-8 text-[#94a3b8] text-sm">No claims found</div>
              ) : (
                (displayItems as Claim[]).map((claim) => {
                  const isCorrect = claim.outcome === 'correct';
                  const isIncorrect = claim.outcome === 'incorrect';
                  const isResolved = isCorrect || isIncorrect;
                  const evidenceGrade = getEvidenceGrade(claim.evidence_score);
                  const repTier = getReputationTier(claim.rep || 0);
                  const freshnessBadge = getFreshnessBadge(claim.createdAt || '');

                  return (
                    <div
                      key={claim.id}
                      onClick={() => router.push(`/proof/${claim.publicSlug}`)}
                      className={`bg-slate-900/80 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:bg-slate-800/80 ${
                        isCorrect
                          ? 'border-l-[3px] border-l-emerald-500 border border-emerald-500/30'
                          : isIncorrect
                          ? 'border-l-[3px] border-l-red-500 border border-red-500/30'
                          : 'border-l-[3px] border-l-purple-500 border border-slate-700/40'
                      }`}
                    >
                      {/* Top: submitter + reputation + status */}
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-slate-400 font-medium">{claim.submitter}</span>
                          <span className={`text-[8px] font-bold px-1 py-0.5 rounded ${repTier.bgColor} ${repTier.textColor}`}>
                            {repTier.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {freshnessBadge && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${freshnessBadge.className}`}>
                              {freshnessBadge.label}
                            </span>
                          )}
                          {isResolved && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${evidenceGrade.bgColor} ${evidenceGrade.textColor}`}>
                              {evidenceGrade.grade}
                            </span>
                          )}
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isCorrect ? 'bg-emerald-500/20 text-emerald-400' :
                            isIncorrect ? 'bg-red-500/20 text-red-400' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>
                            {isCorrect ? 'Correct' : isIncorrect ? 'Incorrect' : 'Pending'}
                          </span>
                        </div>
                      </div>

                      {/* Claim text */}
                      <p className="text-[13px] text-white leading-snug line-clamp-2 mb-1.5">
                        {claim.claim}
                      </p>

                      {/* Bottom: category + date */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {claim.category && (
                            <span className="text-[10px] text-slate-500">#{claim.category}</span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-600">{claim.lockedDate}</span>
                      </div>
                    </div>
                  );
                })
              )
            ) : currentTab === 'resolutions' ? (
              resolutions.length === 0 ? (
                <div className="text-center py-8 text-[#94a3b8] text-sm">No recent resolutions</div>
              ) : (
                resolutions.map((res) => {
                  const isCorrect = res.outcome === 'correct';
                  const evidenceGrade = getEvidenceGrade(res.evidence_score);
                  const repTier = getReputationTier(res.rep || 0);

                  return (
                    <div
                      key={res.id}
                      onClick={() => router.push(`/proof/${res.publicSlug}`)}
                      className={`bg-slate-900/80 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:bg-slate-800/80 ${
                        isCorrect
                          ? 'border-l-[3px] border-l-emerald-500 border border-emerald-500/30'
                          : 'border-l-[3px] border-l-red-500 border border-red-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-slate-400 font-medium">{res.submitter}</span>
                          <span className={`text-[8px] font-bold px-1 py-0.5 rounded ${repTier.bgColor} ${repTier.textColor}`}>
                            {repTier.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${evidenceGrade.bgColor} ${evidenceGrade.textColor}`}>
                            {evidenceGrade.grade}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>
                      </div>
                      <p className="text-[13px] text-white leading-snug line-clamp-2 mb-1.5">
                        {res.claim}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        {res.category && <span>#{res.category}</span>}
                        <span className={evidenceGrade.textColor}>Evidence {evidenceGrade.grade}</span>
                        <span className="ml-auto">{res.lockedDate}</span>
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              displayItems.length === 0 ? (
                <div className="text-center py-12 text-[#94a3b8] text-sm">No intel signals found</div>
              ) : (
                (displayItems as OsintItem[]).map((item) => {
                  const freshnessBadge = getFreshnessBadge(item.createdAt || '');
                  const freshnessClass = getIntelFreshnessClass(item.createdAt || '');
                  const category = item.category || item.tags?.[0] || 'Intel';

                  return (
                  <div
                    key={item.id}
                    className={`bg-slate-900/80 border ${freshnessClass} rounded-lg p-3 transition-all duration-200 hover:bg-slate-800/80 hover:border-red-500/50`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-600 text-white uppercase">Intel</span>
                      {freshnessBadge && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${freshnessBadge.className}`}>
                          {freshnessBadge.label}
                        </span>
                      )}
                      <span className="text-[11px] text-red-400 font-semibold truncate flex-1">{item.source}</span>
                      <span className="text-[10px] text-slate-500 bg-slate-800/50 px-1.5 py-0.5 rounded">
                        #{category}
                      </span>
                      <span className="text-[10px] text-slate-600">{item.timestamp}</span>
                    </div>
                    <p className="text-[13px] text-white leading-snug line-clamp-2 mb-2">{item.title}</p>
                    <div className="flex gap-1.5">
                      <a
                        href={item.handle ? `https://twitter.com/${item.handle.replace('@', '')}/status/${item.id}` : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-2 py-1 text-[10px] font-semibold rounded bg-red-500/15 hover:bg-red-500/25 text-red-300 text-center transition-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Source
                      </a>
                      <button
                        onClick={() => setSelectedOsint(item)}
                        className="flex-1 px-2 py-1 text-[10px] font-semibold rounded bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 transition-all"
                      >
                        Link
                      </button>
                    </div>
                  </div>
                  );
                })
              )
            )}
          </div>
        </aside>

        {/* Mobile: Toggle Feed Button */}
        <button
          onClick={() => setShowMobileFeed(!showMobileFeed)}
          className="md:hidden fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-4 z-[150] w-12 h-12 rounded-full bg-slate-900/90 backdrop-blur-sm border border-purple-500/30 shadow-2xl flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95"
          title={showMobileFeed ? "Hide Feed" : "Show Feed"}
        >
          {showMobileFeed ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          )}
        </button>

        {/* Mobile BottomSheet - Conditional rendering based on toggle */}
        {showMobileFeed && (
          <div className="md:hidden">
          <BottomSheet
            title="Globe"
            itemCount={displayItems.length}
            tabs={[
              { label: 'Intel', active: currentTab === 'osint', onClick: () => setCurrentTab('osint') },
              { label: 'Claims', active: currentTab === 'claims', onClick: () => setCurrentTab('claims') },
              { label: 'Resolved', active: currentTab === 'resolutions', onClick: () => setCurrentTab('resolutions') },
            ]}
          >
            {/* Compact category filter chips */}
            <div className="px-4 pt-3 pb-2">
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                {uniqueCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all border ${
                      categoryFilter === cat
                        ? 'bg-[rgba(139,92,246,0.1)] text-[#8b5cf6] border-[rgba(139,92,246,0.3)]'
                        : 'bg-transparent text-[#94a3b8] border-[rgba(148,163,184,0.2)] hover:bg-[rgba(139,92,246,0.1)] hover:text-[#8b5cf6]'
                    }`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Card list */}
            <div className="px-4 pb-4 space-y-2">
              {currentTab === 'claims' ? (
                displayItems.length === 0 ? (
                  <div className="text-center py-8 text-[#94a3b8] text-sm">No claims found</div>
                ) : (
                  (displayItems as Claim[]).map((claim) => {
                    const repTier = getReputationTier(claim.rep || 0);
                    const evidenceGrade = getEvidenceGrade(claim.evidence_score);
                    const isResolved = claim.outcome === 'correct' || claim.outcome === 'incorrect';
                    const freshnessBadge = getFreshnessBadge(claim.createdAt || '');
                    return (
                    <div key={claim.id} className="p-3 bg-slate-900/60 border border-slate-700/40 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-400">{claim.submitter}</span>
                          <span className={`text-[8px] font-bold px-1 py-0.5 rounded ${repTier.bgColor} ${repTier.textColor}`}>
                            {repTier.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {freshnessBadge && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${freshnessBadge.className}`}>
                              {freshnessBadge.label}
                            </span>
                          )}
                          {isResolved && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${evidenceGrade.bgColor} ${evidenceGrade.textColor}`}>
                              {evidenceGrade.grade}
                            </span>
                          )}
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            claim.outcome === 'correct' ? 'bg-emerald-500/15 text-emerald-400' :
                            claim.outcome === 'incorrect' ? 'bg-red-500/15 text-red-400' :
                            'bg-amber-500/15 text-amber-400'
                          }`}>
                            {claim.outcome === 'correct' ? 'Correct' : claim.outcome === 'incorrect' ? 'Incorrect' : 'Pending'}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-white line-clamp-2 mb-2">{claim.claim}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">{claim.lockedDate}</span>
                        <button onClick={() => router.push(`/proof/${claim.publicSlug}`)} className="text-[11px] text-purple-400 font-medium">View</button>
                      </div>
                    </div>
                    );
                  })
                )
              ) : currentTab === 'resolutions' ? (
                resolutions.length === 0 ? (
                  <div className="text-center py-8 text-[#94a3b8] text-sm">No recent resolutions</div>
                ) : (
                  resolutions.map((res) => {
                    const evidenceGrade = getEvidenceGrade(res.evidence_score);
                    const repTier = getReputationTier(res.rep || 0);
                    return (
                    <div key={res.id} className={`p-3 bg-slate-900/60 border rounded-xl ${res.outcome === 'correct' ? 'border-emerald-500/40' : 'border-red-500/40'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-400">{res.submitter}</span>
                          <span className={`text-[8px] font-bold px-1 py-0.5 rounded ${repTier.bgColor} ${repTier.textColor}`}>
                            {repTier.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${evidenceGrade.bgColor} ${evidenceGrade.textColor}`}>
                            {evidenceGrade.grade}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            res.outcome === 'correct' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                          }`}>
                            {res.outcome === 'correct' ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-white line-clamp-2 mb-2">{res.claim}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">
                          {res.category && `#${res.category}`}
                          {` | Evidence ${evidenceGrade.grade}`}
                        </span>
                        <button onClick={() => router.push(`/proof/${res.publicSlug}`)} className="text-[11px] text-purple-400 font-medium">View</button>
                      </div>
                    </div>
                    );
                  })
                )
              ) : (
                displayItems.length === 0 ? (
                  <div className="text-center py-8 text-[#94a3b8] text-sm">No intel signals found</div>
                ) : (
                  (displayItems as OsintItem[]).map((item) => {
                    const freshnessBadge = getFreshnessBadge(item.createdAt || '');
                    const freshnessClass = getIntelFreshnessClass(item.createdAt || '');
                    const category = item.category || item.tags?.[0] || 'Intel';

                    return (
                    <div key={item.id} className={`p-3 bg-slate-900/60 border ${freshnessClass} rounded-xl`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-bold text-white bg-red-600/80 px-2 py-0.5 rounded">INTEL</span>
                        {freshnessBadge && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${freshnessBadge.className}`}>
                            {freshnessBadge.label}
                          </span>
                        )}
                        <span className="text-xs text-red-400 font-semibold truncate flex-1">{item.source}</span>
                        <span className="text-[10px] text-slate-500 bg-slate-800/50 px-1.5 py-0.5 rounded">
                          #{category}
                        </span>
                      </div>
                      <p className="text-sm text-white line-clamp-2 mb-2">{item.title}</p>
                      <span className="text-[10px] text-slate-500">{item.timestamp}</span>
                    </div>
                    );
                  })
                )
              )}
            </div>
          </BottomSheet>
        </div>
        )}

        {/* Link OSINT Modal */}
        {selectedOsint && (
          <LinkOsintModal
            osintSignal={{
              id: selectedOsint.id.toString(),
              createdAt: selectedOsint.createdAt || selectedOsint.timestamp,
              title: selectedOsint.title,
              content: '',
              sourceName: selectedOsint.source,
              sourceHandle: selectedOsint.handle,
              sourceUrl: selectedOsint.handle ? `https://twitter.com/${selectedOsint.handle.replace('@', '')}/status/${selectedOsint.id}` : '#',
              geotagLat: selectedOsint.lat,
              geotagLng: selectedOsint.lng,
              tags: selectedOsint.tags,
              publishedAt: selectedOsint.createdAt || selectedOsint.timestamp,
              ingestedAt: new Date().toISOString(),
            }}
            onClose={() => setSelectedOsint(null)}
            onLinked={() => {
              setSelectedOsint(null);
              // Optionally refresh data
            }}
            currentUserId={user?.id}
          />
        )}

        {/* Floating Action Button */}
        <button
          onClick={() => setShowQuickLock(true)}
          className="fixed bottom-[calc(2rem+env(safe-area-inset-bottom))] right-8 z-[100] w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-2xl shadow-purple-500/50 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 group"
          title="Quick Lock (Space)"
        >
          <svg className="w-7 h-7 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div className="absolute inset-0 rounded-full bg-purple-500 animate-ping opacity-20" />
        </button>

        {/* Quick Lock Modal */}
        {showQuickLock && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-lg glass border border-purple-500/30 rounded-xl p-6 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Quick Lock Claim</h3>
                <button
                  onClick={() => setShowQuickLock(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-300 mb-6">
                Lock your claim on-chain. No edits. No deletions.
              </p>
              <Link
                href="/lock"
                className="block w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-center hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg"
                onClick={() => setShowQuickLock(false)}
              >
                Go to Lock Page
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
