"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { claimPredictions } from "@/lib/storage";
import { getOrCreateUserId } from "@/lib/user";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "claiming" | "success" | "error">("loading");
  const [message, setMessage] = useState("Processing login...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase automatically handles the auth callback
        // Just wait a moment for the session to be established
        await new Promise(resolve => setTimeout(resolve, 500));

        // Get the session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }

        if (!session || !session.user) {
          throw new Error("No session found - please try logging in again");
        }

        const user = session.user;

        setStatus("claiming");
        setMessage("Claiming your predictions...");

        // Get the anonymous ID from localStorage
        const anonId = getOrCreateUserId();

        // Claim all predictions with this anonId
        const claimedCount = await claimPredictions(anonId, user.id);

        setStatus("success");
        setMessage(`Successfully claimed ${claimedCount} prediction${claimedCount !== 1 ? 's' : ''}!`);

        // Redirect to home after 2 seconds
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } catch (error) {
        console.error("Auth callback error:", error);
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Authentication failed");

        // Redirect to home after 3 seconds
        setTimeout(() => {
          router.push("/");
        }, 3000);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              <p className="text-white text-lg">{message}</p>
            </div>
          )}

          {status === "claiming" && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              <p className="text-white text-lg">{message}</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-white text-lg">{message}</p>
              <p className="text-white/70 text-sm">Redirecting...</p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-white text-lg">Error</p>
              <p className="text-white/70 text-sm">{message}</p>
              <p className="text-white/50 text-xs">Redirecting to home...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
