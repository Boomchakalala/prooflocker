"use client";

import { useState, useEffect } from "react";

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'pending' | 'granted' | 'denied'>('pending');

  useEffect(() => {
    // Check if user has already responded to consent
    const consent = localStorage.getItem('prooflocker_consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = async () => {
    // Save consent
    localStorage.setItem('prooflocker_consent', 'accepted');
    localStorage.setItem('prooflocker_location_consent', 'true');

    // Try to get location permission
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationPermission('granted');
          console.log('[CookieConsent] Location permission granted');
        },
        () => {
          setLocationPermission('denied');
          console.log('[CookieConsent] Location permission denied');
        },
        { timeout: 5000 }
      );
    }

    setShow(false);
  };

  const handleDecline = () => {
    // Save minimal consent (no location tracking)
    localStorage.setItem('prooflocker_consent', 'declined');
    localStorage.setItem('prooflocker_location_consent', 'false');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[1000] p-4 bg-slate-900/98 backdrop-blur-xl border-t border-slate-700/50 shadow-2xl">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Location & Cookies
          </h3>
          <p className="text-sm text-slate-300">
            ProofLocker uses cookies for essential functionality and tracks your approximate location when you lock claims to display them on our global map. Your precise location is never stored.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Learn more in our{" "}
            <a href="/legal/privacy" className="text-purple-400 hover:text-purple-300 underline">Privacy Policy</a>
            {" "}and{" "}
            <a href="/legal/terms" className="text-purple-400 hover:text-purple-300 underline">Terms of Service</a>.
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={handleDecline}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg transition-all text-sm"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-lg transition-all text-sm shadow-lg shadow-purple-500/25"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
