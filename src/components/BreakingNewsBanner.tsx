'use client';

import { useState } from 'react';

export interface BannerItem {
  type: string;
  text: string;
  location: string;
  time?: string;
}

interface BreakingNewsBannerProps {
  items: BannerItem[];
  className?: string;
}

/**
 * BreakingNewsBanner - Reusable auto-scrolling news ticker
 *
 * Features:
 * - Fast scroll: 30s desktop, 45s mobile
 * - Click/hover to pause
 * - Mobile-responsive with larger text on small screens
 * - Seamless loop by duplicating items
 */
export default function BreakingNewsBanner({ items, className = '' }: BreakingNewsBannerProps) {
  const [isPaused, setIsPaused] = useState(false);

  if (!items || items.length === 0) {
    return null;
  }

  const handleTogglePause = () => {
    setIsPaused(prev => !prev);
  };

  return (
    <>
      <style jsx>{`
        @keyframes marquee-fast {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-marquee-fast {
          animation: marquee-fast 30s linear infinite;
        }

        .animate-marquee-fast.paused {
          animation-play-state: paused;
        }

        /* Slower on mobile for better readability */
        @media (max-width: 768px) {
          .animate-marquee-fast {
            animation-duration: 45s;
          }
        }
      `}</style>

      <div
        className={`fixed top-16 left-0 right-0 md:right-[360px] z-[150] bg-slate-900/40 backdrop-blur-xl border-b border-slate-700/30 overflow-hidden cursor-pointer ${className}`}
        onClick={handleTogglePause}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        title={isPaused ? 'Click to resume' : 'Click to pause'}
      >
        <div className="relative h-9 flex items-center">
          <div className={`animate-marquee-fast whitespace-nowrap flex items-center gap-6 px-4 ${isPaused ? 'paused' : ''}`}>
            {/* Duplicate items for seamless loop */}
            {items.concat(items).map((item, idx) => (
              <div key={idx} className="inline-flex items-center gap-2 shrink-0">
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] md:text-[9px] font-bold rounded uppercase tracking-wide ${
                  item.type === 'INTEL'
                    ? 'bg-red-600/30 border border-red-500/50 text-red-200'
                    : 'bg-purple-600/30 border border-purple-500/50 text-purple-200'
                }`}>
                  {item.type}
                </span>
                <span className="text-xs md:text-xs text-white font-medium">
                  {item.text}
                </span>
                {item.location && (
                  <>
                    <span className="text-neutral-500 text-xs">•</span>
                    <span className="text-[10px] md:text-[10px] text-neutral-400">{item.location}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
