// Debug Globe Page - Simple list view to test data
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function GlobeDebugPage() {
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHotspots();
  }, []);

  const fetchHotspots = async () => {
    try {
      const response = await fetch('/api/globe/hotspots?time_range=all&category=all&status=all');
      const data = await response.json();

      console.log('[Globe Debug] API Response:', data);

      if (data.hotspots) {
        setHotspots(data.hotspots);
      }
    } catch (err) {
      console.error('[Globe Debug] Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🌍 Globe Debug View</h1>
          <p className="text-gray-400">Testing the globe API without 3D visualization</p>
          <Link href="/globe" className="text-blue-400 hover:text-blue-300 text-sm">
            ← Back to full Globe
          </Link>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white mx-auto mb-4" />
            <p className="text-gray-400">Loading hotspots...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-4">
            <p className="text-red-400">❌ Error: {error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                Summary
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Total Hotspots</p>
                  <p className="text-2xl font-bold">{hotspots.length}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Claims</p>
                  <p className="text-2xl font-bold">
                    {hotspots.reduce((sum, h) => sum + h.claim_count, 0)}
                  </p>
                </div>
              </div>
            </div>

            {hotspots.length === 0 ? (
              <div className="text-center py-12 bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg">
                <p className="text-2xl mb-4">🌍</p>
                <p className="text-gray-400 mb-2">No geotagged claims yet</p>
                <p className="text-gray-500 text-sm mb-4">
                  Create a claim with a location to see it here!
                </p>
                <Link
                  href="/lock"
                  className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Lock a Geotagged Claim
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">📍 Hotspots</h2>
                {hotspots.map((hotspot, index) => (
                  <div
                    key={index}
                    className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-4 hover:border-[#2f2f2f] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {hotspot.city}, {hotspot.country}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {hotspot.lat.toFixed(4)}°, {hotspot.lng.toFixed(4)}°
                        </p>
                      </div>
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: hotspot.marker_style.color }}
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">Claims</p>
                        <p className="text-white font-bold">{hotspot.claim_count}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Avg Reliability</p>
                        <p className="text-white font-bold">{hotspot.avg_reliability}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Accuracy</p>
                        <p className="text-white font-bold">{hotspot.accuracy_pct}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Category</p>
                        <p className="text-white font-bold text-xs">{hotspot.top_category}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-[#1a1a1a] rounded">
                        {hotspot.pending_count} pending
                      </span>
                      <span className="text-xs px-2 py-1 bg-[#1a1a1a] rounded">
                        {hotspot.resolved_count} resolved
                      </span>
                      {hotspot.marker_style.pulse && (
                        <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">
                          🔴 Fresh activity
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
