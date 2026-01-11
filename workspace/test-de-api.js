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

  const apiKey = envVars.DE_API_KEY;
  const apiUrl = envVars.DE_API_URL || 'https://de-api.constellationnetwork.io/v1';
  const orgId = envVars.DE_ORG_ID;
  const tenantId = envVars.DE_TENANT_ID;

  if (!apiKey || !orgId || !tenantId) {
    console.error('\n❌ ERROR: Missing required environment variables');
    console.error('DE_API_KEY:', apiKey ? 'SET' : 'NOT SET');
    console.error('DE_ORG_ID:', orgId ? 'SET' : 'NOT SET');
    console.error('DE_TENANT_ID:', tenantId ? 'SET' : 'NOT SET');
    process.exit(1);
  }

  // Build payload according to official API spec
  const timestamp = new Date().toISOString();
  const eventId = crypto.randomUUID();
  const documentId = crypto.randomUUID();

  // API requires hex strings (not plain text or UUIDs) for certain fields
  const signerId = crypto.createHash('sha256').update('ProofLocker').digest('hex');
  const documentRef = crypto.createHash('sha256').update(documentId).digest('hex');
  const proofId = crypto.createHash('sha256').update(crypto.randomUUID()).digest('hex');
  const signature = crypto.createHash('sha256').update('placeholder_signature_' + hash).digest('hex');

  const payload = [
    {
      attestation: {
        content: {
          orgId,
          tenantId,
          eventId,
          signerId,
          documentId,
          documentRef,
          timestamp,
          version: 1,
        },
        proofs: [
          {
            id: proofId,
            signature,
            algorithm: 'SECP256K1_RFC8785_V1',
          },
        ],
      },
      metadata: {
        hash: hash,
        tags: {
          source: 'ProofLocker',
          test: 'true',
        },
      },
    },
  ];

  console.log('\n--- PRE-FETCH DEBUG ---');
  console.log('typeof payload:', typeof payload);
  console.log('JSON.stringify(payload):', JSON.stringify(payload));
  console.log('JSON.stringify(payload).length:', JSON.stringify(payload).length);
  console.log('API URL:', `${apiUrl}/fingerprints`);
  console.log('Org ID:', orgId);
  console.log('Tenant ID:', tenantId);

  // Make the request
  console.log('\n--- MAKING REQUEST ---');

  try {
    const response = await fetch(`${apiUrl}/fingerprints`, {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
        'Accept': '*/*',
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
