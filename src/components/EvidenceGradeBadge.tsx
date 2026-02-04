"use client";

import type { EvidenceGrade } from "@/lib/evidence-types";
import { EvidenceGradeInfo } from "@/lib/evidence-types";

interface EvidenceGradeBadgeProps {
  grade: EvidenceGrade;
  size?: "sm" | "md" | "lg";
  showLabel?: "short" | "long" | "none";
}

export default function EvidenceGradeBadge({
  grade,
  size = "md",
  showLabel = "short",
}: EvidenceGradeBadgeProps) {
  const info = EvidenceGradeInfo[grade];

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  const colorClasses = {
    emerald: "bg-emerald-100 text-emerald-800 border-emerald-300",
    blue: "bg-blue-100 text-blue-800 border-blue-300",
    amber: "bg-amber-100 text-amber-800 border-amber-300",
    gray: "bg-gray-100 text-gray-600 border-gray-300",
  };

  const getLabel = () => {
    if (showLabel === "none") return null;
    if (showLabel === "short") return `Grade ${grade}`;
    return info.label;
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${sizeClasses[size]} ${
        colorClasses[info.color as keyof typeof colorClasses]
      }`}
      title={info.description}
    >
      {grade === "D" ? (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      {getLabel()}
    </span>
  );
}
