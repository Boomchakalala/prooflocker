'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Script from 'next/script';

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

export default function GlobePage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [osint, setOsint] = useState<OsintItem[]>([]);
  const [stats, setStats] = useState({ activeClaims: 0, accuracy: 79 });

  useEffect(() => {
    // Add Mapbox CSS
    const link = document.createElement('link');
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Fetch data
    fetch('/api/globe/data')
      .then(res => res.json())
      .then(data => {
        console.log('[Globe] Data loaded:', data.claims?.length, 'claims');
        if (data.claims && data.osint) {
          setClaims(data.claims);
          setOsint(data.osint);

          const activeClaims = data.claims.filter((c: Claim) => c.status === 'pending').length;
          setStats({ activeClaims: activeClaims || data.count?.claims || 0, accuracy: 79 });
        }
      })
      .catch(err => console.error('[Globe] Failed to load data:', err));
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Script
        src="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js"
        strategy="beforeInteractive"
      />

      <header className="fixed top-0 left-0 right-0 h-14 bg-gradient-to-r from-[#0f172a] via-[#1a0f2e] to-[#0f172a] backdrop-blur-[20px] border-b border-purple-500/20 z-[1000] shadow-[0_0_20px_rgba(168,85,247,0.15)]">
        <div className="flex items-center justify-between px-6 h-full">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center">
              <img src="/logos/prooflocker-logo-dark.svg" alt="ProofLocker" className="h-9 w-auto" />
            </a>
            <span className="text-[13px] font-medium text-purple-300/80 tracking-wide hidden lg:block">
              🌍 Verifiable Predictions Worldwide
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Navigation buttons */}
            <a
              href="/app"
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-gray-400 hover:text-white transition-all hover:bg-white/10 rounded-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <span className="hidden sm:inline">Feed</span>
            </a>

            <a
              href="/scoring"
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-gray-400 hover:text-white transition-all hover:bg-white/10 rounded-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="hidden sm:inline">Scoring</span>
            </a>

            <a
              href="/profile"
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-gray-400 hover:text-white transition-all hover:bg-white/10 rounded-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="hidden sm:inline">Profile</span>
            </a>

            <div className="h-6 w-px bg-purple-500/30 mx-1 hidden md:block"></div>

            <div className="flex items-center gap-2 text-[12px] text-gray-400 hidden lg:flex">
              <svg className="w-[16px] h-[16px] text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>
                <span className="font-semibold text-purple-300">{stats.activeClaims}</span> Active
              </span>
            </div>

            <a
              href="/lock"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-lg text-[13px] font-semibold transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:-translate-y-px"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="hidden sm:inline">Submit</span>
            </a>
          </div>
        </div>
      </header>

      <div className="pt-14 h-screen">
        <GlobeMapbox claims={claims} osint={osint} />
      </div>
    </div>
  );
}
