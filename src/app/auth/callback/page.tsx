"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getOrCreateUserId } from "@/lib/user";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "claiming" | "success" | "error">("loading");
  const [message, setMessage] = useState("Processing login...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase will automatically detect and exchange tokens from the URL
        // We need to listen for the auth state change to know when the session is ready
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("[Auth Callback] Auth event:", event, "Session:", session ? "Present" : "None");

          if (event === 'SIGNED_IN' && session) {
            const user = session.user;
            console.log("[Auth Callback] User signed in:", user.id);

            try {
              setStatus("claiming");
              setMessage("Claiming your predictions...");

              console.log("[Auth Callback] Getting anonId...");

              // Get the anonymous ID from localStorage
              let anonId;
              try {
                anonId = getOrCreateUserId();
                console.log("[Auth Callback] anonId:", anonId);
              } catch (storageError) {
                console.error("[Auth Callback] localStorage error:", storageError);
                throw new Error("Failed to access local storage. Please try in a normal browser window (not incognito).");
              }

              if (!anonId) {
                console.warn("[Auth Callback] No anonId, skipping claim");
                setStatus("success");
                setMessage("Logged in successfully!");
                setTimeout(() => {
                  subscription.unsubscribe();
                  router.push("/?tab=my");
                }, 2000);
                return;
              }

              // Get the current session to send with the request
              const { data: { session } } = await supabase.auth.getSession();
              const accessToken = session?.access_token;
              console.log("[Auth Callback] Has access token:", !!accessToken);

              if (!accessToken) {
                throw new Error("No access token available");
              }

              console.log("[Auth Callback] Calling claim API...");
              // Claim all predictions with this anonId via API
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

              const response = await fetch('/api/claim-predictions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ anonId }),
                signal: controller.signal,
              });

              clearTimeout(timeoutId);

              if (!response.ok) {
                const errorData = await response.json();
                console.error("[Auth Callback] API error:", response.status, errorData);
                throw new Error(errorData.error || 'Failed to claim predictions');
              }

              console.log("[Auth Callback] Claim API response:", response.status);

              const data = await response.json();
              const claimedCount = data.claimedCount;

              setStatus("success");
              setMessage(`Successfully claimed ${claimedCount} prediction${claimedCount !== 1 ? 's' : ''}!`);

              // Redirect to My predictions tab after 2 seconds
              setTimeout(() => {
                subscription.unsubscribe();
                router.push("/?tab=my");
              }, 2000);
            } catch (claimError) {
              console.error("[Auth Callback] Claim error:", claimError);
              setStatus("error");

              if (claimError instanceof Error && claimError.name === 'AbortError') {
                setMessage("Request timed out - but your predictions may have been claimed. Check your profile.");
              } else {
                setMessage(claimError instanceof Error ? claimError.message : "Failed to claim predictions");
              }

              // Redirect to home after 3 seconds
              setTimeout(() => {
                subscription.unsubscribe();
                router.push("/");
              }, 3000);
            }
          } else if (event === 'USER_UPDATED') {
            // Session might be available now
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            if (currentSession) {
              console.log("[Auth Callback] Session available after USER_UPDATED");
            }
          }
        });

        // Also try to get session immediately in case it's already available
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (session) {
          console.log("[Auth Callback] Session immediately available");
          const user = session.user;

          try {
            setStatus("claiming");
            setMessage("Claiming your predictions...");

            // Get the anonymous ID from localStorage
            const anonId = getOrCreateUserId();
            console.log("[Auth Callback] anonId:", anonId);

            // Get the current session to send with the request
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            const accessToken = currentSession?.access_token;
            console.log("[Auth Callback] Has access token:", !!accessToken);

            if (!accessToken) {
              throw new Error("No access token available");
            }

            console.log("[Auth Callback] Calling claim API...");
            // Claim all predictions with this anonId via API
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            const response = await fetch('/api/claim-predictions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ anonId }),
              signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
              const errorData = await response.json();
              console.error("[Auth Callback] API error:", response.status, errorData);
              throw new Error(errorData.error || 'Failed to claim predictions');
            }

            console.log("[Auth Callback] Claim API response:", response.status);

            const data = await response.json();
            const claimedCount = data.claimedCount;

            setStatus("success");
            setMessage(`Successfully claimed ${claimedCount} prediction${claimedCount !== 1 ? 's' : ''}!`);

            // Redirect to My predictions tab after 2 seconds
            setTimeout(() => {
              subscription.unsubscribe();
              router.push("/?tab=my");
            }, 2000);
          } catch (claimError) {
            console.error("[Auth Callback] Claim error:", claimError);
            setStatus("error");

            if (claimError instanceof Error && claimError.name === 'AbortError') {
              setMessage("Request timed out - but your predictions may have been claimed. Check your profile.");
            } else {
              setMessage(claimError instanceof Error ? claimError.message : "Failed to claim predictions");
            }

            // Redirect to home after 3 seconds
            setTimeout(() => {
              subscription.unsubscribe();
              router.push("/");
            }, 3000);
          }
        } else if (sessionError) {
          // Only treat it as an error if it's not just "no session yet"
          if (sessionError.message !== "Auth session missing!") {
            console.error("[Auth Callback] Session error:", sessionError);
            throw sessionError;
          } else {
            console.log("[Auth Callback] Waiting for session from URL...");
          }
        } else {
          // No session yet, waiting for onAuthStateChange
          console.log("[Auth Callback] No session yet, waiting for auth state change...");
        }

        // Set a timeout in case auth never completes
        setTimeout(() => {
          setStatus("error");
          setMessage("Authentication timeout - please try again");
          setTimeout(() => {
            subscription.unsubscribe();
            router.push("/");
          }, 2000);
        }, 10000); // 10 second timeout

      } catch (error) {
        console.error("[Auth Callback] Error:", error);
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

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              <p className="text-white text-lg">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
