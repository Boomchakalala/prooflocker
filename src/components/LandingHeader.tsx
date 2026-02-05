"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/auth";
import { getPublicHandle } from "@/lib/public-handle";
import ClaimModal from "@/components/ClaimModal";
import ReputationScorePill from "@/components/ReputationScorePill";

export default function LandingHeader() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const isActive = (path: string) => pathname === path;
  const isLandingPage = pathname === "/";
  const isFeedPage = pathname === "/app";
  const isScoringPage = pathname === "/scoring";

  return (
    <>
      <header className="sticky top-0 z-50 bg-gradient-to-r from-[#0A0A0F] to-[#1E1238] border-b border-[#4C1D95]/20">
        <div className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-12 flex h-16 items-center justify-between">
          <Link href="/" className="flex-shrink-0">
            <BrandLogo />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            {/* Contextual nav links */}
            {!isLandingPage && (
              <Link
                href="/"
                className="text-white/80 hover:text-[#2E5CFF] font-medium transition-all duration-200 text-sm relative group flex items-center gap-1.5"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#2E5CFF] transition-all duration-200 group-hover:w-full" />
              </Link>
            )}

            {!isFeedPage && (
              <Link
                href="/app"
                className={`font-medium transition-all duration-200 text-sm relative group flex items-center gap-1.5 ${
                  isActive("/app") ? "text-[#2E5CFF]" : "text-white/80 hover:text-[#2E5CFF]"
                }`}
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Explore
                <span className={`absolute bottom-0 left-0 h-0.5 bg-[#2E5CFF] transition-all duration-200 ${
                  isActive("/app") ? "w-full" : "w-0 group-hover:w-full"
                }`} />
              </Link>
            )}

            <Link
              href="/how-scoring-works"
              className={`font-medium transition-all duration-200 text-sm relative group flex items-center gap-1.5 ${
                isActive("/how-scoring-works") ? "text-[#2E5CFF]" : "text-white/80 hover:text-[#2E5CFF]"
              }`}
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              Scoring
              <span className={`absolute bottom-0 left-0 h-0.5 bg-[#2E5CFF] transition-all duration-200 ${
                isActive("/how-scoring-works") ? "w-full" : "w-0 group-hover:w-full"
              }`} />
            </Link>

            {/* Lock CTA Button */}
            <Link
              href="/lock"
              className="px-5 py-2 bg-gradient-to-r from-[#2E5CFF] to-[#5B21B6] hover:from-[#3D6CFF] hover:to-[#6B31C6] text-white text-sm font-semibold rounded-lg transition-all shadow-lg hover:shadow-[0_0_20px_rgba(46,92,255,0.5)]"
            >
              Lock Prediction
            </Link>

            {/* Reputation Score Pill */}
            <ReputationScorePill />

            {/* Desktop: Show Sign In button or user menu */}
            {!user ? (
              <button
                onClick={() => setShowClaimModal(true)}
                className="text-white/80 hover:text-[#2E5CFF] font-medium transition-all duration-200 text-sm"
              >
                Log In
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{getPublicHandle(user)}</span>
                </button>

                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 glass border border-white/10 rounded-lg shadow-xl z-50 py-2">
                      <Link
                        href="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full px-4 py-2 text-left text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </Link>
                      {isFeedPage && (
                        <Link
                          href="/app?tab=my"
                          onClick={() => setShowUserMenu(false)}
                          className="w-full px-4 py-2 text-left text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          My Predictions
                        </Link>
                      )}
                      <Link
                        href="/how-scoring-works"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full px-4 py-2 text-left text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                        </svg>
                        Scoring Guide
                      </Link>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          handleSignOut();
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            {/* Mobile Lock Button - Icon only */}
            <Link
              href="/lock"
              className="p-2 bg-gradient-to-r from-[#2E5CFF] to-[#5B21B6] hover:from-[#3D6CFF] hover:to-[#6B31C6] text-white rounded-lg transition-all shadow-lg"
              title="Lock Prediction"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 hover:bg-white/5 rounded-lg transition-all"
              aria-label="Menu"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <>
            <div
              className="fixed inset-0 z-40 md:hidden"
              onClick={() => setShowMobileMenu(false)}
            />
            <div className="absolute top-full left-0 right-0 bg-gradient-to-r from-[#0A0A0F] to-[#1E1238] border-b border-[#4C1D95]/20 shadow-2xl z-50 md:hidden">
              <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
                {/* Home link (only show if not on landing page) */}
                {!isLandingPage && (
                  <Link
                    href="/"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-[#2E5CFF] hover:bg-white/5 rounded-lg transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Home
                  </Link>
                )}

                {/* Explore (only show if not on feed page) */}
                {!isFeedPage && (
                  <Link
                    href="/app"
                    onClick={() => setShowMobileMenu(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive("/app") ? "text-[#2E5CFF] bg-white/5" : "text-white/80 hover:text-[#2E5CFF] hover:bg-white/5"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Explore
                  </Link>
                )}

                {/* Scoring */}
                <Link
                  href="/how-scoring-works"
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive("/how-scoring-works") ? "text-[#2E5CFF] bg-white/5" : "text-white/80 hover:text-[#2E5CFF] hover:bg-white/5"
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                  Scoring
                </Link>

                {/* Divider */}
                <div className="h-px bg-white/10 my-2" />

                {/* User Section */}
                {user ? (
                  <>
                    <div className="px-4 py-2">
                      <p className="text-xs text-neutral-400 mb-1">Signed in as</p>
                      <p className="text-sm text-white font-medium">{getPublicHandle(user)}</p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-[#2E5CFF] hover:bg-white/5 rounded-lg transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile
                    </Link>
                    {isFeedPage && (
                      <Link
                        href="/app?tab=my"
                        onClick={() => setShowMobileMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-[#2E5CFF] hover:bg-white/5 rounded-lg transition-all"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        My Predictions
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setShowMobileMenu(false);
                        handleSignOut();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-white/80 hover:text-[#2E5CFF] hover:bg-white/5 rounded-lg transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      setShowClaimModal(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white/80 hover:text-[#2E5CFF] hover:bg-white/5 rounded-lg transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Log In
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </header>

      {/* Claim Modal */}
      {showClaimModal && (
        <ClaimModal
          onClose={() => setShowClaimModal(false)}
          onSuccess={() => setShowClaimModal(false)}
        />
      )}
    </>
  );
}
