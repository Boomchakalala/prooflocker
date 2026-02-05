"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { InsightScoreResponse } from "@/lib/insight-types";
import Link from "next/link";

export default function ReputationScorePill() {
  const { user } = useAuth();
  const [scoreData, setScoreData] = useState<InsightScoreResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Get anon ID from localStorage
  const getAnonId = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("anonId");
  };

  useEffect(() => {
    async function fetchScore() {
      try {
        const anonId = getAnonId();
        if (!anonId && !user) {
          setLoading(false);
          return;
        }

        const params = new URLSearchParams();
        if (anonId) {
          params.append("anonId", anonId);
        }

        const headers: HeadersInit = {};
        if (user) {
          const { supabase } = await import("@/lib/supabase");
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session?.access_token) {
            headers.Authorization = `Bearer ${session.access_token}`;
          }
        }

        const response = await fetch(`/api/insight/current?${params.toString()}`, {
          headers,
        });

        if (response.ok) {
          const data: InsightScoreResponse = await response.json();
          setScoreData(data);
        }
      } catch (err) {
        console.error("Error fetching insight score:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchScore();
  }, [user]);

  // Don't show anything while loading or if no score data
  if (loading || !scoreData || scoreData.score.totalPoints === 0) {
    return null;
  }

  const { score, rank } = scoreData;
  const showRank = rank && rank <= 1000;

  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#9370db]/20 to-[#00bfff]/20 border border-[#9370db]/40 rounded-full text-sm font-semibold text-white hover:border-[#00bfff] hover:shadow-lg hover:shadow-[#00bfff]/20 transition-all group"
      title="View your Reputation Score dashboard"
    >
      <svg className="w-4 h-4 text-[#00bfff] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      <span className="text-white/90 group-hover:text-white">
        {score.totalPoints.toLocaleString()}
      </span>
      {showRank && (
        <span className="text-xs px-1.5 py-0.5 bg-[#9370db]/30 rounded text-[#9370db] font-bold">
          #{rank}
        </span>
      )}
    </Link>
  );
}
