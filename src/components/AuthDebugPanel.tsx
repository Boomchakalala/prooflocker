"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/**
 * DEV-only diagnostics panel for debugging auth issues
 * Only shows when NEXT_PUBLIC_DEBUG_AUTH=true or in development mode
 */
export default function AuthDebugPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [debugInfo, setDebugInfo] = useState<{
    hostname: string;
    supabaseUrl: string;
    hasSession: boolean;
    userId: string | null;
    userEmail: string | null;
    sessionExpiry: string | null;
  } | null>(null);

  useEffect(() => {
    // Only show in development or if explicitly enabled
    const isDev = process.env.NODE_ENV === 'development';
    const isDebugEnabled = process.env.NEXT_PUBLIC_DEBUG_AUTH === 'true';

    if (!isDev && !isDebugEnabled) {
      return;
    }

    setIsVisible(true);

    const loadDebugInfo = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      // Mask the Supabase URL for security
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set';
      const maskedUrl = supabaseUrl.length > 20
        ? `${supabaseUrl.substring(0, 15)}...${supabaseUrl.substring(supabaseUrl.length - 10)}`
        : supabaseUrl;

      setDebugInfo({
        hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
        supabaseUrl: maskedUrl,
        hasSession: !!session,
        userId: session?.user?.id || null,
        userEmail: session?.user?.email || null,
        sessionExpiry: session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : null,
      });
    };

    loadDebugInfo();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadDebugInfo();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!isVisible || !debugInfo) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] max-w-sm">
      <div className="bg-black/90 backdrop-blur-md border border-yellow-500/50 rounded-lg p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            <h3 className="text-xs font-bold text-yellow-500 uppercase tracking-wide">
              Auth Debug Panel
            </h3>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white/50 hover:text-white transition-colors"
            title="Close debug panel"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between gap-4">
            <span className="text-white/50">Hostname:</span>
            <span className="text-white font-medium">{debugInfo.hostname}</span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-white/50">Supabase URL:</span>
            <span className="text-white/70 text-[10px] truncate max-w-[200px]" title={debugInfo.supabaseUrl}>
              {debugInfo.supabaseUrl}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-white/50">Session:</span>
            <span className={`font-medium ${debugInfo.hasSession ? 'text-green-400' : 'text-red-400'}`}>
              {debugInfo.hasSession ? 'Active' : 'None'}
            </span>
          </div>

          {debugInfo.userId && (
            <div className="flex justify-between gap-4">
              <span className="text-white/50">User ID:</span>
              <span className="text-white/70 text-[10px] truncate max-w-[200px]" title={debugInfo.userId}>
                {debugInfo.userId.substring(0, 8)}...
              </span>
            </div>
          )}

          {debugInfo.userEmail && (
            <div className="flex justify-between gap-4">
              <span className="text-white/50">Email:</span>
              <span className="text-white/70 text-[10px] truncate max-w-[200px]" title={debugInfo.userEmail}>
                {debugInfo.userEmail}
              </span>
            </div>
          )}

          {debugInfo.sessionExpiry && (
            <div className="flex justify-between gap-4">
              <span className="text-white/50">Expires:</span>
              <span className="text-white/70 text-[10px]">
                {debugInfo.sessionExpiry}
              </span>
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-[10px] text-white/40 leading-relaxed">
            This panel helps debug auth issues like environment mismatches.
            Check that your hostname matches your Supabase project settings.
          </p>
        </div>
      </div>
    </div>
  );
}
