// Globe Side Panel: Shows claims for selected hotspot
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Hotspot {
  lat: number;
  lng: number;
  city: string;
  country: string;
  claim_count: number;
  avg_reliability: number;
}

interface Claim {
  id: string;
  user_id: string;
  pseudonym: string;
  reliability_score: number;
  text_preview: string;
  status: string;
  category: string;
  evidence_score: number | null;
  evidence_count: number;
  created_at: string;
  resolved_at: string | null;
  on_chain_verified: boolean;
}

interface GlobeSidePanelProps {
  hotspot: Hotspot | null;
  onClose: () => void;
}

export default function GlobeSidePanel({ hotspot, onClose }: GlobeSidePanelProps) {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'resolved'>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hotspot) return;

    setLoading(true);
    fetchClaims();
  }, [hotspot, activeTab]);

  const fetchClaims = async () => {
    if (!hotspot) return;

    try {
      const params = new URLSearchParams({
        lat: hotspot.lat.toString(),
        lng: hotspot.lng.toString(),
        status: activeTab,
        sort: 'reliability',
      });

      const response = await fetch(`/api/globe/hotspot-claims?${params}`);
      const data = await response.json();

      if (data.claims) {
        setClaims(data.claims);
      }
    } catch (error) {
      console.error('[Globe Side Panel] Error fetching claims:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!hotspot) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-orange-500';
      case 'correct': return 'text-green-500';
      case 'incorrect': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '🔴';
      case 'correct': return '✅';
      case 'incorrect': return '❌';
      default: return '⚪';
    }
  };

  const getReliabilityBadge = (score: number) => {
    if (score >= 800) return { label: 'Elite', color: 'bg-purple-500/20 text-purple-400' };
    if (score >= 700) return { label: 'Trusted+', color: 'bg-blue-500/20 text-blue-400' };
    if (score >= 500) return { label: 'Trusted', color: 'bg-green-500/20 text-green-400' };
    if (score >= 300) return { label: 'Active', color: 'bg-yellow-500/20 text-yellow-400' };
    return { label: 'New', color: 'bg-gray-500/20 text-gray-400' };
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="fixed right-0 top-0 h-full w-full md:w-[480px] bg-[#0f0f0f] border-l border-[#1f1f1f] shadow-2xl z-50 overflow-y-auto animate-slide-in-right">
      {/* Header */}
      <div className="sticky top-0 bg-[#0f0f0f] border-b border-[#1f1f1f] p-4 z-10">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h2 className="text-xl font-bold text-white">
              {hotspot.city}, {hotspot.country}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {hotspot.claim_count} claim{hotspot.claim_count !== 1 ? 's' : ''} • Avg Reliability: {hotspot.avg_reliability}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {(['all', 'pending', 'resolved'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-[#1a1a1a] text-white border border-[#2f2f2f]'
                  : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Claim Feed */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Loading claims...</p>
          </div>
        ) : claims.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">No claims in this region yet.</p>
            <p className="text-gray-500 text-xs mt-2">
              Be the first to lock a geotagged claim here! 🚀
            </p>
          </div>
        ) : (
          claims.map((claim) => {
            const badge = getReliabilityBadge(claim.reliability_score);
            return (
              <Link
                key={claim.id}
                href={`/predictions/${claim.id}`}
                className="block bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-4 hover:border-[#2f2f2f] transition-colors"
              >
                {/* Status & Time */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getStatusIcon(claim.status)}</span>
                    <span className={`text-sm font-medium ${getStatusColor(claim.status)}`}>
                      {claim.status.toUpperCase()}
                    </span>
                    {claim.evidence_score && (
                      <span className="text-xs text-gray-400">
                        (Evidence: {claim.evidence_score})
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(claim.created_at)}
                  </span>
                </div>

                {/* User Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${badge.color}`}>
                    {badge.label}
                  </span>
                  <span className="text-sm text-gray-400">{claim.pseudonym}</span>
                  <span className="text-xs text-gray-500">
                    (Rel: {claim.reliability_score})
                  </span>
                </div>

                {/* Claim Text */}
                <p className="text-white text-sm mb-3 line-clamp-3">
                  {claim.text_preview}
                </p>

                {/* Category & Evidence */}
                <div className="flex items-center gap-3 text-xs">
                  {claim.category && (
                    <span className="px-2 py-1 bg-[#1a1a1a] border border-[#2f2f2f] rounded text-gray-400">
                      {claim.category}
                    </span>
                  )}
                  {claim.evidence_count > 0 && (
                    <span className="text-gray-500">
                      {claim.evidence_count} evidence item{claim.evidence_count !== 1 ? 's' : ''}
                    </span>
                  )}
                  {claim.on_chain_verified && (
                    <span className="text-green-500">✓ On-Chain</span>
                  )}
                </div>

                {/* View Link */}
                <div className="mt-3 text-xs text-blue-400 hover:text-blue-300">
                  View Full Proof →
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
