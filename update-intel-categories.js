#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load env
const envFile = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Map intel tags to standard categories
function mapTagsToCategory(tags) {
  if (!tags || tags.length === 0) return 'culture';

  const tagStr = tags.join(' ').toLowerCase();

  // Crypto
  if (tagStr.match(/crypto|bitcoin/)) return 'crypto';

  // Politics-related
  if (tagStr.match(/politics|election|government|diplomatic|sanctions|ceasefire|coup/)) return 'politics';

  // Military/Conflict (also politics)
  if (tagStr.match(/military|conflict|war|drone|missile|attack|osint|geoint|investigative/)) return 'politics';

  // Cyber/Tech
  if (tagStr.match(/cyber|tech|data|ransomware|disinformation/)) return 'tech';

  // Markets/Economics
  if (tagStr.match(/markets|economics/)) return 'markets';

  // Sports
  if (tagStr.match(/sports|olympics|football|soccer|hockey/)) return 'sports';

  // Culture/General news (default for world/breaking news)
  return 'culture';
}

async function updateCategories() {
  console.log('🔄 Updating intel item categories...\n');

  // Get all intel items
  const { data: items, error } = await supabase
    .from('intel_items')
    .select('id, tags');

  if (error) {
    console.error('❌ Error fetching items:', error.message);
    process.exit(1);
  }

  console.log(`📊 Found ${items.length} items to update\n`);

  let updated = 0;
  for (const item of items) {
    const category = mapTagsToCategory(item.tags);

    const { error: updateError } = await supabase
      .from('intel_items')
      .update({ country_code: category })  // Temporarily use country_code field
      .eq('id', item.id);

    if (!updateError) {
      updated++;
      if (updated % 10 === 0) {
        console.log(`   Updated ${updated}/${items.length}...`);
      }
    }
  }

  console.log(`\n✅ Updated ${updated} items!`);

  // Show category breakdown
  const { data: breakdown } = await supabase
    .from('intel_items')
    .select('country_code');

  const counts = {};
  breakdown.forEach(item => {
    counts[item.country_code] = (counts[item.country_code] || 0) + 1;
  });

  console.log('\n📈 Category breakdown:');
  Object.entries(counts).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count}`);
  });
}

updateCategories().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
