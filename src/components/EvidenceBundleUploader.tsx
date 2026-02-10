/**
 * Evidence Bundle Uploader Component
 *
 * Allows users to upload evidence items with real-time score preview.
 * Can be prefilled from OSINT signals.
 */

'use client';

import { useState, useEffect } from 'react';
import type { EvidenceItem } from '@/lib/evidence-bundle';
import type { OsintSignal } from '@/lib/osint-types';
import { computeEvidenceScore, getEvidenceTier } from '@/lib/evidence-bundle';

interface EvidenceBundleUploaderProps {
  onUpload: (items: Omit<EvidenceItem, 'id' | 'bundleId' | 'itemOrder' | 'createdAt'>[]) => void;
  prefillOsint?: OsintSignal | null;
}

export default function EvidenceBundleUploader({
  onUpload,
  prefillOsint,
}: EvidenceBundleUploaderProps) {
  const [items, setItems] = useState<
    Omit<EvidenceItem, 'id' | 'bundleId' | 'itemOrder' | 'createdAt'>[]
  >([]);

  // Initialize with OSINT if provided
  useEffect(() => {
    if (prefillOsint) {
      setItems([
        {
          itemType: 'osint_reference',
          url: prefillOsint.sourceUrl,
          title: prefillOsint.title,
          description: `OSINT source: ${prefillOsint.sourceName}`,
          osintSignalId: prefillOsint.id,
          domainQuality: 'reputable',
        },
      ]);
    }
  }, [prefillOsint]);

  const addLink = () => {
    setItems([
      ...items,
      {
        itemType: 'link',
        url: '',
        title: '',
        description: '',
      },
    ]);
  };

  const updateItem = (
    index: number,
    field: keyof Omit<EvidenceItem, 'id' | 'bundleId' | 'itemOrder' | 'createdAt'>,
    value: any
  ) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    // Validate items
    const validItems = items.filter(
      (item) =>
        (item.itemType === 'osint_reference' && item.osintSignalId) ||
        (item.itemType === 'link' && item.url) ||
        (item.itemType === 'screenshot' && item.url) ||
        (item.itemType === 'file' && item.filePath)
    );

    if (validItems.length === 0) {
      alert('Please add at least one valid evidence item');
      return;
    }

    onUpload(validItems);
  };

  // Compute preview score
  const previewScore = computeEvidenceScore(items as any);
  const previewTier = getEvidenceTier(previewScore);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Evidence Bundle</h3>
        <span className="text-sm text-gray-400">{items.length} items</span>
      </div>

      {/* Prefill notice */}
      {prefillOsint && items.length > 0 && items[0].osintSignalId && (
        <div className="p-3 rounded-lg bg-red-950/20 border border-red-800/30">
          <div className="text-xs text-red-300 mb-1">Intel Reference Added</div>
          <div className="text-sm text-white">{items[0].title}</div>
        </div>
      )}

      {/* Items list */}
      <div className="space-y-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2"
          >
            {/* Item type selector */}
            <div className="flex items-center justify-between">
              <select
                value={item.itemType}
                onChange={(e) =>
                  updateItem(i, 'itemType', e.target.value as any)
                }
                disabled={item.itemType === 'osint_reference'}
                className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white text-sm disabled:opacity-50"
              >
                <option value="link">Link</option>
                <option value="screenshot">Screenshot</option>
                <option value="file">File</option>
                <option value="osint_reference">Intel Reference</option>
              </select>

              {/* Remove button (except for OSINT prefill) */}
              {!(item.itemType === 'osint_reference' && item.osintSignalId) && (
                <button
                  onClick={() => removeItem(i)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Remove
                </button>
              )}
            </div>

            {/* URL input */}
            {(item.itemType === 'link' || item.itemType === 'screenshot') && (
              <input
                type="url"
                placeholder="https://..."
                value={item.url || ''}
                onChange={(e) => updateItem(i, 'url', e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              />
            )}

            {/* Title input */}
            <input
              type="text"
              placeholder="Title or description"
              value={item.title || ''}
              onChange={(e) => updateItem(i, 'title', e.target.value)}
              disabled={item.itemType === 'osint_reference' && item.osintSignalId}
              className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none disabled:opacity-50"
            />

            {/* Domain quality selector (for links) */}
            {item.itemType === 'link' && (
              <select
                value={item.domainQuality || 'unknown'}
                onChange={(e) => updateItem(i, 'domainQuality', e.target.value)}
                className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white text-sm"
              >
                <option value="reputable">Reputable Source</option>
                <option value="social">Social Media</option>
                <option value="unknown">Unknown Source</option>
              </select>
            )}
          </div>
        ))}
      </div>

      {/* Add Link Button */}
      <button
        onClick={addLink}
        className="w-full py-2 border border-dashed border-slate-700 rounded-lg hover:border-slate-600 text-slate-400 hover:text-slate-300 transition-colors"
      >
        + Add Link
      </button>

      {/* Real-time score preview */}
      <div className="p-4 rounded-lg bg-gradient-to-br from-blue-950/30 to-purple-950/30 border border-blue-800/30">
        <div className="text-sm text-white font-medium mb-2">
          Evidence Score Preview
        </div>
        <div className="flex items-baseline gap-3">
          <div className="text-3xl font-bold text-blue-400">{previewScore}</div>
          <div className="text-sm text-gray-400">/ 100</div>
          <div className="ml-auto px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium capitalize">
            {previewTier}
          </div>
        </div>
        {items.length === 0 && (
          <div className="mt-2 text-xs text-gray-500">
            Add evidence items to see your score
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={items.length === 0}
        className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:from-purple-500 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Lock Claim with Evidence
      </button>
    </div>
  );
}
