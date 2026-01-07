// Test script to call Digital Evidence API and show logs
const crypto = require('crypto');
const fs = require('fs');

// Load environment variables from .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

async function testDigitalEvidenceAPI() {
  console.log('\n========== TESTING DIGITAL EVIDENCE API ==========\n');

  // Create a test hash
  const testText = 'This is a test prediction at ' + new Date().toISOString();
  const hash = crypto.createHash('sha256').update(testText).digest('hex');

  console.log('Test text:', testText);
  console.log('SHA-256 hash:', hash);
  console.log('Hash length:', hash.length);

  // Build payload
  const payload = [
    {
      attestation: {
        hash: hash,
      },
    },
  ];

  const apiKey = envVars.DE_API_KEY;
  const apiUrl = envVars.DE_API_URL || 'https://de-api.constellationnetwork.io/v1';

  console.log('\n--- PRE-FETCH DEBUG ---');
  console.log('typeof payload:', typeof payload);
  console.log('JSON.stringify(payload):', JSON.stringify(payload));
  console.log('JSON.stringify(payload).length:', JSON.stringify(payload).length);
  console.log('API URL:', `${apiUrl}/fingerprints`);
  console.log('API Key (first 20 chars):', apiKey ? apiKey.substring(0, 20) + '...' : 'NOT SET');

  if (!apiKey) {
    console.error('\n❌ ERROR: DE_API_KEY not found in environment variables');
    process.exit(1);
  }

  // Make the request
  console.log('\n--- MAKING REQUEST ---');

  try {
    const response = await fetch(`${apiUrl}/fingerprints`, {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('\n--- POST-FETCH DEBUG ---');
    console.log('response.status:', response.status);
    console.log('response.statusText:', response.statusText);
    console.log('response.headers.get("content-type"):', response.headers.get('content-type'));

    const responseText = await response.text();
    console.log('Raw response text:', responseText);

    if (response.ok) {
      console.log('\n✅ SUCCESS!');
      try {
        const data = JSON.parse(responseText);
        console.log('Parsed response:', JSON.stringify(data, null, 2));
      } catch (e) {
        console.log('Could not parse response as JSON');
      }
    } else {
      console.log('\n❌ FAILED - Status:', response.status);
    }

  } catch (error) {
    console.error('\n❌ EXCEPTION:', error.message);
    console.error('Stack:', error.stack);
  }

  console.log('\n========== TEST COMPLETE ==========\n');
}

testDigitalEvidenceAPI();
