"use client";

import { useEffect, useState } from "react";

export default function ActiveClaimsStat() {
  const [activeClaims, setActiveClaims] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/predictions')
      .then(r => r.json())
      .then(data => {
        const total = data?.count || data?.predictions?.length || 0;
        setActiveClaims(total);
      })
      .catch(() => {
        // Fallback on error
        setActiveClaims(null);
      });
  }, []);

  return (
    <>
      <div className="text-2xl md:text-3xl font-bold text-cyan-400">
        {activeClaims !== null ? activeClaims : '--'}
      </div>
      <div className="text-[10px] text-cyan-300/70 uppercase tracking-wide">Active Claims</div>
    </>
  );
}
