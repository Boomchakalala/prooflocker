"use client";

import { useState } from "react";

interface CopyButtonProps {
  text: string;
  displayText?: string;
  className?: string;
  iconSize?: "sm" | "md";
}

export default function CopyButton({
  text,
  displayText,
  className = "",
  iconSize = "md",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const iconClasses = iconSize === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-2 text-neutral-400 hover:text-white transition-colors ${className}`}
      title={`Copy ${displayText || "to clipboard"}`}
    >
      {copied ? (
        <>
          <svg
            className={`${iconClasses} text-green-500`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="text-xs text-green-500">Copied!</span>
        </>
      ) : (
        <>
          <svg
            className={iconClasses}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          {displayText && <span className="text-xs">{displayText}</span>}
        </>
      )}
    </button>
  );
}
