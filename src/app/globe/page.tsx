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

    // Add custom popup styles
    const style = document.createElement('style');
    style.textContent = `
      /* Mapbox popup styling */
      .mapboxgl-popup-content {
        padding: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
      }

      .mapboxgl-popup-tip {
        display: none !important;
      }

      .stack-panel-popup .mapboxgl-popup-content {
        animation: panelSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      @keyframes panelSlideIn {
        from {
          opacity: 0;
          transform: translateY(10px) scale(0.96);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(100%);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .mapboxgl-popup-close-button {
        color: #ffffff !important;
        font-size: 20px !important;
        padding: 8px 12px !important;
        right: 8px !important;
        top: 8px !important;
        background: rgba(91, 33, 182, 0.2) !important;
        border-radius: 6px !important;
        transition: all 0.2s !important;
        z-index: 10 !important;
      }

      .mapboxgl-popup-close-button:hover {
        background: rgba(91, 33, 182, 0.4) !important;
        transform: scale(1.1) !important;
      }

      .stack-panel-popup ::-webkit-scrollbar {
        width: 6px;
      }

      .stack-panel-popup ::-webkit-scrollbar-track {
        background: rgba(91, 33, 182, 0.1);
        border-radius: 3px;
      }

      .stack-panel-popup ::-webkit-scrollbar-thumb {
        background: rgba(91, 33, 182, 0.4);
        border-radius: 3px;
      }

      .stack-panel-popup ::-webkit-scrollbar-thumb:hover {
        background: rgba(91, 33, 182, 0.6);
      }
    `;
    document.head.appendChild(style);

    // Fetch data
    fetch('/api/globe/data')
      .then(res => res.json())
      .then(data => {
        console.log('[Globe] Data loaded:', data.claims?.length, 'claims');
        console.log('[Globe] Sample claim:', data.claims?.[0]);
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
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0F] via-[#111118] to-[#0A0A0F]">
      <Script
        src="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js"
        strategy="beforeInteractive"
      />

      {/* ProofLocker Header - Mobile Optimized */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-gradient-to-r from-[#0A0A0F] via-[#111118] to-[#0A0A0F] backdrop-blur-[20px] border-b border-purple-500/20 z-[1000] shadow-[0_0_30px_rgba(91,33,182,0.15)]">
        <div className="flex items-center justify-between px-3 md:px-6 h-full">
          {/* Left: Logo */}
          <div className="flex items-center gap-2 md:gap-6">
            <a href="/" className="flex items-center transition-transform hover:scale-105">
              <img src="/logos/prooflocker-logo-dark.svg" alt="ProofLocker" className="h-6 md:h-8 w-auto" />
            </a>
            <span className="text-[10px] md:text-[12px] font-medium text-purple-300/70 tracking-wider hidden sm:block">
              Verifiable Claims Worldwide
            </span>
          </div>

          {/* Right: Navigation */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Feed Icon */}
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

            {/* Submit Button */}
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

      <div className="pt-14 h-screen">
        <GlobeMapbox claims={claims} osint={osint} />
      </div>
    </div>
  );
}
