"use client";

import type { CardStatus } from "@/lib/card-view-model";

interface StatusBadgeProps {
  status: CardStatus;
  variant?: "full" | "compact"; // full for Feed, compact for Globe
  className?: string;
}

export default function StatusBadge({ status, variant = "full", className = "" }: StatusBadgeProps) {
  const isCompact = variant === "compact";

  const statusConfig = {
    pending: {
      label: "PENDING",
      icon: (
        <svg className={isCompact ? "w-2.5 h-2.5" : "w-4 h-4"} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <path strokeLinecap="round" d="M12 6v6l4 2"/>
        </svg>
      ),
      baseColor: "text-white",
      bgColor: "bg-gradient-to-r from-amber-500 to-orange-500",
      borderColor: "border-amber-400/30",
      animate: "",
    },
    correct: {
      label: "Correct",
      icon: (
        <svg className={isCompact ? "w-2.5 h-2.5" : "w-4 h-4"} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
      ),
      baseColor: "text-white",
      bgColor: "bg-gradient-to-r from-emerald-500 to-emerald-600",
      borderColor: "border-emerald-400/30",
      animate: "",
    },
    incorrect: {
      label: "Incorrect",
      icon: (
        <svg className={isCompact ? "w-2.5 h-2.5" : "w-4 h-4"} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      ),
      baseColor: "text-white",
      bgColor: "bg-gradient-to-r from-red-500 to-red-600",
      borderColor: "border-red-400/30",
      animate: "",
    },
    verified: {
      label: "Verified",
      icon: (
        <svg className={isCompact ? "w-2.5 h-2.5" : "w-4 h-4"} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
        </svg>
      ),
      baseColor: "text-white",
      bgColor: "bg-gradient-to-r from-emerald-500 to-emerald-600",
      borderColor: "border-emerald-400/30",
      animate: "",
    },
    disputed: {
      label: "Disputed",
      icon: (
        <svg className={isCompact ? "w-2.5 h-2.5" : "w-4 h-4"} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
      ),
      baseColor: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-400/30",
      animate: "",
    },
    void: {
      label: "Void",
      icon: (
        <svg className={isCompact ? "w-2.5 h-2.5" : "w-4 h-4"} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <path strokeLinecap="round" d="M15 9l-6 6M9 9l6 6"/>
        </svg>
      ),
      baseColor: "text-slate-400",
      bgColor: "bg-slate-500/10",
      borderColor: "border-slate-400/30",
      animate: "",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  const baseClasses = `
    inline-flex items-center gap-1.5 font-semibold rounded-lg border transition-all
    ${config.baseColor} ${config.bgColor} ${config.borderColor} ${config.animate}
    hover:scale-105
  `;

  const sizeClasses = isCompact
    ? "px-2 py-0.5 text-[10px]"
    : "px-3 py-1.5 text-sm";

  return (
    <div className={`${baseClasses} ${sizeClasses} ${className}`}>
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
}
