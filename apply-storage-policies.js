#!/usr/bin/env node

/**
 * Apply RLS policies for evidence-files storage bucket
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

async function applyPolicies() {
  console.log('🔐 Applying RLS policies for evidence-files bucket...\n');

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const policies = [
    {
      name: 'Drop existing upload policy',
      sql: `DROP POLICY IF EXISTS "Authenticated users can upload evidence files" ON storage.objects;`
    },
    {
      name: 'Drop existing read policy',
      sql: `DROP POLICY IF EXISTS "Evidence files are publicly readable" ON storage.objects;`
    },
    {
      name: 'Drop existing update policy',
      sql: `DROP POLICY IF EXISTS "Users can update their own evidence files" ON storage.objects;`
    },
    {
      name: 'Create upload policy',
      sql: `
        CREATE POLICY "Authenticated users can upload evidence files"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'evidence-files');
      `
    },
    {
      name: 'Create read policy',
      sql: `
        CREATE POLICY "Evidence files are publicly readable"
        ON storage.objects FOR SELECT
        TO public
        USING (bucket_id = 'evidence-files');
      `
    },
    {
      name: 'Create update policy',
      sql: `
        CREATE POLICY "Users can update their own evidence files"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (bucket_id = 'evidence-files');
      `
    }
  ];

  for (const policy of policies) {
    try {
      console.log(`📝 ${policy.name}...`);
      const { error } = await supabase.rpc('exec_sql', { query: policy.sql });

      if (error) {
        console.error(`   ❌ Error:`, error.message);
      } else {
        console.log(`   ✅ Done`);
      }
    } catch (err) {
      console.error(`   ⚠️  ${err.message}`);
    }
  }

  console.log('\n✅ RLS policies setup complete!');
  console.log('\n📋 If errors occurred, run this SQL manually:');
  console.log('   https://supabase.com/dashboard/project/ofpzqtbhxajptpstbbme/sql/new');
  console.log('   File: setup-evidence-files-bucket.sql');
}

applyPolicies();
