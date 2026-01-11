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
        longLabel: "Resolved: Correct",
        class: "bg-green-500/10 text-green-400 border-green-500/30",
      };
    case "incorrect":
      return {
        label: "Incorrect",
        longLabel: "Resolved: Incorrect",
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
    </span>
  );
}
