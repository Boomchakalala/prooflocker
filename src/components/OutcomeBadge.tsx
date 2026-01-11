import { PredictionOutcome } from "@/lib/storage";

interface OutcomeBadgeProps {
  outcome: PredictionOutcome;
  size?: "sm" | "md" | "lg";
  showLabel?: "short" | "long";
  adminOverridden?: boolean;
}

export function getOutcomeConfig(outcome: PredictionOutcome) {
  switch (outcome) {
    case "correct":
      return {
        label: "True",
        longLabel: "Resolved: True",
        class: "bg-green-500/10 text-green-400 border-green-500/30",
      };
    case "incorrect":
      return {
        label: "False",
        longLabel: "Resolved: False",
        class: "bg-red-500/10 text-red-400 border-red-500/30",
      };
    case "invalid":
      return {
        label: "Invalid",
        longLabel: "Invalid",
        class: "bg-neutral-500/10 text-neutral-400 border-neutral-500/30",
      };
    default:
      return {
        label: "Pending",
        longLabel: "Pending",
        class: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
      };
  }
}

export default function OutcomeBadge({
  outcome,
  size = "md",
  showLabel = "short",
  adminOverridden = false,
}: OutcomeBadgeProps) {
  const config = getOutcomeConfig(outcome);
  const label = showLabel === "long" ? config.longLabel : config.label;

  const sizeClasses = {
    sm: "px-2 py-[2px] text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 border rounded font-medium ${config.class} ${sizeClasses[size]}`}
    >
      {label}
      {adminOverridden && (
        <svg
          className="w-3 h-3"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <title>Admin finalized</title>
          <path
            fillRule="evenodd"
            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </span>
  );
}
