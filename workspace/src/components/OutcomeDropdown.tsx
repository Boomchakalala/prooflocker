"use client";

import { useState } from "react";
import type { PredictionOutcome } from "@/lib/storage";

interface OutcomeDropdownProps {
  predictionId: string;
  currentOutcome: PredictionOutcome;
  onOutcomeChange?: (newOutcome: PredictionOutcome) => void;
}

export default function OutcomeDropdown({ predictionId, currentOutcome, onOutcomeChange }: OutcomeDropdownProps) {
  const [outcome, setOutcome] = useState<PredictionOutcome>(currentOutcome);
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const outcomes: { value: PredictionOutcome; label: string; color: string }[] = [
    { value: "pending", label: "Pending", color: "text-yellow-400" },
    { value: "correct", label: "Correct", color: "text-green-400" },
    { value: "incorrect", label: "Incorrect", color: "text-red-400" },
    { value: "invalid", label: "Invalid", color: "text-gray-400" },
  ];

  const handleSelect = async (newOutcome: PredictionOutcome) => {
    if (newOutcome === outcome) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/predictions/${predictionId}/outcome`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome: newOutcome }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update outcome");
      }

      setOutcome(newOutcome);
      onOutcomeChange?.(newOutcome);
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating outcome:", error);
      alert(error instanceof Error ? error.message : "Failed to update outcome");
    } finally {
      setIsUpdating(false);
    }
  };

  const currentLabel = outcomes.find((o) => o.value === outcome)?.label || "Pending";
  const currentColor = outcomes.find((o) => o.value === outcome)?.color || "text-yellow-400";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors disabled:opacity-50"
      >
        <span className={`text-sm font-medium ${currentColor}`}>
          {currentLabel}
        </span>
        <svg
          className={`w-4 h-4 text-white/50 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-40 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md shadow-xl z-20 overflow-hidden">
            {outcomes.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                disabled={isUpdating}
                className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                  option.value === outcome
                    ? "bg-[#2a2a2a]"
                    : "hover:bg-[#2a2a2a]/50"
                } disabled:opacity-50`}
              >
                <span className={option.color}>{option.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
