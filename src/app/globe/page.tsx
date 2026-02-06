'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import LandingHeader from '@/components/LandingHeader';

// Dynamically import globe component (client-side only)
const GlobeMapbox = dynamic(() => import('@/components/GlobeMapbox'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-[#0f172a]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-[#14b8a6] mx-auto mb-4" />
        <p className="text-[#94a3b8]">Initializing globe...</p>
        <p className="text-[#64748b] text-sm mt-2">Loading global claims & OSINT</p>
      </div>
    </div>
  ),
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
  const [stats, setStats] = useState({ activeClaims: 512, accuracy: 79 });
  const [loading, setLoading] = useState(true);

  // Fetch real data from API
  useEffect(() => {
    const fetchGlobeData = async () => {
      try {
        console.log('[Globe Page] Fetching data from API...');
        setLoading(true);
        const response = await fetch('/api/globe/data');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('[Globe Page] Received data:', {
          claimsCount: data.claims?.length,
          osintCount: data.osint?.length,
          firstClaim: data.claims?.[0]?.claim?.substring(0, 50)
        });

        if (data.claims && data.osint) {
          setClaims(data.claims);
          setOsint(data.osint);

          // Calculate stats from real data
          const activeClaims = data.claims.filter((c: Claim) => c.status === 'pending').length;
          const resolvedClaims = data.claims.filter((c: Claim) => c.outcome !== null);
          const correctClaims = resolvedClaims.filter((c: Claim) => c.outcome === 'true').length;
          const accuracy = resolvedClaims.length > 0
            ? Math.round((correctClaims / resolvedClaims.length) * 100)
            : 79;

          setStats({ activeClaims: activeClaims || data.count.claims, accuracy });
          console.log('[Globe Page] Stats updated:', { activeClaims: activeClaims || data.count.claims, accuracy });
        }
      } catch (error) {
        console.error('[Globe Page] Error fetching data:', error);
      } finally {
        setLoading(false);
        console.log('[Globe Page] Loading complete');
      }
    };

    fetchGlobeData();

    // Refresh data every 60 seconds
    const interval = setInterval(fetchGlobeData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-[#0f172a]/95 backdrop-blur-[20px] border-b border-[rgba(148,163,184,0.1)] z-[1000]">
        <div className="flex items-center justify-between px-6 h-full">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center">
              <img src="/logos/prooflocker-logo-dark.svg" alt="ProofLocker" className="h-9 w-auto" />
            </a>
            <span className="text-[13px] font-medium text-[#94a3b8] tracking-wide hidden lg:block">
              Verifiable Predictions Worldwide
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[13px] text-[#94a3b8]">
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>
                Active: <span className="font-semibold text-[#f8fafc]">{stats.activeClaims}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-[13px] text-[#94a3b8]">
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                Accuracy: <span className="font-semibold text-[#f8fafc]">{stats.accuracy}%</span>
              </span>
            </div>

            <a
              href="/lock"
              className="flex items-center gap-2 px-4 py-2 bg-[#14b8a6] text-[#0f172a] rounded-lg text-[13px] font-semibold transition-all hover:bg-[#0d9488] hover:-translate-y-px"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Submit Claim
            </a>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[rgba(20,184,166,0.15)] border border-[rgba(20,184,166,0.3)] rounded-full text-[12px] font-semibold text-[#14b8a6]">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>84</span>
            </div>
          </div>
        </div>
      </header>

      {/* Globe Container */}
      <div className="pt-14 h-screen">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-[#14b8a6] mx-auto mb-4" />
              <p className="text-[#94a3b8]">Loading globe data...</p>
              <p className="text-[#64748b] text-sm mt-2">Fetching {claims.length} claims & {osint.length} OSINT signals</p>
            </div>
          </div>
        ) : (
          <GlobeMapbox claims={claims} osint={osint} />
        )}
      </div>
    </div>
  );
}
