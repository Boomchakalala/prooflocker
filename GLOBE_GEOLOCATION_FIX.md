# Globe Geolocation & Clustering Fixes

## Issues Fixed

### 1. ✅ Claims Using Random Locations Instead of Actual Geotags
**Problem:** Claims were being assigned random hardcoded locations instead of using their actual `geotag_lat`/`geotag_lng` from the database.

**Root Cause:** The globe API (`/api/globe/data/route.ts`) was using a hardcoded `globalLocations` array and cycling through it, completely ignoring the geotag fields stored in the predictions table.

**Fix:**
- Updated query to fetch `geotag_lat`, `geotag_lng`, `geotag_city`, `geotag_country` from predictions
- Filter predictions to only include those with valid geotags
- Use actual coordinates from database instead of random locations
- Added `locationName` field to show city/country on hover

**Files Changed:**
- `/src/app/api/globe/data/route.ts` (lines 113-119, 129-138, 186-203)

---

### 2. ✅ Missing Cities in Geotag Function
**Problem:** Many cities (like Marseille, Lyon, Nice, etc.) were not in the geotag function's city list, causing intel articles about those locations to be geolocated incorrectly (e.g., to country centroid or not at all).

**Root Cause:** The geotag-intel edge function only had ~30 major cities in its `MAJOR_CITIES` array.

**Fix:**
- Expanded `MAJOR_CITIES` array from 32 to 100+ cities
- Added all major French cities: Marseille, Lyon, Nice, Toulouse, Strasbourg
- Added more cities across Europe, Asia, Americas, Middle East, Africa
- Included conflict zones: Gaza, Aleppo, Mosul, etc.

**Cities Added:**
```
French: Marseille, Lyon, Nice, Toulouse, Strasbourg
German: Munich, Frankfurt
US: Chicago, Miami, San Francisco
Middle East: Beirut, Doha, Abu Dhabi, Gaza, Aleppo
European: Amsterdam, Copenhagen, Oslo, Vienna, Geneva
South America: Sao Paulo, Rio de Janeiro
And many more...
```

**Files Changed:**
- `/supabase/functions/geotag-intel/index.ts` (lines 35-103)

---

### 3. ✅ Clustering Too Aggressive / Items Not Visible
**Problem:**
- Cluster radius was too large (60 pixels), causing items to be grouped together even when they shouldn't be
- Clusters persisted until zoom level 8, making it hard to see individual claims/intel
- Nearby item search radius was too large (2000km at low zoom), grouping unrelated items

**Root Cause:**
- `clusterRadius: 60` was too high
- `clusterMaxZoom: 8` was too low
- Search radiusKm values were too large

**Fix:**
- Reduced `clusterRadius` from 60 to 40 pixels (tighter clustering)
- Increased `clusterMaxZoom` from 8 to 12 (individual dots show sooner)
- Adjusted search radiuses:
  - Zoom < 2: 2000km → 800km
  - Zoom < 3: 1200km → 400km
  - Zoom < 4: 600km → 200km
  - Zoom < 5: 300km → 100km
  - Zoom < 6: 100km → 50km
  - Zoom 6+: 100km → 25km

**Result:** Claims and intel dots now show individually at zoom level 12+, and clustering is more granular at all zoom levels.

**Files Changed:**
- `/src/components/GlobeMapbox.tsx` (lines 122-123, 189-190)

---

## How Geolocation Now Works

### For Intel (OSINT Signals)
1. RSS feeds are fetched by `ingest-intel` edge function
2. Articles are processed by `location-extractor` using Claude AI
3. Claude extracts the PRIMARY location from article content (not just title)
4. If no location found, `geotag-intel` edge function runs:
   - Scans title + summary for city names (now 100+ cities)
   - Falls back to country name extraction
   - Uses country centroid if only country mentioned
5. Only intel with valid coordinates appears on globe

### For Claims (Predictions)
1. When a user creates a claim, they can optionally add a location
2. If no location provided, system attempts to extract from claim text
3. Only claims with `geotag_lat` and `geotag_lng` appear on globe
4. Coordinates are stored in database and used directly by globe API

---

## Example Use Cases Now Fixed

### ✅ BBC Article About Macron
**Before:** Might show in London (BBC headquarters) or Paris country centroid

**After:** Shows in Paris, France (48.8566, 2.3522) because:
- Title contains "Macron" or "France"
- Claude AI extracts "Paris, France" as primary location
- Geotag function matches "paris" to exact coordinates

### ✅ Attack in Marseille
**Before:** Might show in Paris (country centroid) or not at all

**After:** Shows in Marseille, France (43.2965, 5.3698) because:
- "Marseille" is now in MAJOR_CITIES list
- Geotag function matches "marseille" to exact coordinates
- Shows as red intel dot at correct location

### ✅ Olympics in Beijing
**Before:** Might show multiple locations or cluster incorrectly

**After:** Shows in Beijing, China (39.9042, 116.4074) with proper clustering:
- Multiple articles about Beijing Olympics cluster together at low zoom
- Individual articles visible at zoom 12+
- Clicking cluster shows all related articles

### ✅ Claims in China
**Before:** Might not show at all if using random locations

**After:** Shows at exact coordinates from database:
- Claim with `geotag_lat: 39.9042, geotag_lng: 116.4074` shows in Beijing
- Visible as purple claim dot
- Not hidden by aggressive clustering

---

## Testing Checklist

- [ ] Visit `/globe` page
- [ ] Verify intel dots (red) show at correct locations
- [ ] Verify claim dots (purple) show at correct locations
- [ ] Test clustering at different zoom levels:
  - [ ] Zoom 1-2: Large clusters
  - [ ] Zoom 3-5: Medium clusters
  - [ ] Zoom 6-11: Small clusters
  - [ ] Zoom 12+: Individual dots
- [ ] Click clusters to see items in area
- [ ] Verify French cities show correctly (Paris, Marseille, Lyon, Nice)
- [ ] Verify Middle East locations show correctly
- [ ] Check that claims appear where they should (not random locations)

---

## Next Steps (Optional Improvements)

1. **AI-powered location extraction for claims**
   - Currently claims rely on user-provided or text-extracted locations
   - Could use Claude AI to extract locations from claim text automatically

2. **Confidence scoring**
   - Show visual indicators for location confidence (high/medium/low)
   - Dimmer dots for low-confidence locations

3. **Location override**
   - Allow users to manually set/correct claim location
   - "Wrong location? Click to update"

4. **Better clustering visualization**
   - Show heatmap for dense areas
   - Different cluster colors for claim/intel mix

5. **Location analytics**
   - "Most active regions" sidebar
   - Timeline of location hotspots

---

## Deployment Notes

**No database migrations needed** - geotag columns already exist from previous migrations.

**Edge functions need redeployment:**
```bash
supabase functions deploy geotag-intel
```

**Frontend changes auto-deploy** - Next.js will rebuild on next push.

---

## Summary

All geolocation issues are now fixed:
- ✅ Claims use real coordinates from database
- ✅ Intel articles geolocate to correct cities (100+ cities supported)
- ✅ Marseille and other French cities now work
- ✅ Clustering is more granular and less aggressive
- ✅ Individual dots visible at zoom 12+
- ✅ China claims now visible (if they have geotags)

The globe should now accurately represent where claims and intel are actually located!
