import { PredictionOutcome } from "@/lib/storage";

interface OutcomeBadgeProps {
  outcome: PredictionOutcome;
  size?: "sm" | "md" | "lg";
  showLabel?: "short" | "long";
}

export function getOutcomeConfig(outcome: PredictionOutcome) {
  switch (outcome) {
    case "correct":
      return {
        label: "Correct",
        longLabel: "Correct",
        class: "bg-emerald-500/30 border-emerald-400/60 text-emerald-300 shadow-emerald-500/30",
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        ),
      };
    case "incorrect":
      return {
        label: "Incorrect",
        longLabel: "Incorrect",
        class: "bg-red-500/30 border-red-400/60 text-red-300 shadow-red-500/30",
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        ),
      };
    case "invalid":
      return {
        label: "Invalid",
        longLabel: "Invalid",
        class: "bg-gray-500/30 border-gray-400/60 text-gray-300 shadow-gray-500/30",
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        ),
      };
    default:
      return {
        label: "Pending",
        longLabel: "Pending",
        class: "bg-amber-500/30 border-amber-400/60 text-amber-300 shadow-amber-500/30",
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
          </svg>
        ),
      };
  }
}

export default function OutcomeBadge({
  outcome,
  size = "md",
  showLabel = "short",
}: OutcomeBadgeProps) {
  const config = getOutcomeConfig(outcome);
  const label = showLabel === "long" ? config.longLabel : config.label;

  const sizeClasses = {
    sm: "px-2 py-1 text-xs gap-1",
    md: "px-2.5 py-1.5 text-xs gap-1.5",
    lg: "px-3 py-2 text-sm gap-2",
  };

  return (
    <span
      className={`inline-flex items-center rounded-lg font-bold border-2 shadow-lg ${config.class} ${sizeClasses[size]}`}
    >
      {config.icon}
      {label}
    </span>
  );
}
