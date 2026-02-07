'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import { mapClaimToCard, mapOsintToCard, sortCards, filterCards, type CardViewModel } from '@/lib/card-view-model';
import { useAuth } from '@/contexts/AuthContext';
import { getTierInfo } from '@/lib/user-scoring';

const GlobeMapbox = dynamic(() => import('@/components/GlobeMapbox'), {
  ssr: false,
});

interface Claim {
  id: number;
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
  const [currentTab, setCurrentTab] = useState<'claims' | 'osint'>('osint'); // Default to OSINT
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useEffect(() => {
    fetch('/api/globe/data')
      .then(res => res.json())
      .then(data => {
        if (data.claims) setClaims(data.claims);
        if (data.osint) setOsint(data.osint);
      })
      .catch(err => console.error('[Globe] Failed to load data:', err));
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
    } else {
      return osint;
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
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 h-14 bg-gradient-to-r from-[#0A0A0F] via-[#111118] to-[#0A0A0F] backdrop-blur-[20px] border-b border-purple-500/20 z-[1000] flex items-center justify-between px-6 shadow-[0_0_30px_rgba(91,33,182,0.15)]">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center">
              <img src="/logos/prooflocker-logo-dark.svg" alt="ProofLocker" className="h-9 w-auto" />
            </a>
            <span className="text-[13px] font-medium text-purple-300/70 tracking-wide hidden lg:block">
              Verifiable Claims Worldwide
            </span>
          </div>

          <div className="flex items-center gap-6 text-[13px] text-[#94a3b8]">
            <div className="flex items-center gap-2">
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold text-purple-300">{claims.length}</span> Claims
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6M1 12h6m6 0h6" />
              </svg>
              <span className="font-semibold text-red-300">{osint.length}</span> OSINT
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/app"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold text-gray-400 border border-purple-500/20 hover:text-white hover:border-purple-500/40 hover:bg-purple-500/10 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
              Feed
            </a>
            <a
              href="/lock"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold bg-gradient-to-r from-[#5B21B6] to-[#2E5CFF] hover:from-[#6B31C6] hover:to-[#3D6CFF] text-white transition-all shadow-[0_0_20px_rgba(91,33,182,0.4)]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Submit
            </a>
          </div>
        </header>

        {/* Map Container */}
        <div className="fixed top-14 left-0 right-[360px] bottom-0">
          <GlobeMapbox claims={claims} osint={osint} />
        </div>

        {/* Right Sidebar */}
        <aside className="fixed top-14 right-0 w-[360px] h-[calc(100vh-56px)] bg-gradient-to-b from-[#0A0A0F]/98 via-[#111118]/98 to-[#0A0A0F]/98 backdrop-blur-[30px] border-l border-purple-500/20 z-[950] flex flex-col">
          {/* Sidebar Header */}
          <div className="p-5 border-b border-purple-500/20">
            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setCurrentTab('claims')}
                className={`flex-1 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all border ${
                  currentTab === 'claims'
                    ? 'bg-[#8b5cf6] text-white border-[#8b5cf6]'
                    : 'bg-transparent text-[#94a3b8] border-[rgba(148,163,184,0.2)] hover:text-[#f8fafc] hover:border-[#8b5cf6]'
                }`}
              >
                Claims ({claims.length})
              </button>
              <button
                onClick={() => setCurrentTab('osint')}
                className={`flex-1 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all border ${
                  currentTab === 'osint'
                    ? 'bg-[#ef4444] text-white border-[#ef4444]'
                    : 'bg-transparent text-[#94a3b8] border-[rgba(148,163,184,0.2)] hover:text-[#f8fafc] hover:border-[#ef4444]'
                }`}
              >
                OSINT ({osint.length})
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
                          // TODO: Open modal to link to existing claim
                          alert('Link to existing claim - Coming soon! This OSINT signal will be added as evidence to one of your claims.');
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
      </div>
    </>
  );
}
