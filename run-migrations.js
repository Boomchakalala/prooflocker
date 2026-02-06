const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://ofpzqtbhxajptpstbbme.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mcHpxdGJoeGFqcHRwc3RiYm1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzcxNzEzNCwiZXhwIjoyMDgzMjkzMTM0fQ.NQU-jHqmueH6zHy4MiC-LbpGNRIDADS-XAI1-Bi1FiQ';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

async function runMigrations() {
  try {
    console.log('Running category migration...');
    const categorySql = fs.readFileSync('./supabase-category-migration.sql', 'utf8');

    // Run ALTER TABLE for category
    const { error: catError } = await supabase.rpc('query', {
      query: "ALTER TABLE predictions ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'Other'"
    });

    console.log('Category result:', catError || 'success');

    console.log('\nRunning evidence scoring migration...');
    const { error: evError } = await supabase.rpc('query', {
      query: "ALTER TABLE predictions ADD COLUMN IF NOT EXISTS evidence_score INTEGER DEFAULT 0"
    });

    console.log('Evidence score result:', evError || 'success');

    console.log('\nDone! Check Supabase dashboard SQL editor to manually run the full migrations if needed.');
  } catch (error) {
    console.error('Migration error:', error);
  }
}

runMigrations();
