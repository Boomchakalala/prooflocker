-- Check if any predictions have geotags
SELECT
  id,
  text_preview,
  geotag_city,
  geotag_country,
  geotag_lat,
  geotag_lng,
  created_at
FROM predictions
WHERE geotag_lat IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
