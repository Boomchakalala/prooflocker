'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';

interface BottomSheetProps {
  children: React.ReactNode;
  title?: string;
  itemCount?: number;
  tabs?: { label: string; active: boolean; onClick: () => void }[];
}

const COLLAPSED_HEIGHT = 80;

enum SnapPoint {
  Collapsed = 0,
  Half = 1,
  Full = 2,
}

function getSnapTranslateY(snap: SnapPoint): string {
  switch (snap) {
    case SnapPoint.Collapsed:
      return `calc(100vh - ${COLLAPSED_HEIGHT}px)`;
    case SnapPoint.Half:
      return '50vh';
    case SnapPoint.Full:
      return '64px';
  }
}

function getSnapPixelOffset(snap: SnapPoint, viewportHeight: number): number {
  switch (snap) {
    case SnapPoint.Collapsed:
      return viewportHeight - COLLAPSED_HEIGHT;
    case SnapPoint.Half:
      return viewportHeight * 0.5;
    case SnapPoint.Full:
      return 64;
  }
}

export default function BottomSheet({
  children,
  title,
  itemCount,
  tabs,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const touchCurrentY = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  const currentTranslateY = useRef<number | null>(null);

  const [snapPoint, setSnapPoint] = useState<SnapPoint>(SnapPoint.Collapsed);
  const [dragging, setDragging] = useState(false);
  const [dragTranslateY, setDragTranslateY] = useState<number | null>(null);

  const isExpanded = snapPoint === SnapPoint.Half || snapPoint === SnapPoint.Full;

  // Compute the pixel offset for the current snap point (used during drag calculations)
  const getCurrentSnapOffset = useCallback(() => {
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    return getSnapPixelOffset(snapPoint, vh);
  }, [snapPoint]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      touchStartY.current = touch.clientY;
      touchCurrentY.current = touch.clientY;
      isDragging.current = true;
      currentTranslateY.current = getCurrentSnapOffset();
      setDragging(true);
    },
    [getCurrentSnapOffset]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging.current) return;

      const touch = e.touches[0];
      touchCurrentY.current = touch.clientY;
      const delta = touchCurrentY.current - touchStartY.current;
      const newTranslateY = (currentTranslateY.current ?? getCurrentSnapOffset()) + delta;

      // Clamp: don't allow dragging above the full snap point (64px)
      // or below the collapsed snap point
      const vh = window.innerHeight;
      const minY = 64;
      const maxY = vh - COLLAPSED_HEIGHT;
      const clamped = Math.max(minY, Math.min(maxY, newTranslateY));

      setDragTranslateY(clamped);
    },
    [getCurrentSnapOffset]
  );

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    setDragging(false);

    const finalY = dragTranslateY;
    if (finalY === null) return;

    const vh = window.innerHeight;

    // Calculate distance to each snap point
    const collapsedY = getSnapPixelOffset(SnapPoint.Collapsed, vh);
    const halfY = getSnapPixelOffset(SnapPoint.Half, vh);
    const fullY = getSnapPixelOffset(SnapPoint.Full, vh);

    const distCollapsed = Math.abs(finalY - collapsedY);
    const distHalf = Math.abs(finalY - halfY);
    const distFull = Math.abs(finalY - fullY);

    // Also factor in velocity/direction: if the user flicked, bias toward that direction
    const delta = touchCurrentY.current - touchStartY.current;
    const absDelta = Math.abs(delta);
    const isFlick = absDelta > 50;

    let nearest: SnapPoint;

    if (isFlick) {
      // Flick up (negative delta) -> expand; flick down -> collapse
      if (delta < 0) {
        // Moving up
        if (snapPoint === SnapPoint.Collapsed) {
          nearest = SnapPoint.Half;
        } else if (snapPoint === SnapPoint.Half) {
          nearest = SnapPoint.Full;
        } else {
          nearest = SnapPoint.Full;
        }
      } else {
        // Moving down
        if (snapPoint === SnapPoint.Full) {
          nearest = SnapPoint.Half;
        } else if (snapPoint === SnapPoint.Half) {
          nearest = SnapPoint.Collapsed;
        } else {
          nearest = SnapPoint.Collapsed;
        }
      }
    } else {
      // Snap to nearest point by distance
      if (distCollapsed <= distHalf && distCollapsed <= distFull) {
        nearest = SnapPoint.Collapsed;
      } else if (distHalf <= distFull) {
        nearest = SnapPoint.Half;
      } else {
        nearest = SnapPoint.Full;
      }
    }

    setSnapPoint(nearest);
    setDragTranslateY(null);
  }, [dragTranslateY, snapPoint]);

  // Handle mouse events for desktop testing
  const mouseStartY = useRef<number>(0);
  const isMouseDragging = useRef<boolean>(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      mouseStartY.current = e.clientY;
      touchStartY.current = e.clientY;
      touchCurrentY.current = e.clientY;
      isMouseDragging.current = true;
      isDragging.current = true;
      currentTranslateY.current = getCurrentSnapOffset();
      setDragging(true);
    },
    [getCurrentSnapOffset]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDragging.current) return;

      touchCurrentY.current = e.clientY;
      const delta = e.clientY - touchStartY.current;
      const newTranslateY =
        (currentTranslateY.current ?? getCurrentSnapOffset()) + delta;

      const vh = window.innerHeight;
      const minY = 64;
      const maxY = vh - COLLAPSED_HEIGHT;
      const clamped = Math.max(minY, Math.min(maxY, newTranslateY));

      setDragTranslateY(clamped);
    };

    const handleMouseUp = () => {
      if (!isMouseDragging.current) return;
      isMouseDragging.current = false;
      isDragging.current = false;
      setDragging(false);

      // Trigger snap (reuse touchend logic inline)
      setDragTranslateY((prev) => {
        if (prev === null) return null;

        const vh = window.innerHeight;
        const collapsedY = getSnapPixelOffset(SnapPoint.Collapsed, vh);
        const halfY = getSnapPixelOffset(SnapPoint.Half, vh);
        const fullY = getSnapPixelOffset(SnapPoint.Full, vh);

        const distCollapsed = Math.abs(prev - collapsedY);
        const distHalf = Math.abs(prev - halfY);
        const distFull = Math.abs(prev - fullY);

        const delta = touchCurrentY.current - touchStartY.current;
        const absDelta = Math.abs(delta);
        const isFlick = absDelta > 50;

        let nearest: SnapPoint;

        if (isFlick) {
          if (delta < 0) {
            nearest =
              snapPoint === SnapPoint.Collapsed
                ? SnapPoint.Half
                : SnapPoint.Full;
          } else {
            nearest =
              snapPoint === SnapPoint.Full
                ? SnapPoint.Half
                : SnapPoint.Collapsed;
          }
        } else {
          if (distCollapsed <= distHalf && distCollapsed <= distFull) {
            nearest = SnapPoint.Collapsed;
          } else if (distHalf <= distFull) {
            nearest = SnapPoint.Half;
          } else {
            nearest = SnapPoint.Full;
          }
        }

        setSnapPoint(nearest);
        return null;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [getCurrentSnapOffset, snapPoint]);

  // Close sheet on backdrop click
  const handleBackdropClick = useCallback(() => {
    setSnapPoint(SnapPoint.Collapsed);
  }, []);

  // Current transform value
  const translateY =
    dragTranslateY !== null ? `${dragTranslateY}px` : getSnapTranslateY(snapPoint);

  const transitionStyle = dragging
    ? 'none'
    : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[199] transition-colors duration-300 ${
          isExpanded && !dragging ? 'bg-black/20' : 'bg-transparent pointer-events-none'
        }`}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="fixed inset-x-0 top-0 z-[200] flex flex-col bg-[#0a0a0f] border-t border-slate-700/50 rounded-t-2xl pb-[env(safe-area-inset-bottom)]"
        style={{
          height: '100vh',
          transform: `translateY(${translateY})`,
          transition: transitionStyle,
          willChange: 'transform',
          touchAction: 'none',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle Area */}
        <div
          className="flex-shrink-0 cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleMouseDown}
        >
          {/* Drag handle bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full bg-slate-600" />
          </div>

          {/* Header row: title/count + tabs */}
          <div className="flex items-center justify-between px-4 pb-3">
            {/* Left: title + count */}
            <div className="flex items-center gap-2 min-w-0">
              {title && (
                <h2 className="text-sm font-semibold text-slate-200 truncate">
                  {title}
                </h2>
              )}
              {typeof itemCount === 'number' && (
                <span className="flex-shrink-0 text-xs font-medium text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-full px-2 py-0.5">
                  {itemCount}
                </span>
              )}
            </div>

            {/* Right: tab pills */}
            {tabs && tabs.length > 0 && (
              <div className="flex items-center gap-1.5 ml-3">
                {tabs.map((tab) => (
                  <button
                    key={tab.label}
                    onClick={(e) => {
                      e.stopPropagation();
                      tab.onClick();
                    }}
                    className={`text-xs font-medium px-3 py-1 rounded-full transition-colors whitespace-nowrap ${
                      tab.active
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-slate-800/60 text-slate-400 border border-slate-700/50 hover:text-slate-300 hover:bg-slate-700/40'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-700/30 flex-shrink-0" />

        {/* Scrollable content */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain"
          style={{
            // Prevent content scroll from interfering with sheet drag in collapsed state
            pointerEvents: snapPoint === SnapPoint.Collapsed ? 'none' : 'auto',
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
}
