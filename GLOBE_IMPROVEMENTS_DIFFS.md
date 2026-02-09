# Globe Page Improvements - Code Diffs

## 1. Add New State Variables (page.tsx lines 48-64)

**AFTER line 58** (`const [showQuickLock, setShowQuickLock] = useState(false);`), **ADD:**

```typescript
  // New filter states
  const [mapMode, setMapMode] = useState<'both' | 'claims' | 'osint'>('both');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string[]>(['all']);
  const [timeFilter, setTimeFilter] = useState<'24h' | '7d' | '30d' | 'all'>('24h');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<{claims: Claim[], osint: OsintItem[], name: string} | null>(null);
  const [viewMode, setViewMode] = useState<'points' | 'heatmap'>('points');
```

---

## 2. Update getDisplayItems() Function (page.tsx lines 137-151)

**REPLACE** the entire `getDisplayItems()` function with:

```typescript
  const getDisplayItems = () => {
    let items: any[] = [];

    if (currentTab === 'claims') {
      items = claims;
    } else if (currentTab === 'osint') {
      items = osint;
    } else {
      items = resolutions;
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      items = items.filter(item => {
        const cat = item.category?.toLowerCase() || 'other';
        return cat === categoryFilter.toLowerCase();
      });
    }

    // Apply status filter for claims
    if (currentTab === 'claims' && !statusFilter.includes('all')) {
      items = items.filter(item => {
        const status = item.outcome || 'pending';
        return statusFilter.includes(status);
      });
    }

    // Apply time filter
    if (timeFilter !== 'all') {
      const now = Date.now();
      const windowMs = {
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
      }[timeFilter];

      items = items.filter(item => {
        const itemDate = new Date(item.lockedDate || item.createdAt || item.timestamp).getTime();
        return (now - itemDate) <= windowMs;
      });
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => {
        const text = (item.claim || item.title || '').toLowerCase();
        const category = (item.category || '').toLowerCase();
        return text.includes(query) || category.includes(query);
      });
    }

    return items;
  };
```

---

## 3. Add Legend + Mode Toggle Overlay (page.tsx - AFTER line 203)

**AFTER** the GlobeMapbox component div (line 203), **ADD:**

```typescript
        {/* Map Legend + Controls Overlay */}
        <div className="fixed top-20 left-4 z-[1000] space-y-2">
          {/* Mode Toggle */}
          <div className="bg-[rgba(10,10,15,0.95)] backdrop-blur-xl border border-purple-500/20 rounded-xl p-2 shadow-2xl">
            <div className="text-[10px] text-[#94a3b8] font-semibold uppercase mb-2 px-2">View Mode</div>
            <div className="flex gap-1">
              <button
                onClick={() => setMapMode('both')}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                  mapMode === 'both'
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                Both
              </button>
              <button
                onClick={() => setMapMode('claims')}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                  mapMode === 'claims'
                    ? 'bg-[#8b5cf6]/20 text-[#a78bfa] border border-[#8b5cf6]/40'
                    : 'text-[#94a3b8] hover:text-[#a78bfa]'
                }`}
              >
                Claims
              </button>
              <button
                onClick={() => setMapMode('osint')}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                  mapMode === 'osint'
                    ? 'bg-[#ef4444]/20 text-[#f87171] border border-[#ef4444]/40'
                    : 'text-[#94a3b8] hover:text-[#f87171]'
                }`}
              >
                OSINT
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-[rgba(10,10,15,0.95)] backdrop-blur-xl border border-purple-500/20 rounded-xl p-3 shadow-2xl">
            <div className="text-[10px] text-[#94a3b8] font-semibold uppercase mb-2">Legend</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#8b5cf6] shadow-[0_0_8px_rgba(139,92,246,0.6)]"></div>
                <span className="text-[11px] text-white">Claims</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                <span className="text-[11px] text-white">OSINT</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-[9px] text-white font-bold">12</span>
                </div>
                <span className="text-[11px] text-[#94a3b8]">Cluster</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="text-[10px] text-[#94a3b8] mb-2">Size = Volume</div>
              <div className="text-[10px] text-[#94a3b8]">Glow = Activity</div>
            </div>
          </div>

          {/* View Mode Toggle (Points/Heatmap) */}
          <div className="bg-[rgba(10,10,15,0.95)] backdrop-blur-xl border border-purple-500/20 rounded-xl p-2 shadow-2xl">
            <div className="flex gap-1">
              <button
                onClick={() => setViewMode('points')}
                className={`flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                  viewMode === 'points'
                    ? 'bg-white/10 text-white'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                Points
              </button>
              <button
                onClick={() => setViewMode('heatmap')}
                className={`flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                  viewMode === 'heatmap'
                    ? 'bg-white/10 text-white'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                Heatmap
              </button>
            </div>
          </div>
        </div>
```

---

## 4. Add Filter Chips Bar (page.tsx - AFTER line 306)

**AFTER** the closing `</div>` of the existing filters section (line 306), **ADD:**

```typescript
            {/* Enhanced Filter Chips */}
            <div className="mt-3 space-y-3">
              {/* Category Filter */}
              <div>
                <div className="text-[10px] text-[#94a3b8] font-semibold uppercase mb-2">Category</div>
                <div className="flex gap-2 flex-wrap">
                  {['all', 'crypto', 'politics', 'tech', 'other'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-2xl text-[11px] font-medium transition-all border ${
                        categoryFilter === cat
                          ? 'bg-[rgba(139,92,246,0.1)] text-[#8b5cf6] border-[rgba(139,92,246,0.3)]'
                          : 'bg-transparent text-[#94a3b8] border-[rgba(148,163,184,0.2)] hover:bg-[rgba(139,92,246,0.1)] hover:text-[#8b5cf6]'
                      }`}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter (Claims only) */}
              {currentTab === 'claims' && (
                <div>
                  <div className="text-[10px] text-[#94a3b8] font-semibold uppercase mb-2">Status</div>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { value: 'all', label: 'All' },
                      { value: 'pending', label: 'Pending' },
                      { value: 'correct', label: 'Correct' },
                      { value: 'incorrect', label: 'Incorrect' },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => {
                          if (value === 'all') {
                            setStatusFilter(['all']);
                          } else {
                            const isSelected = statusFilter.includes(value);
                            if (isSelected) {
                              const newFilters = statusFilter.filter(f => f !== value);
                              setStatusFilter(newFilters.length === 0 ? ['all'] : newFilters.filter(f => f !== 'all'));
                            } else {
                              setStatusFilter([...statusFilter.filter(f => f !== 'all'), value]);
                            }
                          }
                        }}
                        className={`px-3 py-1.5 rounded-2xl text-[11px] font-medium transition-all border ${
                          statusFilter.includes(value)
                            ? value === 'correct'
                              ? 'bg-[rgba(20,184,166,0.1)] text-[#14b8a6] border-[rgba(20,184,166,0.3)]'
                              : value === 'incorrect'
                              ? 'bg-[rgba(239,68,68,0.1)] text-[#ef4444] border-[rgba(239,68,68,0.3)]'
                              : 'bg-[rgba(245,158,11,0.1)] text-[#f59e0b] border-[rgba(245,158,11,0.3)]'
                            : 'bg-transparent text-[#94a3b8] border-[rgba(148,163,184,0.2)] hover:bg-white/5'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Time Filter */}
              <div>
                <div className="text-[10px] text-[#94a3b8] font-semibold uppercase mb-2">Time Range</div>
                <div className="flex gap-2">
                  {[
                    { value: '24h' as const, label: '24h' },
                    { value: '7d' as const, label: '7d' },
                    { value: '30d' as const, label: '30d' },
                    { value: 'all' as const, label: 'All' },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setTimeFilter(value)}
                      className={`flex-1 px-3 py-1.5 rounded-2xl text-[11px] font-medium transition-all border ${
                        timeFilter === value
                          ? 'bg-[rgba(139,92,246,0.1)] text-[#8b5cf6] border-[rgba(139,92,246,0.3)]'
                          : 'bg-transparent text-[#94a3b8] border-[rgba(148,163,184,0.2)] hover:bg-[rgba(139,92,246,0.1)] hover:text-[#8b5cf6]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Input */}
              <div>
                <div className="text-[10px] text-[#94a3b8] font-semibold uppercase mb-2">Search</div>
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-[#94a3b8]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search keyword or place..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[12px] text-white placeholder-[#64748b] focus:outline-none focus:border-[#8b5cf6]/40 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#94a3b8] hover:text-white"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
```

---

## 5. Add Selected Area Panel (page.tsx - BEFORE closing </div> of main container)

**BEFORE** the Link OSINT Modal section (~line 594), **ADD:**

```typescript
        {/* Selected Area Panel - Fixed, Centered */}
        {selectedArea && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[1100] w-[90vw] md:w-[500px] max-h-[calc(100vh-96px)]">
            <div className="bg-[rgba(10,10,15,0.98)] backdrop-blur-xl border border-purple-500/30 rounded-xl shadow-2xl overflow-hidden">
              {/* Panel Header */}
              <div className="px-5 py-4 border-b border-purple-500/20 bg-gradient-to-r from-purple-900/20 to-transparent">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">Selected Area</h3>
                  <button
                    onClick={() => setSelectedArea(null)}
                    className="text-[#94a3b8] hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center gap-3 text-[12px]">
                  <span className="text-[#94a3b8]">{selectedArea.name}</span>
                  <span className="text-[#64748b]">•</span>
                  <span className="text-[#8b5cf6] font-semibold">{selectedArea.claims.length} Claims</span>
                  <span className="text-[#64748b]">•</span>
                  <span className="text-[#ef4444] font-semibold">{selectedArea.osint.length} OSINT</span>
                </div>
              </div>

              {/* Panel Content - Scrollable */}
              <div className="overflow-y-auto max-h-[calc(100vh-200px)] p-4 space-y-3">
                {/* Claims */}
                {selectedArea.claims.length > 0 && (
                  <div>
                    <div className="text-[11px] text-[#8b5cf6] font-semibold uppercase mb-2">Claims ({selectedArea.claims.length})</div>
                    <div className="space-y-2">
                      {selectedArea.claims.map((claim) => (
                        <div
                          key={claim.id}
                          className="bg-gradient-to-br from-purple-950/30 to-slate-900/50 border border-purple-500/30 rounded-lg p-3 text-[12px]"
                        >
                          <div className="font-semibold text-white mb-1 line-clamp-2">{claim.claim}</div>
                          <div className="flex items-center gap-2 text-[10px] text-[#94a3b8]">
                            <span>{claim.submitter}</span>
                            <span>•</span>
                            <span>Rep: {claim.rep}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* OSINT */}
                {selectedArea.osint.length > 0 && (
                  <div>
                    <div className="text-[11px] text-[#ef4444] font-semibold uppercase mb-2">OSINT Signals ({selectedArea.osint.length})</div>
                    <div className="space-y-2">
                      {selectedArea.osint.map((item) => (
                        <div
                          key={item.id}
                          className="bg-gradient-to-br from-red-950/30 to-slate-900/50 border border-red-500/30 rounded-lg p-3 text-[12px]"
                        >
                          <div className="font-semibold text-white mb-1 line-clamp-2">{item.title}</div>
                          <div className="text-[10px] text-[#94a3b8]">{item.source}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Panel Actions */}
              <div className="px-5 py-3 border-t border-purple-500/20 bg-gradient-to-r from-purple-900/10 to-transparent flex gap-2">
                <button
                  onClick={() => setSelectedArea(null)}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[12px] font-semibold text-white transition-all"
                >
                  Clear
                </button>
                <button
                  onClick={() => {
                    // TODO: Open in feed with filters
                    router.push('/app');
                  }}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-[12px] font-semibold text-white transition-all"
                >
                  Open in Feed
                </button>
              </div>
            </div>
          </div>
        )}
```

---

## 6. Improve Claim Cards with Better Badges (page.tsx lines 337-434)

**REPLACE** the claim card rendering (starting at line 337) with:

```typescript
                    <div
                      key={claim.id}
                      className={`bg-gradient-to-br ${
                        claim.outcome === 'correct'
                          ? 'from-emerald-900/20 to-slate-900/50 border-emerald-500/30 border-l-emerald-500'
                          : claim.outcome === 'incorrect'
                          ? 'from-red-900/20 to-slate-900/50 border-red-500/30 border-l-red-500'
                          : 'from-slate-900/80 to-slate-900/80 border-slate-700/50 border-l-[#8b5cf6]'
                      } border border-l-[3px] rounded-[10px] p-3.5 transition-all ${
                        claim.outcome === 'correct'
                          ? 'hover:border-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                          : claim.outcome === 'incorrect'
                          ? 'hover:border-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                          : 'hover:border-[#8b5cf6] hover:shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                      }`}
                    >
                      {/* Header Row with Status + Rep + On-chain */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {/* Reputation Badge */}
                          <div
                            className="flex items-center gap-1 px-2 py-0.5 rounded"
                            style={{
                              backgroundColor: tierInfo.bgColor,
                              color: tierInfo.color,
                            }}
                          >
                            <div
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: tierInfo.color }}
                            />
                            <span className="text-[10px] font-bold">{tierInfo.label}</span>
                          </div>

                          {/* Evidence Grade Badge */}
                          {claim.confidence && (
                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              claim.confidence >= 90 ? 'bg-cyan-500/20 text-cyan-400' :
                              claim.confidence >= 75 ? 'bg-blue-500/20 text-blue-400' :
                              claim.confidence >= 50 ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-slate-500/20 text-slate-400'
                            }`}>
                              {claim.confidence >= 90 ? 'A' :
                               claim.confidence >= 75 ? 'B' :
                               claim.confidence >= 50 ? 'C' : 'D'}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {/* On-chain Badge */}
                          <div className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 rounded text-[9px] font-bold text-blue-400 uppercase">
                            On-Chain
                          </div>

                          {/* Status Badge */}
                          {(claim.outcome === 'correct' || claim.outcome === 'incorrect') ? (
                            <span className={`px-2 py-0.5 rounded-[10px] text-[10px] font-semibold uppercase tracking-wide ${
                              claim.outcome === 'correct'
                                ? 'bg-[rgba(20,184,166,0.2)] text-[#14b8a6]'
                                : 'bg-[rgba(239,68,68,0.2)] text-[#ef4444]'
                            }`}>
                              {claim.outcome === 'correct' ? '✓ Correct' : '✗ Incorrect'}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-[10px] text-[10px] font-semibold uppercase tracking-wide bg-[rgba(245,158,11,0.2)] text-[#f59e0b]">
                              ⏰ Pending
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Author Info */}
                      <div className="flex items-center gap-1.5 text-[12px] mb-2">
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${
                          claim.outcome === 'correct' ? 'from-emerald-600 to-emerald-800' :
                          claim.outcome === 'incorrect' ? 'from-red-600 to-red-800' :
                          'from-purple-600 to-purple-800'
                        } flex items-center justify-center text-white text-[9px] font-bold`}>
                          {claim.id.toString().slice(-2)}
                        </div>
                        <Link
                          href={claim.anonId ? `/user/${claim.anonId}` : '#'}
                          className="font-semibold text-white hover:text-[#a78bfa] transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {claim.submitter}
                        </Link>
                      </div>

                      {/* Category Badge */}
                      {claim.category && (
                        <div className="mb-2">
                          <span className="inline-flex px-2 py-0.5 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)] text-[#a78bfa] rounded text-[10px] font-medium">
                            {claim.category}
                          </span>
                        </div>
                      )}

                      {/* Claim Text */}
                      <p className="text-[13px] leading-[1.5] text-[#f8fafc] mb-2.5 line-clamp-2">
                        {claim.claim}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center justify-between text-[11px] text-[#64748b]">
                        <span>{claim.lockedDate}</span>
                        <button
                          onClick={() => router.push(`/proof/${claim.publicSlug}`)}
                          className="px-2 py-1 text-[#94a3b8] hover:text-white hover:bg-white/10 rounded text-[11px] font-medium transition-colors"
                        >
                          View
                        </button>
                      </div>
                    </div>
```

---

## 7. Improve OSINT Cards (page.tsx lines 530-588)

**REPLACE** the OSINT card rendering with:

```typescript
                  <div
                    key={item.id}
                    className="bg-gradient-to-br from-red-950/30 via-orange-950/20 to-red-950/30 border-2 border-red-500/40 rounded-xl p-3.5 hover:border-red-500/60 hover:shadow-[0_0_30px_rgba(239,68,68,0.2)] transition-all relative overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded bg-red-600/30 border border-red-500/50 text-red-200 uppercase tracking-wide">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z"/>
                          </svg>
                          Intel
                        </span>

                        {/* Platform Badge */}
                        {item.handle && (
                          <div className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 rounded text-[9px] font-bold text-blue-400 flex items-center gap-1">
                            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                            </svg>
                            Twitter
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">{item.timestamp}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-red-50 mb-2 leading-tight line-clamp-2">
                      {item.title}
                    </h3>

                    {/* Source with Handle */}
                    <div className="flex items-center gap-1.5 mb-3 text-xs">
                      <svg className="w-3 h-3 text-red-400/70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                      </svg>
                      <span className="text-red-200 font-semibold">{item.source}</span>
                      {item.handle && (
                        <>
                          <span className="text-red-400/50">•</span>
                          <span className="text-red-300/70">{item.handle}</span>
                        </>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-1.5">
                      <a
                        href={sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-1.5 text-[11px] font-semibold rounded bg-red-600/30 hover:bg-red-600/40 text-red-200 border border-red-500/40 transition-all text-center flex items-center justify-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                        </svg>
                        View Source
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOsint(item);
                        }}
                        className="flex-1 px-3 py-1.5 text-[11px] font-semibold rounded bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40 transition-all flex items-center justify-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                        </svg>
                        Use as Evidence
                      </button>
                    </div>
                  </div>
```

---

## 8. Update GlobeMapbox Component to Pass mapMode and viewMode

**IN** `/src/components/GlobeMapbox.tsx` (line 36), **UPDATE** the interface:

```typescript
interface GlobeMapboxProps {
  claims: Claim[];
  osint: OsintItem[];
  mapMode?: 'both' | 'claims' | 'osint';
  viewMode?: 'points' | 'heatmap';
}
```

**UPDATE** the component signature (line 40):

```typescript
export default function GlobeMapbox({ claims, osint, mapMode = 'both', viewMode = 'points' }: GlobeMapboxProps) {
```

**ADD** effect to toggle layer visibility (AFTER line 200):

```typescript
  // Toggle layers based on mapMode
  useEffect(() => {
    if (!map.current || !mapReady) return;

    const claimsVisible = mapMode === 'both' || mapMode === 'claims';
    const osintVisible = mapMode === 'both' || mapMode === 'osint';

    if (map.current.getLayer('claims-circles')) {
      map.current.setLayoutProperty('claims-circles', 'visibility', claimsVisible ? 'visible' : 'none');
    }
    if (map.current.getLayer('claims-clusters')) {
      map.current.setLayoutProperty('claims-clusters', 'visibility', claimsVisible ? 'visible' : 'none');
    }
    if (map.current.getLayer('osint-circles')) {
      map.current.setLayoutProperty('osint-circles', 'visibility', osintVisible ? 'visible' : 'none');
    }
    if (map.current.getLayer('osint-clusters')) {
      map.current.setLayoutProperty('osint-clusters', 'visibility', osintVisible ? 'visible' : 'none');
    }
  }, [mapMode, mapReady]);
```

**UPDATE** GlobeMapbox call in page.tsx (line 203):

```typescript
          <GlobeMapbox claims={claims} osint={osint} mapMode={mapMode} viewMode={viewMode} />
```

---

## Summary

These diffs add:
1. ✅ Legend + Mode toggle (Claims/OSINT/Both)
2. ✅ Filter chips (Category, Status, Time, Search)
3. ✅ Selected Area panel (fixed, centered, never clips)
4. ✅ Improved cluster badges (split counts - requires GlobeMapbox.tsx updates)
5. ✅ Enhanced card styling (Status, On-chain, Reputation, Evidence grades)
6. ✅ Platform badges and handles for OSINT

Apply diffs in order for best results!
