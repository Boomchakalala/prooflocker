'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import PredictionCard from '@/components/PredictionCard';
import { Prediction } from '@/lib/storage';
import { mapClaimToCard, mapOsintToCard, sortCards, filterCards, type CardViewModel } from '@/lib/card-view-model';
import { useAuth } from '@/contexts/AuthContext';

const GlobeMapbox = dynamic(() => import('@/components/GlobeMapbox'), {
  ssr: false,
});

interface Claim {
  id: number;
  claim: string;
  lat: number;
  lng: number;
  status: 'verified' | 'pending' | 'disputed' | 'void';
  submitter: string;
  rep: number;
  confidence: number;
  lockedDate: string;
  outcome: string | null;
}

interface OsintItem {
  id: number;
  title: string;
  source: string;
  lat: number;
  lng: number;
  timestamp: string;
  tags: string[];
}

type SortOption = 'new' | 'trust' | 'upvotes' | 'evidence';
type TimeWindow = '24h' | '7d' | '30d' | 'all';

export default function GlobePage() {
  const { user } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [osint, setOsint] = useState<OsintItem[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);

  // UI state
  const [currentTab, setCurrentTab] = useState<'claims' | 'osint' | 'all'>('claims');
  const [sortBy, setSortBy] = useState<SortOption>('new');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const categories = ['all', 'Crypto', 'Politics', 'Markets', 'Tech', 'Sports', 'OSINT', 'Culture', 'Personal', 'Other'];

  useEffect(() => {
    // Fetch data
    Promise.all([
      fetch('/api/globe/data').then(res => res.json()),
      fetch('/api/predictions').then(res => res.json()),
    ]).then(([globeData, predData]) => {
      if (globeData.claims) setClaims(globeData.claims);
      if (globeData.osint) setOsint(globeData.osint);
      if (predData.predictions) setPredictions(predData.predictions);
    }).catch(err => console.error('[Globe] Failed to load data:', err));
  }, []);

  // Convert to CardViewModel and apply filters/sorting
  const getDisplayCards = (): CardViewModel[] => {
    let cards: CardViewModel[] = [];

    if (currentTab === 'claims' || currentTab === 'all') {
      cards.push(...claims.map(mapClaimToCard));
    }
    if (currentTab === 'osint' || currentTab === 'all') {
      cards.push(...osint.map(mapOsintToCard));
    }

    // Apply filters
    cards = filterCards(cards, {
      category: selectedCategory,
      timeWindow,
    });

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      cards = cards.filter(c =>
        c.title.toLowerCase().includes(query) ||
        c.authorName.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    cards = sortCards(cards, sortBy);

    return cards;
  };

  const displayCards = getDisplayCards();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0F] via-[#111118] to-[#0A0A0F]">
      <Script
        src="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js"
        strategy="beforeInteractive"
      />

      {/* ProofLocker Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-gradient-to-r from-[#0A0A0F] via-[#111118] to-[#0A0A0F] backdrop-blur-[20px] border-b border-purple-500/20 z-[1000] shadow-[0_0_30px_rgba(91,33,182,0.15)]">
        <div className="flex items-center justify-between px-3 md:px-6 h-full">
          <div className="flex items-center gap-2 md:gap-6">
            <a href="/" className="flex items-center transition-transform hover:scale-105">
              <img src="/logos/prooflocker-logo-dark.svg" alt="ProofLocker" className="h-6 md:h-8 w-auto" />
            </a>
            <span className="text-[10px] md:text-[12px] font-medium text-purple-300/70 tracking-wider hidden sm:block">
              Verifiable Claims Worldwide
            </span>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <a
              href="/app"
              className="group flex items-center gap-1 px-2 md:px-3 py-2 text-[11px] md:text-[12px] font-semibold text-gray-400 hover:text-white transition-all hover:bg-purple-500/10 rounded-lg border border-transparent hover:border-purple-500/20"
              title="View Feed"
            >
              <svg className="w-3.5 md:w-4 h-3.5 md:h-4 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
              <span className="hidden md:inline">Feed</span>
            </a>

            <a
              href="/lock"
              className="flex items-center gap-1.5 px-3 md:px-5 py-1.5 md:py-2 bg-gradient-to-r from-[#5B21B6] to-[#2E5CFF] hover:from-[#6B31C6] hover:to-[#3D6CFF] text-white rounded-lg text-[11px] md:text-[13px] font-bold transition-all shadow-[0_0_20px_rgba(91,33,182,0.4)] hover:shadow-[0_0_30px_rgba(91,33,182,0.6)]"
            >
              <svg className="w-3.5 md:w-4 h-3.5 md:h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Submit</span>
            </a>
          </div>
        </div>
      </header>

      <div className="pt-14 h-screen flex">
        {/* Map Container */}
        <div className="flex-1 relative">
          <GlobeMapbox claims={claims} osint={osint} />
        </div>

        {/* Right Panel: Feed-lite */}
        <aside className="w-[420px] h-[calc(100vh-56px)] bg-gradient-to-b from-[#0A0A0F]/98 via-[#111118]/98 to-[#0A0A0F]/98 backdrop-blur-[30px] border-l border-purple-500/20 flex flex-col overflow-hidden">
          {/* Control Bar */}
          <div className="p-4 space-y-3 border-b border-purple-500/20">
            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentTab('all')}
                className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  currentTab === 'all'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                    : 'bg-transparent text-gray-400 border border-purple-500/20 hover:bg-purple-500/10'
                }`}
              >
                All ({displayCards.length})
              </button>
              <button
                onClick={() => setCurrentTab('claims')}
                className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  currentTab === 'claims'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                    : 'bg-transparent text-gray-400 border border-purple-500/20 hover:bg-purple-500/10'
                }`}
              >
                Claims ({claims.length})
              </button>
              <button
                onClick={() => setCurrentTab('osint')}
                className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  currentTab === 'osint'
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                    : 'bg-transparent text-gray-400 border border-purple-500/20 hover:bg-red-500/10'
                }`}
              >
                OSINT ({osint.length})
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 pl-9 bg-white/5 border border-purple-500/20 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/40"
              />
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Sort & Time Window */}
            <div className="flex items-center gap-2">
              {/* Sort dropdown */}
              <div className="relative flex-1">
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white/5 border border-purple-500/20 rounded-lg text-xs font-medium text-gray-300 hover:bg-white/10"
                >
                  <span>
                    {sortBy === 'new' && 'New'}
                    {sortBy === 'trust' && 'Highest Trust'}
                    {sortBy === 'upvotes' && 'Most Upvoted'}
                    {sortBy === 'evidence' && 'Best Evidence'}
                  </span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showSortMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)} />
                    <div className="absolute left-0 top-full mt-1 w-full bg-[#1a1a1a] border border-purple-500/30 rounded-lg shadow-lg z-50 py-1">
                      {[
                        { value: 'new' as SortOption, label: 'New' },
                        { value: 'trust' as SortOption, label: 'Highest Trust' },
                        { value: 'upvotes' as SortOption, label: 'Most Upvoted' },
                        { value: 'evidence' as SortOption, label: 'Best Evidence' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => { setSortBy(option.value); setShowSortMenu(false); }}
                          className={`w-full px-3 py-2 text-left text-xs transition-all ${
                            sortBy === option.value ? 'text-purple-300 bg-purple-500/20' : 'text-gray-300 hover:bg-white/10'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Time window */}
              <select
                value={timeWindow}
                onChange={(e) => setTimeWindow(e.target.value as TimeWindow)}
                className="px-3 py-2 bg-white/5 border border-purple-500/20 rounded-lg text-xs font-medium text-gray-300 hover:bg-white/10 focus:outline-none focus:border-purple-500/40"
              >
                <option value="24h">24h</option>
                <option value="7d">7d</option>
                <option value="30d">30d</option>
                <option value="all">All</option>
              </select>
            </div>

            {/* Category chips */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-full whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                      : 'bg-white/5 border border-purple-500/20 text-gray-400 hover:text-white hover:bg-purple-500/10'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Cards List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {displayCards.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-sm">No items found</p>
              </div>
            ) : (
              displayCards.slice(0, 50).map((card) => (
                <PredictionCard
                  key={card.id}
                  prediction={card._original as Prediction}
                  currentUserId={user?.id}
                  variant="compact"
                  onViewOnMap={() => {
                    // Center map on this card's location
                    // This would trigger the map to fly to coordinates
                    console.log('Center map on', card.lat, card.lng);
                  }}
                />
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
