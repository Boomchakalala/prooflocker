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

// Mock data - 20 claims
const MOCK_CLAIMS = [
  { id: 1, claim: "US Presidential Election 2024 will have record voter turnout", lat: 40.7128, lng: -74.0060, status: "verified" as const, submitter: "@politicalanalyst", rep: 92, confidence: 87, lockedDate: "2024-01-15", outcome: "true" },
  { id: 2, claim: "Global semiconductor shortage will ease by Q3 2025", lat: 37.5665, lng: 126.9780, status: "pending" as const, submitter: "@techinsider", rep: 78, confidence: 64, lockedDate: "2024-01-20", outcome: null },
  { id: 3, claim: "UK will implement new AI regulation framework", lat: 51.5074, lng: -0.1278, status: "verified" as const, submitter: "@policyexpert", rep: 88, confidence: 91, lockedDate: "2024-01-10", outcome: "true" },
  { id: 4, claim: "Bitcoin will reach $100K by end of 2025", lat: 35.6762, lng: 139.6503, status: "disputed" as const, submitter: "@cryptotrader", rep: 54, confidence: 42, lockedDate: "2024-01-25", outcome: "false" },
  { id: 5, claim: "Climate summit will achieve binding emissions targets", lat: 48.8566, lng: 2.3522, status: "pending" as const, submitter: "@climatewatch", rep: 85, confidence: 71, lockedDate: "2024-02-01", outcome: null },
  { id: 6, claim: "Major tech merger will be blocked by regulators", lat: 37.7749, lng: -122.4194, status: "void" as const, submitter: "@antitrust_observer", rep: 76, confidence: 58, lockedDate: "2024-01-28", outcome: "void" },
  { id: 7, claim: "Australian housing market will correct by 15%", lat: -33.8688, lng: 151.2093, status: "pending" as const, submitter: "@marketanalyst", rep: 81, confidence: 68, lockedDate: "2024-02-03", outcome: null },
  { id: 8, claim: "India GDP growth will exceed 7% in FY2025", lat: 28.6139, lng: 77.2090, status: "verified" as const, submitter: "@economicdata", rep: 94, confidence: 89, lockedDate: "2024-01-18", outcome: "true" },
  { id: 9, claim: "EU will expand Digital Services Act enforcement", lat: 50.8503, lng: 4.3517, status: "pending" as const, submitter: "@euregulatorywatch", rep: 72, confidence: 76, lockedDate: "2024-02-05", outcome: null },
  { id: 10, claim: "Brazilian elections will see runoff in October", lat: -15.8267, lng: -47.9218, status: "disputed" as const, submitter: "@latampolitics", rep: 67, confidence: 51, lockedDate: "2024-01-30", outcome: "false" },
  { id: 11, claim: "Middle East peace talks will resume before June", lat: 31.7683, lng: 35.2137, status: "pending" as const, submitter: "@diplomaticsource", rep: 79, confidence: 62, lockedDate: "2024-02-02", outcome: null },
  { id: 12, claim: "Toronto real estate will stabilize in Q2", lat: 43.6532, lng: -79.3832, status: "pending" as const, submitter: "@cdnhousing", rep: 83, confidence: 73, lockedDate: "2024-01-22", outcome: null },
  { id: 13, claim: "German coalition will complete full term", lat: 52.5200, lng: 13.4050, status: "verified" as const, submitter: "@berlinpolitik", rep: 90, confidence: 84, lockedDate: "2024-01-12", outcome: "true" },
  { id: 14, claim: "Singapore fintech sector will grow 25% YoY", lat: 1.3521, lng: 103.8198, status: "pending" as const, submitter: "@asiafinance", rep: 86, confidence: 79, lockedDate: "2024-01-27", outcome: null },
  { id: 15, claim: "Mexico manufacturing output will exceed US imports", lat: 19.4326, lng: -99.1332, status: "disputed" as const, submitter: "@trademetrics", rep: 62, confidence: 48, lockedDate: "2024-02-04", outcome: "false" },
  { id: 16, claim: "Russian oil exports will shift to Asian markets", lat: 55.7558, lng: 37.6173, status: "verified" as const, submitter: "@energyintel", rep: 87, confidence: 82, lockedDate: "2024-01-16", outcome: "true" },
  { id: 17, claim: "South African power grid will achieve stability", lat: -33.9249, lng: 18.4241, status: "pending" as const, submitter: "@africanenergy", rep: 74, confidence: 66, lockedDate: "2024-01-29", outcome: null },
  { id: 18, claim: "Dubai property prices will rise 12% in 2025", lat: 25.2048, lng: 55.2708, status: "pending" as const, submitter: "@gulfpropertytracker", rep: 77, confidence: 69, lockedDate: "2024-02-01", outcome: null },
  { id: 19, claim: "Stockholm will implement congestion pricing expansion", lat: 59.3293, lng: 18.0686, status: "verified" as const, submitter: "@nordictransport", rep: 82, confidence: 88, lockedDate: "2024-01-14", outcome: "true" },
  { id: 20, claim: "Argentine peso stabilization plan will succeed", lat: -34.6037, lng: -58.3816, status: "disputed" as const, submitter: "@latamecon", rep: 58, confidence: 44, lockedDate: "2024-02-06", outcome: "false" }
];

// Mock data - 15 OSINT signals
const MOCK_OSINT = [
  { id: 1, title: "Satellite imagery confirms infrastructure changes in disputed region", source: "Bellingcat", lat: 50.4501, lng: 30.5234, timestamp: "2h ago", tags: ["OSINT", "Verification"] },
  { id: 2, title: "Investigation reveals coordinated disinformation network", source: "IntelCrab", lat: 52.5200, lng: 13.4050, timestamp: "4h ago", tags: ["Disinformation", "Investigation"] },
  { id: 3, title: "Video authentication confirms timeline discrepancies", source: "Aurora Intel", lat: 48.8566, lng: 2.3522, timestamp: "6h ago", tags: ["Video Analysis", "Timeline"] },
  { id: 4, title: "Supply chain tracking reveals unusual pattern deviations", source: "OSINT Tech", lat: 35.6762, lng: 139.6503, timestamp: "8h ago", tags: ["Supply Chain", "Anomaly"] },
  { id: 5, title: "Election monitoring data shows voting irregularities", source: "Bellingcat", lat: -15.8267, lng: -47.9218, timestamp: "10h ago", tags: ["Elections", "Monitoring"] },
  { id: 6, title: "Energy infrastructure damage confirmed via commercial satellites", source: "IntelCrab", lat: 55.7558, lng: 37.6173, timestamp: "12h ago", tags: ["Infrastructure", "Satellites"] },
  { id: 7, title: "Financial transaction patterns suggest laundering network", source: "Aurora Intel", lat: 40.7128, lng: -74.0060, timestamp: "14h ago", tags: ["Finance", "Investigation"] },
  { id: 8, title: "Military equipment movement tracked across border regions", source: "OSINT Tech", lat: 31.7683, lng: 35.2137, timestamp: "16h ago", tags: ["Military", "Movement"] },
  { id: 9, title: "Social media manipulation campaign targets regional elections", source: "Bellingcat", lat: 28.6139, lng: 77.2090, timestamp: "18h ago", tags: ["Social Media", "Elections"] },
  { id: 10, title: "Cybersecurity breach exposes government communications", source: "IntelCrab", lat: 51.5074, lng: -0.1278, timestamp: "20h ago", tags: ["Cybersecurity", "Breach"] },
  { id: 11, title: "Public records analysis reveals pattern inconsistencies", source: "Aurora Intel", lat: -33.8688, lng: 151.2093, timestamp: "22h ago", tags: ["Records", "Analysis"] },
  { id: 12, title: "Crowdsourced verification completed with high confidence", source: "OSINT Tech", lat: 1.3521, lng: 103.8198, timestamp: "1d ago", tags: ["Crowdsourced", "Verification"] },
  { id: 13, title: "Maritime tracking data shows unusual vessel patterns", source: "Bellingcat", lat: 25.2048, lng: 55.2708, timestamp: "1d ago", tags: ["Maritime", "Tracking"] },
  { id: 14, title: "Environmental monitoring detects pollution spike", source: "IntelCrab", lat: 37.7749, lng: -122.4194, timestamp: "1d ago", tags: ["Environment", "Monitoring"] },
  { id: 15, title: "Forensic analysis confirms document authenticity", source: "Aurora Intel", lat: 59.3293, lng: 18.0686, timestamp: "2d ago", tags: ["Forensics", "Documents"] }
];

export default function GlobePage() {
  const [claims, setClaims] = useState(MOCK_CLAIMS);
  const [osint, setOsint] = useState(MOCK_OSINT);
  const [stats, setStats] = useState({ activeClaims: 512, accuracy: 79 });

  // Update stats every 30 seconds (mock)
  useEffect(() => {
    const interval = setInterval(() => {
      setStats({
        activeClaims: Math.floor(500 + Math.random() * 50),
        accuracy: Math.floor(75 + Math.random() * 10),
      });
    }, 30000);

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
        <GlobeMapbox claims={claims} osint={osint} />
      </div>
    </div>
  );
}
