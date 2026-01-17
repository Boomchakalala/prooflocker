"use client";

import Link from "next/link";
import { useState } from "react";
import BrandLogo from "@/components/BrandLogo";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/auth";
import { getPublicHandle } from "@/lib/public-handle";
import ClaimModal from "@/components/ClaimModal";

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
      <header className="glass sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 md:h-16 items-center justify-between">
          <BrandLogo />
          <div className="flex items-center gap-3 md:gap-4">
            <Link
              href="/app"
              className="hidden sm:block px-4 py-2 text-sm md:text-base text-neutral-300 hover:text-white transition-all rounded-md hover:bg-white/5 border border-transparent hover:border-white/10"
            >
              Explore predictions
            </Link>

            {/* Show Sign In button if not logged in */}
            {!user ? (
              <button
                onClick={() => setShowClaimModal(true)}
                className="hidden sm:block px-4 py-2 text-sm md:text-base text-neutral-300 hover:text-white transition-all rounded-md hover:bg-white/5 border border-transparent hover:border-white/10"
              >
                Sign in
              </button>
            ) : (
              /* Show user menu if logged in - subtle pill style */
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all"
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

            <Link
              href="/lock"
              className="flex px-3 py-2 md:px-5 md:py-2.5 bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-600 hover:to-purple-600 text-white text-sm md:text-base font-medium rounded-md transition-all whitespace-nowrap"
            >
              Lock my prediction
            </Link>
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
