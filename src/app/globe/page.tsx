'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const [currentTab, setCurrentTab] = useState<'claims' | 'osint' | 'resolutions'>('claims'); // Default to Claims
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedOsint, setSelectedOsint] = useState<OsintItem | null>(null);
  const [showQuickLock, setShowQuickLock] = useState(false);

  useEffect(() => {
    fetch('/api/globe/data')
      .then(res => res.json())
      .then(data => {
        if (data.claims) setClaims(data.claims);
        if (data.osint) setOsint(data.osint);
      })
      .catch(err => console.error('[Globe] Failed to load data:', err));

    // Fetch recent resolutions
    fetch('/api/predictions?outcome=correct&limit=20')
      .then(res => res.json())
      .then(data => {
        if (data.predictions) setResolutions(data.predictions);
      })
      .catch(err => console.error('[Globe] Failed to load resolutions:', err));
  }, []);

  const getDisplayItems = () => {
    if (currentTab === 'claims') {
      let filtered = claims;
      if (activeFilter === 'high-confidence') {
        filtered = claims.filter(c => c.confidence >= 75);
      } else if (activeFilter === 'verified') {
        filtered = claims.filter(c => c.status === 'verified');
      }
      return filtered;
    } else if (currentTab === 'osint') {
      return osint;
    } else {
      return resolutions;
    }
  };

  const displayItems = getDisplayItems();

  return (
    <>
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

        {/* Map Container - adjusted for unified header */}
        <div className="fixed top-16 left-0 right-[360px] bottom-0">
          <GlobeMapbox claims={claims} osint={osint} />
        </div>

        {/* Right Sidebar - adjusted for unified header */}
        <aside className="fixed top-16 right-0 w-[360px] h-[calc(100vh-64px)] bg-gradient-to-b from-[#0A0A0F]/98 via-[#111118]/98 to-[#0A0A0F]/98 backdrop-blur-[30px] border-l border-purple-500/20 z-[950] flex flex-col">
          {/* Sidebar Header */}
          <div className="p-5 border-b border-purple-500/20">
            {/* Tabs */}
            <div className="flex gap-2 mb-4">
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

                  // Correct reliability tiers from /how-scoring-works
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

                  return (
                    <div
                      key={claim.id}
                      className="bg-[#0A0A0F]/80 border border-purple-500/20 border-l-[3px] border-l-[#8b5cf6] rounded-[10px] p-3.5 transition-all hover:border-[#8b5cf6] hover:bg-[rgba(139,92,246,0.1)] hover:shadow-[0_0_0_1px_rgba(139,92,246,0.3)]"
                    >
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
                        <span className={`px-2 py-0.5 rounded-[10px] text-[10px] font-semibold uppercase tracking-wide ${statusColor}`}>
                          {displayStatus}
                        </span>
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
                          onClick={() => router.push(`/proof/${claim.id}`)}
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
                resolutions.map((res) => (
                  <div
                    key={res.id}
                    className="bg-gradient-to-br from-emerald-900/20 to-slate-900/50 border border-emerald-500/30 border-l-[3px] border-l-emerald-500 rounded-[10px] p-3.5 transition-all hover:border-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  >
                    {/* Resolution Banner */}
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-emerald-500/20">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                        </svg>
                        <span className="text-emerald-400 font-bold text-[11px]">RESOLVED CORRECT</span>
                      </div>
                      <span className="text-[10px] text-slate-500">•</span>
                      <span className="text-[10px] text-emerald-400 font-semibold">+80 pts</span>
                    </div>

                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-[12px]">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white text-[9px] font-bold">
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
                      className="w-full px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 rounded text-[12px] font-semibold transition-all"
                    >
                      View Proof
                    </button>
                  </div>
                ))
              )
            ) : (
              displayItems.length === 0 ? (
                <div className="text-center py-12 text-[#94a3b8] text-sm">No OSINT signals found</div>
              ) : (
                (displayItems as OsintItem[]).map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#0A0A0F]/80 border border-purple-500/20 border-l-[3px] border-l-[#ef4444] rounded-[10px] p-3.5 transition-all hover:border-[#ef4444] hover:bg-[rgba(239,68,68,0.1)] hover:shadow-[0_0_0_1px_rgba(239,68,68,0.3)]"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-[12px]">
                        <span className="font-semibold text-[#f8fafc]">{item.source}</span>
                        {item.handle && (
                          <span className="text-[#ef4444]">{item.handle}</span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#64748b]">{item.timestamp}</span>
                    </div>

                    {/* Title */}
                    <p className="text-[13px] leading-[1.5] text-[#f8fafc] mb-2.5 line-clamp-2">
                      {item.title}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {item.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-[#f87171] rounded text-[10px] font-medium uppercase tracking-wide"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedOsint(item);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold bg-gradient-to-r from-red-600 to-purple-600 text-white hover:from-red-500 hover:to-purple-500 transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                        </svg>
                        Use as Evidence
                      </button>
                    </div>
                  </div>
                ))
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
              sourceUrl: `https://twitter.com/${selectedOsint.handle}`,
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
