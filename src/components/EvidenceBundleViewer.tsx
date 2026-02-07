/**
 * Evidence Bundle Viewer Component
 *
 * Displays evidence bundles with chain of custody and on-chain status.
 */

'use client';

import { useState } from 'react';
import type { EvidenceBundle } from '@/lib/evidence-bundle';
import EvidenceGradeBadge from './EvidenceGradeBadge';
import OnChainBadge from './OnChainBadge';
import {
  LinkIcon,
  PhotoIcon,
  DocumentIcon,
  BellAlertIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';

interface EvidenceBundleViewerProps {
  bundle: EvidenceBundle;
  expanded?: boolean;
}

export default function EvidenceBundleViewer({ bundle, expanded = false }: EvidenceBundleViewerProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);

  // Get icon for item type
  const getItemIcon = (itemType: string) => {
    switch (itemType) {
      case 'link':
        return <LinkIcon className="w-4 h-4 text-blue-400" />;
      case 'screenshot':
        return <PhotoIcon className="w-4 h-4 text-green-400" />;
      case 'file':
        return <DocumentIcon className="w-4 h-4 text-purple-400" />;
      case 'osint_reference':
        return <BellAlertIcon className="w-4 h-4 text-red-400" />;
      default:
        return <DocumentIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="bg-slate-900/50 rounded-lg border border-slate-800 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-white font-semibold">Evidence Bundle</span>
          {bundle.evidenceScore !== undefined && (
            <EvidenceGradeBadge score={bundle.evidenceScore} size="md" showLabel />
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? (
            <ChevronUpIcon className="w-5 h-5" />
          ) : (
            <ChevronDownIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Summary info */}
      <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
        <span>{bundle.items.length} items</span>
        {bundle.evidenceTier && (
          <span className="capitalize">{bundle.evidenceTier} tier</span>
        )}
      </div>

      {/* On-chain status */}
      {bundle.deReference && (
        <div className="mb-3 flex items-center gap-2">
          <OnChainBadge variant="compact" />
          <span className="text-xs text-gray-400">
            Committed: {bundle.deReference.substring(0, 12)}...
          </span>
        </div>
      )}

      {/* Evidence items */}
      {isExpanded && (
        <div className="space-y-2 mb-3">
          {bundle.items.map((item, i) => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-2 rounded bg-slate-800/50 hover:bg-slate-800 transition-colors"
            >
              {/* Icon */}
              <div className="mt-0.5 flex-shrink-0">{getItemIcon(item.itemType)}</div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white font-medium truncate">
                  {item.title || item.fileName || `Evidence Item ${i + 1}`}
                </div>
                {item.description && (
                  <div className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                    {item.description}
                  </div>
                )}
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:underline mt-1 inline-block"
                  >
                    View source →
                  </a>
                )}
              </div>

              {/* Quality badge */}
              {item.domainQuality === 'reputable' && (
                <span className="px-1.5 py-0.5 text-[10px] rounded bg-green-500/10 text-green-400 border border-green-500/20 flex-shrink-0">
                  Verified Source
                </span>
              )}
              {item.osintSignalId && (
                <span className="px-1.5 py-0.5 text-[10px] rounded bg-red-500/10 text-red-400 border border-red-500/20 flex-shrink-0">
                  OSINT Linked
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Chain of custody */}
      <div className="pt-3 border-t border-slate-800 text-xs text-gray-500">
        Submitted by {bundle.submittedBy.substring(0, 8)}... •{' '}
        {new Date(bundle.createdAt).toLocaleDateString()}
      </div>

      {/* Bundle hash */}
      {bundle.bundleHash && (
        <div className="mt-2 text-xs text-gray-600 font-mono">
          Hash: {bundle.bundleHash.substring(0, 16)}...
        </div>
      )}
    </div>
  );
}
