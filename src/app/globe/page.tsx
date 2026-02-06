// Globe View: Main globe page component
'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import GlobeSidePanel from '@/components/GlobeSidePanel';

// Dynamically import Polyglobe-style Globe
const GlobeComponent = dynamic(() => import('@/components/GlobeVisualizationPolyglobe'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-[#2E5CFF] mx-auto mb-4" />
        <p className="text-slate-400">Initializing globe...</p>
        <p className="text-slate-500 text-sm mt-2">Loading global claims data</p>
      </div>
    </div>
  ),
});

interface Hotspot {
  lat: number;
  lng: number;
  city: string;
  country: string;
  claim_count: number;
  avg_reliability: number;
  pending_count: number;
  resolved_count: number;
  correct_count: number;
  incorrect_count: number;
  accuracy_pct: number;
  avg_evidence_score: number;
  latest_claim_at: string;
  top_category: string;
  marker_style: {
    color: string;
    size: string;
    pulse: boolean;
  };
}

export default function GlobePage() {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'all',
    timeRange: '7d',
    status: 'all',
  });
  const [showStats, setShowStats] = useState(false);

  // Fetch hotspots
  useEffect(() => {
    fetchHotspots();
  }, [filters]);

  const fetchHotspots = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        time_range: filters.timeRange,
        category: filters.category,
        status: filters.status,
      });

      const response = await fetch(`/api/globe/hotspots?${params}`);
      const data = await response.json();

      if (data.hotspots) {
        setHotspots(data.hotspots);
      }
    } catch (error) {
      console.error('[Globe Page] Error fetching hotspots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHotspotClick = (hotspot: Hotspot) => {
    setSelectedHotspot(hotspot);
  };

  const handleCloseSidePanel = () => {
    setSelectedHotspot(null);
  };

  const handleResetView = () => {
    // Will be implemented in globe component
    window.location.reload();
  };

  return (
    <div className="relative w-full h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-slate-700">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌍</span>
            <div>
              <h1 className="text-xl font-bold text-white">ProofLocker Globe</h1>
              <p className="text-xs text-slate-400">Global Claims Visualization</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-3 py-1.5 bg-[#0f0f0f] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#2E5CFF] transition-colors"
            >
              <option value="all">All Categories</option>
              <option value="Politics/War">Politics/War</option>
              <option value="Crypto/Markets">Crypto/Markets</option>
              <option value="Science/Tech">Science/Tech</option>
              <option value="Sports">Sports</option>
              <option value="Entertainment">Entertainment</option>
            </select>

            {/* Time Range Filter */}
            <select
              value={filters.timeRange}
              onChange={(e) => setFilters({ ...filters, timeRange: e.target.value })}
              className="px-3 py-1.5 bg-[#0f0f0f] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#2E5CFF] transition-colors"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="3m">Last 3 Months</option>
              <option value="all">All Time</option>
            </select>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-1.5 bg-[#0f0f0f] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#2E5CFF] transition-colors"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending Only</option>
              <option value="resolved">Resolved Only</option>
            </select>

            {/* Stats Button */}
            <button
              onClick={() => setShowStats(!showStats)}
              className="px-3 py-1.5 bg-[#0f0f0f] border border-slate-700 rounded-lg text-sm text-white hover:bg-[#1a1a1a] hover:border-[#2E5CFF] transition-colors"
            >
              📊 Stats
            </button>

            {/* Close Button */}
            <a
              href="/app"
              className="px-3 py-1.5 bg-[#0f0f0f] border border-slate-700 rounded-lg text-sm text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
            >
              ← Back to Feed
            </a>
          </div>
        </div>
      </div>

      {/* Globe Visualization */}
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-[#2E5CFF] mx-auto mb-4" />
            <p className="text-slate-400">Loading {hotspots.length} hotspots...</p>
          </div>
        </div>
      ) : (
        <GlobeComponent hotspots={hotspots} onHotspotClick={handleHotspotClick} />
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-[#0a0a0a]/90 backdrop-blur-sm border-t border-slate-700">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={handleResetView}
              className="px-4 py-2 bg-[#0f0f0f] border border-slate-700 rounded-lg text-sm text-white hover:bg-[#1a1a1a] hover:border-[#2E5CFF] transition-colors"
            >
              🔄 Reset View
            </button>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                <span className="text-slate-400">High Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#34d399]" />
                <span className="text-slate-400">High Accuracy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#fbbf24]" />
                <span className="text-slate-400">Mixed</span>
              </div>
            </div>
          </div>

          <div className="text-sm text-slate-400">
            {hotspots.length} hotspots • Click marker to view claims
          </div>
        </div>
      </div>

      {/* Side Panel */}
      {selectedHotspot && (
        <GlobeSidePanel hotspot={selectedHotspot} onClose={handleCloseSidePanel} />
      )}

      {/* Stats Modal */}
      {showStats && (
        <div className="absolute inset-0 z-40 bg-black/80 flex items-center justify-center" onClick={() => setShowStats(false)}>
          <div className="bg-[#0f0f0f] border border-slate-700 rounded-lg p-6 max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Globe Stats</h3>
              <button onClick={() => setShowStats(false)} className="text-slate-400 hover:text-white text-2xl">
                ×
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Hotspots:</span>
                <span className="text-white font-bold">{hotspots.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Claims:</span>
                <span className="text-white font-bold">
                  {hotspots.reduce((sum, h) => sum + h.claim_count, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Avg Reliability:</span>
                <span className="text-white font-bold">
                  {Math.round(
                    hotspots.reduce((sum, h) => sum + h.avg_reliability, 0) / hotspots.length
                  ) || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pending Claims:</span>
                <span className="text-white font-bold">
                  {hotspots.reduce((sum, h) => sum + h.pending_count, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Resolved Claims:</span>
                <span className="text-white font-bold">
                  {hotspots.reduce((sum, h) => sum + h.resolved_count, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && hotspots.length === 0 && !selectedHotspot && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-slate-400 text-lg mb-2">No geotagged claims yet</p>
            <p className="text-slate-500 text-sm">
              Be the first to lock a claim with a location! 🌍
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
