/**
 * Unified App Header
 *
 * Persistent navigation that works across Globe, Feed, and Lock pages.
 * Includes view switcher, quick actions, and live stats.
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface UnifiedHeaderProps {
  currentView?: 'globe' | 'feed';
  onLockClick?: () => void;
}

export default function UnifiedHeader({ currentView, onLockClick }: UnifiedHeaderProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [stats, setStats] = useState({ claims: 0, osint: 0 });
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Determine current view from pathname if not provided
  const activeView = currentView || (pathname === '/globe' ? 'globe' : 'feed');

  useEffect(() => {
    // Fetch live stats
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const [claimsRes, osintRes] = await Promise.all([
        fetch('/api/predictions'),
        fetch('/api/osint/mock'),
      ]);
      const claims = await claimsRes.json();
      const osint = await osintRes.json();
      setStats({
        claims: claims.predictions?.length || 0,
        osint: osint?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 backdrop-blur-xl border-b border-purple-500/20 z-[9999] shadow-lg shadow-purple-500/5">
      <div className="h-full max-w-[2000px] mx-auto px-6 flex items-center justify-between">

        {/* Left: Logo + View Switcher */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center">
            <img src="/logos/prooflocker-logo-dark.svg" alt="ProofLocker" className="h-8 w-auto" />
          </Link>

          {/* View Switcher */}
          <div className="hidden md:flex items-center gap-2 p-1 glass rounded-lg border border-slate-700">
            <Link
              href="/globe"
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeView === 'globe'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
              </svg>
              Globe
            </Link>
            <Link
              href="/app"
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeView === 'feed'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Feed
            </Link>
          </div>
        </div>

        {/* Center: Live Stats */}
        <div className="hidden lg:flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="font-semibold text-purple-300">{stats.claims}</span>
            <span>Claims</span>
          </div>
          <div className="w-px h-4 bg-slate-700" />
          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-semibold text-red-300">{stats.osint}</span>
            <span>OSINT</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">

          {/* Lock Claim Button */}
          <button
            onClick={onLockClick || (() => window.location.href = '/lock')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white transition-all shadow-lg shadow-purple-500/25"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="hidden md:inline">Lock Claim</span>
            <span className="md:hidden">Lock</span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-semibold text-sm hover:from-purple-500 hover:to-blue-500 transition-all"
            >
              {user?.email?.[0].toUpperCase() || 'A'}
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 top-12 w-64 glass border border-slate-700 rounded-lg shadow-2xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-slate-700">
                    <div className="text-sm font-medium text-white">
                      {user?.email || 'Anonymous User'}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {user ? 'Logged in' : 'Local only'}
                    </div>
                  </div>
                  <div className="p-2">
                    <Link
                      href="/app?tab=my"
                      className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      My Claims
                    </Link>
                    <Link
                      href="/how-scoring-works"
                      className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      How Scoring Works
                    </Link>
                    {!user && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          // TODO: Open claim modal
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-md transition-colors"
                      >
                        Claim Your Predictions
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile View Switcher (Bottom of header) */}
      <div className="md:hidden absolute bottom-0 left-0 right-0 flex items-center justify-center pb-2">
        <div className="flex items-center gap-2 p-1 glass rounded-lg border border-slate-700">
          <Link
            href="/globe"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeView === 'globe'
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                : 'text-gray-400'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
            </svg>
            Globe
          </Link>
          <Link
            href="/app"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeView === 'feed'
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                : 'text-gray-400'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16" />
            </svg>
            Feed
          </Link>
        </div>
      </div>
    </header>
  );
}
