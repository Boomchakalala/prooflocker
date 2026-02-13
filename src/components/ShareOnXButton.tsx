"use client";

interface ShareOnXButtonProps {
  text: string;
  outcome: string | null;
  slug: string;
  timestamp: string;
}

export default function ShareOnXButton({ text, outcome, slug, timestamp }: ShareOnXButtonProps) {
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
  const proofUrl = `${siteUrl}/proof/${slug}`;
  const preview = text.length > 100 ? text.substring(0, 97) + "..." : text;

  const getTweetText = () => {
    if (outcome === "correct") {
      return `Called it.\n\n"${preview}"\n\nLocked on-chain, resolved CORRECT.\nVerify the proof:`;
    }
    if (outcome === "incorrect") {
      return `This one didn't age well.\n\n"${preview}"\n\nLocked on-chain, resolved incorrect.\nVerify the proof:`;
    }
    return `I just locked this claim on-chain with @ProofLocker. No edits. No excuses.\n\n"${preview}"\n\nVerify it yourself:`;
  };

  const handleShare = () => {
    const tweetText = getTweetText();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(proofUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer,width=550,height=420");
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-white font-medium text-sm transition-all"
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
      Share on X
    </button>
  );
}
