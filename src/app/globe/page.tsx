'use client';

import { useState, useEffect, useMemo, useCallback, memo } from 'react';
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
import IntelCard from '@/components/IntelCard';
import BreakingNewsBanner from '@/components/BreakingNewsBanner';

// Isolated timer component - only this re-renders every second, not the entire page
const LiveTimer = memo(function LiveTimer({ lastUpdated }: { lastUpdated: Date | null }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!lastUpdated) return <span>Never</span>;
  const seconds = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
  if (seconds < 60) return <span>{seconds}s ago</span>;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return <span>{minutes}m ago</span>;
  const hours = Math.floor(minutes / 60);
  return <span>{hours}h ago</span>;
});

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
  const [currentTab, setCurrentTab] = useState<'claims' | 'osint' | 'resolutions'>('claims'); // Default to claims - shows predictions!
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

  // Viewport filtering state
  const [filterByViewport, setFilterByViewport] = useState(false);
  const [viewportBounds, setViewportBounds] = useState<any>(null);
  const [viewportZoom, setViewportZoom] = useState<number>(1.8);

  // Mobile feed toggle state - Default to false so globe is prominent
  const [showMobileFeed, setShowMobileFeed] = useState(false);

  // Compute unique categories from current data
  const uniqueCategories = useMemo(() => {
    const cats = new Set<string>();
    if (currentTab === 'claims') {
      claims.forEach(c => {
        if (c.category) cats.add(c.category.toLowerCase());
      });
    } else if (currentTab === 'osint') {
      osint.forEach(o => {
        // Get category from category field or tags
        if (o.category) {
          cats.add(o.category.toLowerCase());
        } else {
          o.tags?.forEach(tag => cats.add(tag.toLowerCase()));
        }
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
      const response = await fetch('/api/globe/activity?window=7d');
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

  // Ticker helper: rotate through intel + claims, shuffled for variety
  const tickerItems = useMemo(() => {
    const items: { type: string; text: string; location: string; time: string; source: 'intel' | 'claim' }[] = [];

    // Shuffle helper
    const shuffle = <T,>(arr: T[]): T[] => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    // Take up to 15 intel items, shuffled
    const shuffledIntel = shuffle(osint).slice(0, 15);
    shuffledIntel.forEach(signal => {
      items.push({
        type: 'INTEL',
        text: signal.title,
        location: signal.category || signal.tags?.[0] || '',
        time: signal.timestamp,
        source: 'intel'
      });
    });

    // Take up to 10 claims, shuffled
    const shuffledClaims = shuffle(claims).slice(0, 10);
    shuffledClaims.forEach(claim => {
      items.push({
        type: 'CLAIM',
        text: claim.claim.slice(0, 80) + (claim.claim.length > 80 ? '...' : ''),
        location: claim.category || '',
        time: claim.lockedDate,
        source: 'claim'
      });
    });

    // Shuffle the combined list and cap at 20
    return shuffle(items).slice(0, 20);
  }, [osint, claims]);

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

  const displayItems = useMemo(() => {
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
        // For OSINT items, check both category and tags fields
        if (currentTab === 'osint') {
          const cat = item.category?.toLowerCase() || (item.tags && item.tags[0]?.toLowerCase()) || 'other';
          return cat === categoryFilter.toLowerCase();
        }
        // For claims and resolutions, just check category
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

    // Apply viewport filter if enabled
    if (filterByViewport && viewportBounds) {
      items = items.filter(item => {
        // Skip items without coordinates
        if (!item.lat || !item.lng) return false;
        // Check if item is within viewport bounds
        return viewportBounds.contains([item.lng, item.lat]);
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
  }, [currentTab, claims, osint, resolutions, categoryFilter, statusFilter, timeFilter, searchQuery, filterByViewport, viewportBounds, activeFilter]);

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
        const cat = (item.category || item.tags?.[0])?.toLowerCase() || 'other';
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

  // Viewport change handler
  const handleViewportChange = useCallback((bounds: any, zoom: number) => {
    setViewportBounds(bounds);
    setViewportZoom(zoom);
  }, []);

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

        {/* Live News Ticker - Auto-scrolling marquee */}
        <BreakingNewsBanner items={tickerItems} />

        {/* Map Container - Mobile-First Responsive - Adjusted for ticker */}
        <div className="fixed top-[100px] left-0 right-0 md:right-[360px] bottom-0 md:bottom-0">
          <GlobeMapbox
            claims={filteredClaimsForMap}
            osint={filteredOsintForMap}
            mapMode={mapMode}
            viewMode={viewMode}
            onViewportChange={handleViewportChange}
          />
        </div>

        {/* Map Legend + Controls Overlay - Adjusted for ticker */}
        <div className="hidden md:flex fixed top-[116px] left-4 z-[100] items-start gap-2">
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
          <Link
            href="/app"
            className="bg-[rgba(10,10,15,0.92)] backdrop-blur-xl border border-purple-500/20 rounded-xl px-3 py-2 text-[11px] font-semibold text-white shadow-2xl hover:bg-purple-500/10 transition-all"
          >
            Claims
          </Link>
          <Link
            href="/profile"
            className="bg-[rgba(10,10,15,0.92)] backdrop-blur-xl border border-slate-700/30 rounded-xl px-3 py-2 text-[11px] font-medium text-slate-400 hover:text-white shadow-2xl hover:bg-white/5 transition-all"
          >
            My Claims
          </Link>
          <Link
            href="/dashboard"
            className="bg-[rgba(10,10,15,0.92)] backdrop-blur-xl border border-slate-700/30 rounded-xl px-3 py-2 text-[11px] font-medium text-slate-400 hover:text-white shadow-2xl hover:bg-white/5 transition-all"
          >
            Stats
          </Link>
        </div>

        {/* Right Sidebar - Now responsive with mobile toggle */}
        <aside className={`fixed top-16 ${showMobileFeed ? 'right-0' : 'right-[-360px] md:right-0'} w-[360px] h-[calc(100vh-64px)] bg-[rgba(10,10,15,0.98)] backdrop-blur-[30px] border-l border-purple-500/20 z-[200] flex flex-col transition-all duration-300 ease-in-out shadow-2xl md:shadow-none`}>
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
                title={`${osint.length} total (${osint.filter(o => o.lat && o.lng).length} shown on map)`}
              >
                Intel ({osint.length})
              </button>
              <button
                onClick={() => setCurrentTab('claims')}
                className={`flex-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                  currentTab === 'claims'
                    ? 'bg-[#8b5cf6] text-white'
                    : 'text-[#94a3b8] hover:text-white hover:bg-white/5'
                }`}
                title={`${claims.length} total (${claims.filter(c => c.lat && c.lng).length} shown on map)`}
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
                title={`${resolutions.length} total (${resolutions.filter(r => r.lat && r.lng).length} shown on map)`}
              >
                Resolved ({resolutions.length})
              </button>
            </div>

            {/* Viewport Filter Toggle */}
            <div className="flex gap-1 items-center">
              <button
                onClick={() => setFilterByViewport(false)}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                  !filterByViewport
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    : 'text-[#64748b] hover:text-white hover:bg-white/5 border border-transparent'
                }`}
                title="Show all items matching filters"
              >
                🌐 All
              </button>
              <button
                onClick={() => setFilterByViewport(true)}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                  filterByViewport
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'text-[#64748b] hover:text-white hover:bg-white/5 border border-transparent'
                }`}
                title="Show only items in current map view"
              >
                📍 Viewport
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
                <span>Updated <LiveTimer lastUpdated={lastUpdated} /></span>
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
                      className={`group bg-slate-900/80 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:bg-slate-800/80 border-2 ${
                        isCorrect
                          ? 'border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.15)] hover:border-emerald-500/80'
                          : isIncorrect
                          ? 'border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.15)] hover:border-red-500/80'
                          : 'border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.1)] hover:border-amber-500/70'
                      }`}
                    >
                      {/* Top: submitter + reputation + status */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                            {claim.submitter?.slice(-2) || "??"}
                          </div>
                          <span className="text-xs text-slate-400 font-medium">{claim.submitter}</span>
                          <span className={`text-[8px] font-bold px-1 py-0.5 rounded ${repTier.bgColor} ${repTier.textColor}`}>
                            {repTier.name}
                          </span>
                          {freshnessBadge && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${freshnessBadge.className}`}>
                              {freshnessBadge.label}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {isResolved && evidenceGrade && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${evidenceGrade.bgColor} ${evidenceGrade.textColor}`}>
                              {evidenceGrade.grade}
                            </span>
                          )}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isCorrect ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30' :
                            isIncorrect ? 'bg-red-500 text-white shadow-sm shadow-red-500/30' :
                            'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                          }`}>
                            {isCorrect ? 'Correct' : isIncorrect ? 'Incorrect' : 'Pending'}
                          </span>
                        </div>
                      </div>

                      {/* Claim text */}
                      <p className="text-sm text-white leading-snug line-clamp-2 mb-2">
                        {claim.claim}
                      </p>

                      {/* Bottom: category + resolve + time + hash */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[10px]">
                            {claim.category && (
                              <span className="text-slate-500 bg-slate-800/50 px-1.5 py-0.5 rounded">
                                {claim.category}
                              </span>
                            )}
                            <span className="text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded font-medium">
                              Locked
                            </span>
                            {isResolved && (
                              <span className="text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded font-medium">
                                Resolved
                              </span>
                            )}
                            {/* Resolve button - ONLY FOR YOUR PENDING CLAIMS */}
                            {!isResolved && (() => {
                              const anonId = typeof window !== 'undefined' ? localStorage.getItem("anonId") : null;
                              const isYourClaim = (user && claim.anonId && user.id === claim.userId) || (anonId && claim.anonId === anonId);
                              return isYourClaim ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/resolve/${claim.id}`);
                                  }}
                                  className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-[10px] font-bold rounded transition-all hover:scale-105"
                                >
                                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                  </svg>
                                  Resolve
                                </button>
                              ) : null;
                            })()}
                          </div>
                          <span className="text-[10px] text-slate-500">{claim.lockedDate}</span>
                        </div>
                        {/* Hash snippet */}
                        <div className="flex justify-end">
                          <code className="text-[9px] text-slate-600 font-mono">
                            {(claim as any).hash?.slice(0, 6)}...{(claim as any).hash?.slice(-4)}
                          </code>
                        </div>
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
                (displayItems as OsintItem[]).map((item) => (
                  <IntelCard
                    key={item.id}
                    item={{
                      id: item.id,
                      source_name: item.source || item.source_name || 'Unknown',
                      source_type: item.source_type || 'rss',
                      title: item.title,
                      url: item.url || '#',
                      summary: item.content || item.summary || null,
                      published_at: item.publishedAt || item.published_at || null,
                      created_at: item.createdAt || item.created_at,
                      image_url: item.image_url || null,
                      place_name: item.locationName || item.location_name || item.place_name || null,
                      country_code: item.country_code || null,
                      tags: item.tags || null,
                    }}
                    compact={true}
                  />
                ))
              )
            )}
          </div>
        </aside>

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
                    const isCorrect = claim.outcome === 'correct';
                    const isIncorrect = claim.outcome === 'incorrect';
                    const isResolved = isCorrect || isIncorrect;
                    const freshnessBadge = getFreshnessBadge(claim.createdAt || '');
                    return (
                    <div
                      key={claim.id}
                      onClick={() => router.push(`/proof/${claim.publicSlug}`)}
                      className={`p-3 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                        isCorrect
                          ? 'bg-slate-900/60 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                          : isIncorrect
                          ? 'bg-slate-900/60 border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.15)]'
                          : 'bg-slate-900/60 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.1)]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                            {claim.submitter?.slice(-2) || "??"}
                          </div>
                          <span className="text-xs text-slate-400 font-medium">{claim.submitter}</span>
                          <span className={`text-[8px] font-bold px-1 py-0.5 rounded ${repTier.bgColor} ${repTier.textColor}`}>
                            {repTier.name}
                          </span>
                          {freshnessBadge && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${freshnessBadge.className}`}>
                              {freshnessBadge.label}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isResolved && evidenceGrade && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${evidenceGrade.bgColor} ${evidenceGrade.textColor}`}>
                              {evidenceGrade.grade}
                            </span>
                          )}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isCorrect ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30' :
                            isIncorrect ? 'bg-red-500 text-white shadow-sm shadow-red-500/30' :
                            'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                          }`}>
                            {isCorrect ? 'Correct' : isIncorrect ? 'Incorrect' : 'Pending'}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-white line-clamp-2 mb-2">{claim.claim}</p>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[10px]">
                            {claim.category && (
                              <span className="text-slate-500 bg-slate-800/50 px-1.5 py-0.5 rounded">
                                {claim.category}
                              </span>
                            )}
                            <span className="text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded font-medium">
                              Locked
                            </span>
                            {isResolved && (
                              <span className="text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded font-medium">
                                Resolved
                              </span>
                            )}
                            {/* Resolve button - ONLY FOR YOUR PENDING CLAIMS */}
                            {claim.outcome === 'pending' && (() => {
                              const anonId = typeof window !== 'undefined' ? localStorage.getItem("anonId") : null;
                              const isYourClaim = (user && claim.userId && user.id === claim.userId) || (anonId && claim.anonId === anonId);
                              return isYourClaim ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/resolve/${claim.id}`);
                                  }}
                                  className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-[10px] font-bold rounded transition-all hover:scale-105"
                                >
                                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                  </svg>
                                  Resolve
                                </button>
                              ) : null;
                            })()}
                          </div>
                          <span className="text-[10px] text-slate-500">{claim.lockedDate}</span>
                        </div>
                        <div className="flex justify-end">
                          <code className="text-[9px] text-slate-600 font-mono">
                            {(claim as any).hash?.slice(0, 6)}...{(claim as any).hash?.slice(-4)}
                          </code>
                        </div>
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
                            res.outcome === 'correct' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white' : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
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
                  (displayItems as OsintItem[]).map((item) => (
                    <IntelCard
                      key={item.id}
                      item={{
                        id: item.id,
                        source_name: item.source || item.source_name || 'Unknown',
                        source_type: item.source_type || 'rss',
                        title: item.title,
                        url: item.url || '#',
                        summary: item.content || item.summary || null,
                        published_at: item.publishedAt || item.published_at || null,
                        created_at: item.createdAt || item.created_at,
                        image_url: item.image_url || null,
                        place_name: item.locationName || item.location_name || item.place_name || null,
                        country_code: item.country_code || null,
                        tags: item.tags || null,
                      }}
                      compact={true}
                    />
                  ))
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

        {/* Mobile Feed Toggle Button - Prominent & Well-Positioned */}
        <button
          onClick={() => setShowMobileFeed(!showMobileFeed)}
          className="md:hidden fixed bottom-6 right-4 z-[210] flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-2xl shadow-blue-500/40 text-white transition-all hover:scale-105 active:scale-95 font-bold text-base border-2 border-blue-400/30"
          title={showMobileFeed ? "Hide Feed" : "Show Feed"}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            {showMobileFeed ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
          <span className="font-semibold">{showMobileFeed ? 'Close' : 'Feed'}</span>
          {!showMobileFeed && (
            <div className="absolute inset-0 rounded-full bg-blue-300 animate-ping opacity-25" />
          )}
        </button>

        {/* Floating Lock Button - Removed */}
      </div>
    </>
  );
}
