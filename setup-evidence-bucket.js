#!/usr/bin/env node

/**
 * Setup evidence-files storage bucket in Supabase
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

async function setup() {
  console.log('🚀 Setting up evidence-files storage bucket...\n');

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      process.exit(1);
    }

    const existingBucket = buckets?.find(b => b.id === 'evidence-files');

    if (existingBucket) {
      console.log('✅ evidence-files bucket already exists');
      console.log('   Public:', existingBucket.public);
      console.log('   Created:', existingBucket.created_at);
    } else {
      // Create bucket
      console.log('📦 Creating evidence-files bucket...');
      const { data, error } = await supabase.storage.createBucket('evidence-files', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: [
          'image/png',
          'image/jpeg',
          'image/jpg',
          'image/webp',
          'application/pdf',
          'text/plain'
        ]
      });

      if (error) {
        console.error('❌ Error creating bucket:', error);
        console.log('\n📋 Please create manually at:');
        console.log('   https://supabase.com/dashboard/project/ofpzqtbhxajptpstbbme/storage/buckets');
        process.exit(1);
      }

      console.log('✅ Bucket created successfully!');
    }

    console.log('\n⚠️  IMPORTANT: You must set up RLS policies manually:');
    console.log('   Go to: https://supabase.com/dashboard/project/ofpzqtbhxajptpstbbme/sql/new');
    console.log('   Run the SQL from: setup-evidence-files-bucket.sql');
    console.log('\n✅ Setup complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setup();
