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
        class: "bg-green-600 text-white shadow-lg shadow-green-500/40",
      };
    case "incorrect":
      return {
        label: "Wrong",
        longLabel: "Resolved: Wrong",
        class: "bg-red-600 text-white shadow-lg",
      };
    case "invalid":
      return {
        label: "Invalid",
        longLabel: "Invalid",
        class: "bg-gray-600 text-white shadow-lg",
      };
    default:
      return {
        label: "Pending",
        longLabel: "Pending",
        class: "bg-yellow-600 text-white shadow-lg",
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
      className={`inline-flex items-center gap-1.5 rounded-full font-bold ${config.class} ${sizeClasses[size]}`}
    >
      {label}
    </span>
  );
}
