"use client";

import Link from "next/link";
import { useState } from "react";
import BrandLogo from "@/components/BrandLogo";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/auth";
import { getPublicHandle } from "@/lib/public-handle";
import ClaimModal from "@/components/ClaimModal";
import InsightScorePill from "@/components/InsightScorePill";

export default function LandingHeader() {
  const { user } = useAuth();
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-gray-800 transition-colors duration-300" style={{ background: 'rgba(10, 10, 10, 0.75)' }}>
        <div className="mx-auto max-w-[1280px] px-6 md:px-12 lg:px-16 flex h-14 items-center justify-between">
          <BrandLogo />
          <div className="flex items-center gap-4 md:gap-6">
            <Link
              href="/lock"
              className="px-5 md:px-7 py-2 md:py-2.5 bg-gradient-to-r from-[#2E5CFF] to-[#5B21B6] hover:from-[#3D6CFF] hover:to-[#6B31C6] text-white text-sm md:text-base font-bold rounded-lg transition-all shadow-lg hover:shadow-[0_0_20px_rgba(46,92,255,0.5)] hover:scale-105 flex items-center gap-2 order-1"
            >
              Lock Prediction
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

            <Link
              href="/app"
              className="text-white/80 hover:text-[#2E5CFF] font-medium transition-all duration-200 text-sm md:text-base relative group order-2 hidden sm:block"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              Explore
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#2E5CFF] transition-all duration-200 group-hover:w-full" />
            </Link>

            {/* Insight Score Pill */}
            <div className="order-3">
              <InsightScorePill />
            </div>

            {/* Desktop: Show Sign In button or user menu */}
            {!user ? (
              <button
                onClick={() => setShowClaimModal(true)}
                className="text-white/80 hover:text-[#2E5CFF] font-medium transition-all duration-200 text-sm md:text-base hidden sm:block relative group order-4"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                Log In
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#2E5CFF] transition-all duration-200 group-hover:w-full" />
              </button>
            ) : (
              <div className="relative hidden sm:block order-4">
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

            {/* Mobile: Show user icon without container */}
            {user && (
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="sm:hidden p-1.5 hover:bg-white/5 rounded transition-all"
                aria-label="User menu"
              >
                <svg className="w-5 h-5 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
            )}

            {/* Mobile user menu dropdown - shared */}
            {user && showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40 sm:hidden"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="fixed top-16 right-4 w-64 bg-[#0a0a0a] border border-white/20 rounded-lg shadow-2xl z-50 py-2 sm:hidden">
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-xs text-neutral-400 mb-1">Signed in as</p>
                    <p className="text-sm text-white font-medium">{getPublicHandle(user)}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      handleSignOut();
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
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
        </div>
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
