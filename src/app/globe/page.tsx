'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import { mapClaimToCard, mapOsintToCard, sortCards, filterCards, type CardViewModel } from '@/lib/card-view-model';
import { useAuth } from '@/contexts/AuthContext';
import { getTierInfo } from '@/lib/user-scoring';
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
  anonId?: string; // User's anon_id for profile link
  rep: number;
  confidence: number;
  lockedDate: string;
  outcome: string | null;
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
    }, 60000); // 60 seconds

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

  return (
    <>
      <link
        href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css"
        rel="stylesheet"
      />
      <Script
        src="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js"
        strategy="beforeInteractive"
      />

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

        {/* Map Container - Mobile-First Responsive */}
        <div className="fixed top-16 left-0 right-0 md:right-[360px] bottom-0 md:bottom-0">
          <GlobeMapbox claims={claims} osint={osint} mapMode={mapMode} viewMode={viewMode} />
        </div>

        {/* Map Legend + Controls Overlay */}
        <div className="fixed top-20 left-4 z-[1000] space-y-2">
          {/* Mode Toggle */}
          <div className="bg-[rgba(10,10,15,0.95)] backdrop-blur-xl border border-purple-500/20 rounded-xl p-2 shadow-2xl">
            <div className="text-[10px] text-[#94a3b8] font-semibold uppercase mb-2 px-2">View Mode</div>
            <div className="flex gap-1">
              <button
                onClick={() => setMapMode('both')}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                  mapMode === 'both'
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                Both
              </button>
              <button
                onClick={() => setMapMode('claims')}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                  mapMode === 'claims'
                    ? 'bg-[#8b5cf6]/20 text-[#a78bfa] border border-[#8b5cf6]/40'
                    : 'text-[#94a3b8] hover:text-[#a78bfa]'
                }`}
              >
                Claims
              </button>
              <button
                onClick={() => setMapMode('osint')}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                  mapMode === 'osint'
                    ? 'bg-[#ef4444]/20 text-[#f87171] border border-[#ef4444]/40'
                    : 'text-[#94a3b8] hover:text-[#f87171]'
                }`}
              >
                OSINT
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-[rgba(10,10,15,0.95)] backdrop-blur-xl border border-purple-500/20 rounded-xl p-3 shadow-2xl">
            <div className="text-[10px] text-[#94a3b8] font-semibold uppercase mb-2">Legend</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#8b5cf6] shadow-[0_0_8px_rgba(139,92,246,0.6)]"></div>
                <span className="text-[11px] text-white">Claims</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                <span className="text-[11px] text-white">OSINT</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-[9px] text-white font-bold">12</span>
                </div>
                <span className="text-[11px] text-[#94a3b8]">Cluster</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="text-[10px] text-[#94a3b8] mb-2">Size = Volume</div>
              <div className="text-[10px] text-[#94a3b8]">Glow = Activity</div>
            </div>
          </div>

          {/* View Mode Toggle (Points/Heatmap) */}
          <div className="bg-[rgba(10,10,15,0.95)] backdrop-blur-xl border border-purple-500/20 rounded-xl p-2 shadow-2xl">
            <div className="flex gap-1">
              <button
                onClick={() => setViewMode('points')}
                className={`flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                  viewMode === 'points'
                    ? 'bg-white/10 text-white'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                Points
              </button>
              <button
                onClick={() => setViewMode('heatmap')}
                className={`flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                  viewMode === 'heatmap'
                    ? 'bg-white/10 text-white'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                Heatmap
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Hidden on Mobile, Show on MD+ */}
        <aside className="hidden md:flex fixed top-16 right-0 w-[360px] h-[calc(100vh-64px)] bg-gradient-to-b from-[#0A0A0F]/98 via-[#111118]/98 to-[#0A0A0F]/98 backdrop-blur-[30px] border-l border-purple-500/20 z-[950] flex-col">
          {/* Sidebar Header */}
          <div className="p-5 border-b border-purple-500/20">
            {/* Last Updated Indicator */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2 text-[11px] text-[#94a3b8]">
                <svg
                  className={`w-3 h-3 ${isUpdating ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>Updated {getTimeSinceUpdate()}</span>
              </div>
              <button
                onClick={() => fetchActivity(true)}
                disabled={isUpdating}
                className="text-[11px] text-[#8b5cf6] hover:text-[#a78bfa] disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                Refresh
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setCurrentTab('osint')}
                className={`flex-1 px-3 py-2 rounded-lg text-[12px] font-semibold transition-all border ${
                  currentTab === 'osint'
                    ? 'bg-[#ef4444] text-white border-[#ef4444]'
                    : 'bg-transparent text-[#94a3b8] border-[rgba(148,163,184,0.2)] hover:text-[#f8fafc] hover:border-[#ef4444]'
                }`}
              >
                OSINT
              </button>
              <button
                onClick={() => setCurrentTab('claims')}
                className={`flex-1 px-3 py-2 rounded-lg text-[12px] font-semibold transition-all border ${
                  currentTab === 'claims'
                    ? 'bg-[#8b5cf6] text-white border-[#8b5cf6]'
                    : 'bg-transparent text-[#94a3b8] border-[rgba(148,163,184,0.2)] hover:text-[#f8fafc] hover:border-[#8b5cf6]'
                }`}
              >
                Claims
              </button>
              <button
                onClick={() => setCurrentTab('resolutions')}
                className={`flex-1 px-3 py-2 rounded-lg text-[12px] font-semibold transition-all border ${
                  currentTab === 'resolutions'
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-transparent text-[#94a3b8] border-[rgba(148,163,184,0.2)] hover:text-[#f8fafc] hover:border-emerald-500'
                }`}
              >
                Resolved
              </button>
            </div>

            {/* Filters */}
            {currentTab === 'claims' && (
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1.5 rounded-2xl text-[12px] font-medium transition-all border ${
                    activeFilter === 'all'
                      ? 'bg-[rgba(139,92,246,0.1)] text-[#8b5cf6] border-[rgba(139,92,246,0.3)]'
                      : 'bg-transparent text-[#94a3b8] border-[rgba(148,163,184,0.2)] hover:bg-[rgba(139,92,246,0.1)] hover:text-[#8b5cf6]'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveFilter('high-confidence')}
                  className={`px-3 py-1.5 rounded-2xl text-[12px] font-medium transition-all border ${
                    activeFilter === 'high-confidence'
                      ? 'bg-[rgba(139,92,246,0.1)] text-[#8b5cf6] border-[rgba(139,92,246,0.3)]'
                      : 'bg-transparent text-[#94a3b8] border-[rgba(148,163,184,0.2)] hover:bg-[rgba(139,92,246,0.1)] hover:text-[#8b5cf6]'
                  }`}
                >
                  High Confidence
                </button>
                <button
                  onClick={() => setActiveFilter('verified')}
                  className={`px-3 py-1.5 rounded-2xl text-[12px] font-medium transition-all border ${
                    activeFilter === 'verified'
                      ? 'bg-[rgba(139,92,246,0.1)] text-[#8b5cf6] border-[rgba(139,92,246,0.3)]'
                      : 'bg-transparent text-[#94a3b8] border-[rgba(148,163,184,0.2)] hover:bg-[rgba(139,92,246,0.1)] hover:text-[#8b5cf6]'
                  }`}
                >
                  Verified
                </button>
              </div>
            )}

            {/* Enhanced Filter Chips */}
            <div className="mt-3 space-y-2">
              {/* Category Filter */}
              <div>
                <div className="text-[9px] text-[#94a3b8] font-semibold uppercase mb-1.5">Category</div>
                <div className="flex gap-1.5 flex-wrap">
                  {uniqueCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all border ${
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

              {/* Status Filter (Claims only) */}
              {currentTab === 'claims' && (
                <div>
                  <div className="text-[9px] text-[#94a3b8] font-semibold uppercase mb-1.5">Status</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {[
                      { value: 'all', label: 'All' },
                      { value: 'pending', label: 'Pending' },
                      { value: 'correct', label: 'Correct' },
                      { value: 'incorrect', label: 'Incorrect' },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => {
                          if (value === 'all') {
                            setStatusFilter(['all']);
                          } else {
                            const isSelected = statusFilter.includes(value);
                            if (isSelected) {
                              const newFilters = statusFilter.filter(f => f !== value);
                              setStatusFilter(newFilters.length === 0 ? ['all'] : newFilters.filter(f => f !== 'all'));
                            } else {
                              setStatusFilter([...statusFilter.filter(f => f !== 'all'), value]);
                            }
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all border ${
                          statusFilter.includes(value)
                            ? value === 'correct'
                              ? 'bg-[rgba(20,184,166,0.1)] text-[#14b8a6] border-[rgba(20,184,166,0.3)]'
                              : value === 'incorrect'
                              ? 'bg-[rgba(239,68,68,0.1)] text-[#ef4444] border-[rgba(239,68,68,0.3)]'
                              : 'bg-[rgba(245,158,11,0.1)] text-[#f59e0b] border-[rgba(245,158,11,0.3)]'
                            : 'bg-transparent text-[#94a3b8] border-[rgba(148,163,184,0.2)] hover:bg-white/5'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Time Filter */}
              <div>
                <div className="text-[9px] text-[#94a3b8] font-semibold uppercase mb-1.5">Time Range</div>
                <div className="flex gap-1.5">
                  {[
                    { value: '24h' as const, label: '24h' },
                    { value: '7d' as const, label: '7d' },
                    { value: '30d' as const, label: '30d' },
                    { value: 'all' as const, label: 'All' },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setTimeFilter(value)}
                      className={`flex-1 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all border ${
                        timeFilter === value
                          ? 'bg-[rgba(139,92,246,0.1)] text-[#8b5cf6] border-[rgba(139,92,246,0.3)]'
                          : 'bg-transparent text-[#94a3b8] border-[rgba(148,163,184,0.2)] hover:bg-[rgba(139,92,246,0.1)] hover:text-[#8b5cf6]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Input */}
              <div>
                <div className="text-[9px] text-[#94a3b8] font-semibold uppercase mb-1.5">Search</div>
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-[#94a3b8]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search keyword or place..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[11px] text-white placeholder-[#64748b] focus:outline-none focus:border-[#8b5cf6]/40 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#94a3b8] hover:text-white"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {currentTab === 'claims' ? (
              displayItems.length === 0 ? (
                <div className="text-center py-12 text-[#94a3b8] text-sm">No claims found</div>
              ) : (
                (displayItems as Claim[]).map((claim) => {
                  // Extract reputation score from rep field
                  const repScore = claim.rep || 0;

                  // Correct reputation tiers from /how-scoring-works
                  const tierInfo = repScore >= 800 ? { label: 'Legend', color: '#a78bfa', bgColor: 'rgba(167, 139, 250, 0.1)' } :
                                   repScore >= 650 ? { label: 'Master', color: '#60a5fa', bgColor: 'rgba(96, 165, 250, 0.1)' } :
                                   repScore >= 500 ? { label: 'Expert', color: '#4ade80', bgColor: 'rgba(74, 222, 128, 0.1)' } :
                                   repScore >= 300 ? { label: 'Trusted', color: '#facc15', bgColor: 'rgba(250, 204, 21, 0.1)' } :
                                   { label: 'Novice', color: '#9ca3af', bgColor: 'rgba(156, 163, 175, 0.1)' };

                  // Map status to correct values (pending, correct, incorrect)
                  let displayStatus = 'pending';
                  let statusColor = 'bg-[rgba(245,158,11,0.2)] text-[#f59e0b]';

                  if (claim.status === 'verified' || claim.outcome === 'correct') {
                    displayStatus = 'correct';
                    statusColor = 'bg-[rgba(20,184,166,0.2)] text-[#14b8a6]';
                  } else if (claim.status === 'disputed' || claim.outcome === 'incorrect') {
                    displayStatus = 'incorrect';
                    statusColor = 'bg-[rgba(239,68,68,0.2)] text-[#ef4444]';
                  }

                  const canResolve = user && user.id === claim.anonId && claim.outcome === null;

                  return (
                    <div
                      key={claim.id}
                      className={`bg-slate-900/80 border rounded-xl transition-all duration-300 hover:shadow-[0_0_25px_rgba(168,85,247,0.15)] hover:-translate-y-0.5 ${
                        claim.outcome === 'correct'
                          ? 'border-4 border-emerald-500/60 p-4'
                          : claim.outcome === 'incorrect'
                          ? 'border-4 border-red-500/60 p-4'
                          : 'border border-slate-700/50 p-3.5'
                      }`}
                    >
                      {/* Resolution Banner - Only show if resolved */}
                      {(claim.outcome === 'correct' || claim.outcome === 'incorrect') && (
                        <div className={`flex items-center gap-2 mb-2 pb-2 border-b ${
                          claim.outcome === 'correct' ? 'border-emerald-500/20' : 'border-red-500/20'
                        }`}>
                          <div className="flex items-center gap-1.5">
                            {claim.outcome === 'correct' ? (
                              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                              </svg>
                            )}
                            <span className={`${claim.outcome === 'correct' ? 'text-emerald-400' : 'text-red-400'} font-bold text-[11px]`}>
                              {claim.outcome === 'correct' ? 'RESOLVED CORRECT' : 'RESOLVED INCORRECT'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500">•</span>
                          <span className={`text-[10px] ${claim.outcome === 'correct' ? 'text-emerald-400' : 'text-red-400'} font-semibold`}>
                            {claim.outcome === 'correct' ? '+80 pts' : '-20 pts'}
                          </span>
                        </div>
                      )}

                      {/* Header */}
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-1.5 text-[12px]">
                          <button
                            onClick={() => router.push(`/user/${claim.anonId || claim.id}`)}
                            className="font-semibold text-[#f8fafc] hover:text-[#a78bfa] transition-colors cursor-pointer"
                          >
                            {claim.submitter}
                          </button>
                          <div
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded-[10px] text-[11px] font-semibold"
                            style={{
                              background: tierInfo.bgColor,
                              color: tierInfo.color
                            }}
                          >
                            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {tierInfo.label}
                          </div>
                        </div>
                        {!(claim.outcome === 'correct' || claim.outcome === 'incorrect') && (
                          <span className={`px-2 py-0.5 rounded-[10px] text-[10px] font-semibold uppercase tracking-wide ${statusColor}`}>
                            {displayStatus}
                          </span>
                        )}
                      </div>

                      {/* Category Badge */}
                      {claim.category && (
                        <div className="mb-2">
                          <span className="inline-flex px-2 py-0.5 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)] text-[#a78bfa] rounded text-[10px] font-medium">
                            {claim.category}
                          </span>
                        </div>
                      )}

                      {/* Claim Text */}
                      <p className="text-[13px] leading-[1.5] text-[#f8fafc] mb-2.5 line-clamp-2">
                        {claim.claim}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center justify-between text-[11px] text-[#64748b]">
                        <span>{claim.lockedDate}</span>
                        <button
                          onClick={() => router.push(`/proof/${claim.publicSlug}`)}
                          className="px-2 py-1 text-[#94a3b8] hover:text-white hover:bg-white/10 rounded text-[11px] font-medium transition-colors"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  );
                })
              )
            ) : currentTab === 'resolutions' ? (
              resolutions.length === 0 ? (
                <div className="text-center py-12 text-[#94a3b8] text-sm">No recent resolutions</div>
              ) : (
                resolutions.map((res) => {
                  const isCorrect = res.outcome === 'correct';
                  const statusColor = isCorrect ? 'emerald' : 'red';
                  const statusText = isCorrect ? 'RESOLVED CORRECT' : 'RESOLVED INCORRECT';
                  const statusPoints = isCorrect ? '+80 pts' : '-20 pts';

                  return (
                  <div
                    key={res.id}
                    className={`bg-gradient-to-br ${isCorrect ? 'from-emerald-900/20 to-slate-900/50 border-emerald-500/30 border-l-emerald-500' : 'from-red-900/20 to-slate-900/50 border-red-500/30 border-l-red-500'} border border-l-[3px] rounded-[10px] p-3.5 transition-all ${isCorrect ? 'hover:border-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'hover:border-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]'}`}
                  >
                    {/* Resolution Banner */}
                    <div className={`flex items-center gap-2 mb-2 pb-2 border-b ${isCorrect ? 'border-emerald-500/20' : 'border-red-500/20'}`}>
                      <div className="flex items-center gap-1.5">
                        {isCorrect ? (
                          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        )}
                        <span className={`${isCorrect ? 'text-emerald-400' : 'text-red-400'} font-bold text-[11px]`}>{statusText}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">•</span>
                      <span className={`text-[10px] ${isCorrect ? 'text-emerald-400' : 'text-red-400'} font-semibold`}>{statusPoints}</span>
                    </div>

                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-[12px]">
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${isCorrect ? 'from-emerald-600 to-emerald-800' : 'from-red-600 to-red-800'} flex items-center justify-center text-white text-[9px] font-bold`}>
                          {res.authorNumber?.toString().slice(-2) || '00'}
                        </div>
                        <span className="font-semibold text-white">Anon #{res.authorNumber || 1000}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">Just now</span>
                    </div>

                    {/* Category */}
                    {res.category && (
                      <div className="mb-2">
                        <span className="inline-flex px-2 py-0.5 bg-slate-800/50 text-slate-300 rounded text-[10px] font-medium">
                          {res.category}
                        </span>
                      </div>
                    )}

                    {/* Claim Text */}
                    <p className="text-[13px] leading-[1.5] text-white mb-2.5 line-clamp-2">
                      {res.textPreview}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-3 mb-2.5 text-[11px]">
                      {res.evidence_score && (
                        <div className="flex items-center gap-1 text-cyan-400">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                          </svg>
                          <span className="font-semibold">{res.evidence_score}/100</span>
                        </div>
                      )}
                      {res.upvotesCount > 0 && (
                        <div className="flex items-center gap-1 text-indigo-400">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/>
                          </svg>
                          <span className="font-semibold">{res.upvotesCount}</span>
                        </div>
                      )}
                    </div>

                    {/* Action */}
                    <button
                      onClick={() => router.push(`/proof/${res.publicSlug}`)}
                      className={`w-full px-3 py-1.5 ${isCorrect ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/30 text-emerald-300 hover:text-emerald-200' : 'bg-red-500/20 hover:bg-red-500/30 border-red-500/30 text-red-300 hover:text-red-200'} border rounded text-[12px] font-semibold transition-all`}
                    >
                      View Proof
                    </button>
                  </div>
                );
                })
              )
            ) : (
              displayItems.length === 0 ? (
                <div className="text-center py-12 text-[#94a3b8] text-sm">No OSINT signals found</div>
              ) : (
                (displayItems as OsintItem[]).map((item) => {
                  // Construct full source URL
                  const sourceUrl = item.handle ? `https://twitter.com/${item.handle.replace('@', '')}/status/${item.id}` : '#';

                  return (
                  <div
                    key={item.id}
                    className="bg-gradient-to-br from-red-950/30 via-orange-950/20 to-red-950/30 border-2 border-red-500/40 rounded-xl p-3.5 hover:border-red-500/60 hover:shadow-[0_0_30px_rgba(239,68,68,0.2)] transition-all relative overflow-hidden"
                  >
                    {/* Header - Compact */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        {/* OSINT Badge - Smaller */}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded bg-red-600/30 border border-red-500/50 text-red-200 uppercase tracking-wide">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z"/>
                          </svg>
                          Intel
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">{item.timestamp}</span>
                    </div>

                    {/* Title - Compact */}
                    <h3 className="text-sm font-bold text-red-50 mb-2 leading-tight line-clamp-2">
                      {item.title}
                    </h3>

                    {/* Source - Compact */}
                    <div className="flex items-center gap-1.5 mb-2 text-xs text-red-300/70">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                      </svg>
                      <span className="truncate">{item.source}</span>
                    </div>

                    {/* Footer Actions - Compact */}
                    <div className="flex gap-1.5">
                      <a
                        href={sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-2 py-1 text-[10px] font-semibold rounded bg-red-600/30 hover:bg-red-600/40 text-red-200 border border-red-500/40 transition-all text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Source
                      </a>
                      <button
                        onClick={() => {
                          setSelectedOsint(item);
                        }}
                        className="flex-1 px-2 py-1 text-[10px] font-semibold rounded bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40 transition-all"
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
          className="fixed bottom-8 right-8 z-[999] w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-2xl shadow-purple-500/50 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 group"
          title="Quick Lock (Space)"
        >
          <svg className="w-7 h-7 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div className="absolute inset-0 rounded-full bg-purple-500 animate-ping opacity-20" />
        </button>

        {/* Quick Lock Modal */}
        {showQuickLock && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
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
                Lock your prediction with full evidence support and on-chain commitment.
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
