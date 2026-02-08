'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface VoteButtonsProps {
  predictionId: string;
  initialUpvotes?: number;
  initialDownvotes?: number;
  compact?: boolean;
  onVoteChange?: (upvotes: number, downvotes: number) => void;
}

export default function VoteButtons({
  predictionId,
  initialUpvotes = 0,
  initialDownvotes = 0,
  compact = false,
  onVoteChange,
}: VoteButtonsProps) {
  const { user } = useAuth();
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null);
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch current vote status
  useEffect(() => {
    if (!user) return;

    fetch(`/api/predictions/${predictionId}/vote`)
      .then(res => res.json())
      .then(data => {
        setUserVote(data.userVote);
        setUpvotes(data.upvotes || 0);
        setDownvotes(data.downvotes || 0);
      })
      .catch(err => console.error('Error fetching vote status:', err));
  }, [predictionId, user]);

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!user) {
      setError('Please log in to vote');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/predictions/${predictionId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voteType }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to vote');
        setLoading(false);
        return;
      }

      // Update local state based on response
      if (data.action === 'removed') {
        // Vote was removed
        if (userVote === 'upvote') {
          setUpvotes(prev => Math.max(0, prev - 1));
        } else if (userVote === 'downvote') {
          setDownvotes(prev => Math.max(0, prev - 1));
        }
        setUserVote(null);
      } else if (data.action === 'updated') {
        // Vote was changed
        if (userVote === 'upvote') {
          setUpvotes(prev => Math.max(0, prev - 1));
          setDownvotes(prev => prev + 1);
        } else if (userVote === 'downvote') {
          setDownvotes(prev => Math.max(0, prev - 1));
          setUpvotes(prev => prev + 1);
        }
        setUserVote(voteType);
      } else if (data.action === 'added') {
        // New vote was added
        if (voteType === 'upvote') {
          setUpvotes(prev => prev + 1);
        } else {
          setDownvotes(prev => prev + 1);
        }
        setUserVote(voteType);
      }

      // Notify parent of vote change
      const newUpvotes = voteType === 'upvote' && data.action === 'added' ? upvotes + 1 :
                         voteType === 'downvote' && data.action === 'updated' && userVote === 'upvote' ? upvotes - 1 :
                         data.action === 'removed' && userVote === 'upvote' ? upvotes - 1 : upvotes;
      const newDownvotes = voteType === 'downvote' && data.action === 'added' ? downvotes + 1 :
                           voteType === 'upvote' && data.action === 'updated' && userVote === 'downvote' ? downvotes - 1 :
                           data.action === 'removed' && userVote === 'downvote' ? downvotes - 1 : downvotes;

      onVoteChange?.(newUpvotes, newDownvotes);
    } catch (err) {
      console.error('Error voting:', err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const netScore = upvotes - downvotes;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {/* Upvote */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleVote('upvote');
          }}
          disabled={loading}
          className={`flex items-center gap-1 transition-colors ${
            userVote === 'upvote'
              ? 'text-purple-400'
              : 'text-slate-400 hover:text-purple-400'
          } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title={user ? 'Upvote' : 'Log in to vote'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
          <span className="text-xs font-medium">{upvotes}</span>
        </button>

        {/* Downvote */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleVote('downvote');
          }}
          disabled={loading}
          className={`flex items-center gap-1 transition-colors ${
            userVote === 'downvote'
              ? 'text-red-400'
              : 'text-slate-400 hover:text-red-400'
          } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title={user ? 'Downvote' : 'Log in to vote'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          <span className="text-xs font-medium">{downvotes}</span>
        </button>

        {error && (
          <span className="text-xs text-red-400" title={error}>⚠️</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Upvote Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleVote('upvote');
        }}
        disabled={loading}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
          userVote === 'upvote'
            ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-purple-500/50 hover:text-purple-400'
        } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        title={user ? 'Upvote' : 'Log in to vote'}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
        <span className="text-sm font-medium">{upvotes}</span>
      </button>

      {/* Net Score */}
      <div className={`flex items-center gap-1 text-sm font-semibold ${
        netScore > 0 ? 'text-purple-400' : netScore < 0 ? 'text-red-400' : 'text-slate-400'
      }`}>
        {netScore > 0 && '+'}
        {netScore}
      </div>

      {/* Downvote Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleVote('downvote');
        }}
        disabled={loading}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
          userVote === 'downvote'
            ? 'bg-red-500/20 border-red-500/50 text-red-300'
            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-red-500/50 hover:text-red-400'
        } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        title={user ? 'Downvote' : 'Log in to vote'}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
        <span className="text-sm font-medium">{downvotes}</span>
      </button>

      {error && (
        <div className="text-xs text-red-400 px-2 py-1 bg-red-500/10 rounded border border-red-500/30">
          {error}
        </div>
      )}
    </div>
  );
}
