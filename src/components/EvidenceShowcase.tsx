interface Evidence {
  id: string;
  type: 'primary' | 'secondary' | 'social' | 'media';
  title: string;
  url?: string;
  hash: string;
  createdAt: string;
}

interface EvidenceShowcaseProps {
  evidence: Evidence[];
  grade: 'A' | 'B' | 'C' | 'D' | 'F' | 'unverified';
  score: number;
  compact?: boolean;
}

export default function EvidenceShowcase({ evidence, grade, score, compact = false }: EvidenceShowcaseProps) {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' };
      case 'B': return { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' };
      case 'C': return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' };
      case 'D': return { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' };
      case 'F': return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' };
      default: return { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400' };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'primary':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        );
      case 'secondary':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
        );
      case 'social':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
        );
      case 'media':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'primary': return 'Primary Source';
      case 'secondary': return 'Secondary';
      case 'social': return 'Social';
      case 'media': return 'Media';
      default: return type;
    }
  };

  const getQualityBonus = (grade: string) => {
    switch (grade) {
      case 'A': return '+50%';
      case 'B': return '+35%';
      case 'C': return '+20%';
      case 'D': return '+10%';
      default: return '+0%';
    }
  };

  const gradeStyle = getGradeColor(grade);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    // Could add toast notification here
  };

  if (compact) {
    // Compact version for cards
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded ${gradeStyle.bg} ${gradeStyle.border} border`}>
        <svg className={`w-3.5 h-3.5 ${gradeStyle.text}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <span className={`text-xs font-semibold ${gradeStyle.text}`}>
          Evidence {score}/100 (Grade {grade})
        </span>
      </div>
    );
  }

  // Full version for proof pages
  return (
    <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-slate-700 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-lg ${gradeStyle.bg} ${gradeStyle.border} border`}>
            <span className={`text-2xl font-bold ${gradeStyle.text}`}>Grade {grade}</span>
          </div>
          <div>
            <div className="text-white font-semibold">Evidence Quality</div>
            <div className="text-sm text-slate-400">{score}/100 Score</div>
          </div>
        </div>
        <div className={`px-3 py-2 ${gradeStyle.bg} ${gradeStyle.border} border rounded-lg`}>
          <div className="text-xs text-slate-400">Quality Bonus</div>
          <div className={`text-lg font-bold ${gradeStyle.text}`}>{getQualityBonus(grade)}</div>
        </div>
      </div>

      {/* Evidence List */}
      {evidence.length > 0 ? (
        <div className="space-y-3">
          {evidence.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/50 border border-slate-700 hover:border-slate-600 rounded-lg p-4 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <div className="text-cyan-400">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium mb-1 truncate">{item.title}</div>
                    <div className="text-xs text-slate-500">{getTypeLabel(item.type)}</div>
                  </div>
                </div>
                <div className="text-xs text-slate-500 whitespace-nowrap ml-4">
                  {formatDate(item.createdAt)}
                </div>
              </div>

              {/* Hash */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800">
                <code className="flex-1 text-xs text-slate-400 font-mono truncate">
                  SHA-256: {item.hash}
                </code>
                <button
                  onClick={() => copyHash(item.hash)}
                  className="p-1.5 hover:bg-slate-800 rounded transition-colors"
                  title="Copy hash"
                >
                  <svg className="w-4 h-4 text-slate-400 hover:text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                  </svg>
                </button>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 hover:bg-slate-800 rounded transition-colors"
                    title="View source"
                  >
                    <svg className="w-4 h-4 text-slate-400 hover:text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <p className="text-slate-400 text-sm">No evidence attached yet</p>
        </div>
      )}

      {/* Footer note */}
      <div className="mt-5 pt-5 border-t border-slate-800">
        <p className="text-xs text-slate-500 text-center">
          All evidence is cryptographically hashed and timestamped on-chain
        </p>
      </div>
    </div>
  );
}
