"use client";

interface OnChainBadgeProps {
  variant?: "full" | "compact"; // full for Feed, compact for Globe
  className?: string;
}

export default function OnChainBadge({ variant = "full", className = "" }: OnChainBadgeProps) {
  const isCompact = variant === "compact";

  const baseClasses = `
    inline-flex items-center gap-1 font-medium rounded-md border
    text-purple-300 bg-purple-500/10 border-purple-400/30
    shadow-[0_0_10px_rgba(147,51,234,0.15)]
  `;

  const sizeClasses = isCompact
    ? "px-1.5 py-0.5 text-[9px]"
    : "px-2.5 py-1 text-xs";

  return (
    <div className={`${baseClasses} ${sizeClasses} ${className}`} title="Locked on Constellation DAG blockchain">
      <svg className={isCompact ? "w-2.5 h-2.5" : "w-3 h-3"} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
      </svg>
      <span>On-Chain</span>
    </div>
  );
}
