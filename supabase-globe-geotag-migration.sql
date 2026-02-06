-- Globe View: Add geotag fields to predictions table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ofpzqtbhxajptpstbbme/sql

-- Add geotag columns
ALTER TABLE predictions
ADD COLUMN IF NOT EXISTS geotag_lat DECIMAL(10, 8) NULL,     -- Latitude (-90 to 90)
ADD COLUMN IF NOT EXISTS geotag_lng DECIMAL(11, 8) NULL,     -- Longitude (-180 to 180)
ADD COLUMN IF NOT EXISTS geotag_city VARCHAR(255) NULL,      -- "Tel Aviv"
ADD COLUMN IF NOT EXISTS geotag_country VARCHAR(255) NULL,   -- "Israel"
ADD COLUMN IF NOT EXISTS geotag_region VARCHAR(255) NULL;    -- "Middle East" (optional)

-- Create index for geospatial queries
CREATE INDEX IF NOT EXISTS idx_predictions_geotag
ON predictions(geotag_lat, geotag_lng)
WHERE geotag_lat IS NOT NULL AND geotag_lng IS NOT NULL;

-- Add comment
COMMENT ON COLUMN predictions.geotag_lat IS 'Latitude for Globe View hotspots';
COMMENT ON COLUMN predictions.geotag_lng IS 'Longitude for Globe View hotspots';
COMMENT ON COLUMN predictions.geotag_city IS 'City name for display';
COMMENT ON COLUMN predictions.geotag_country IS 'Country name for display';

-- Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'predictions'
  AND column_name LIKE 'geotag%'
ORDER BY ordinal_position;
