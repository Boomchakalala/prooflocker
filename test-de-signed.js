// Test script for Digital Evidence API with proper signing
const crypto = require('crypto');
const fs = require('fs');
const { canonicalize } = require('json-canonicalize');
const { ec: EC } = require('elliptic');

const ec = new EC('secp256k1');

// Load environment variables from .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

/**
 * Sign FingerprintValue according to SECP256K1_RFC8785_V1 spec
 */
function signFingerprintValue(fingerprintValue, privateKeyHex) {
  console.log('\n--- SIGNING PROCESS ---');

  // Step 1: Derive public key from private key
  const keyPair = ec.keyFromPrivate(privateKeyHex, 'hex');
  const publicKeyHex = keyPair.getPublic().encode('hex', false);
  console.log('1. Public key:', publicKeyHex);

  // Step 2: Set signerId to public key
  const fingerprintValueWithSignerId = {
    ...fingerprintValue,
    signerId: publicKeyHex,
  };

  // Step 3: RFC 8785 canonicalize
  const canonicalJson = canonicalize(fingerprintValueWithSignerId);
  console.log('2. Canonical JSON (WITH signerId):', canonicalJson);

  // Step 2: SHA-256 hash of canonical JSON
  const hashBytes = crypto.createHash('sha256').update(canonicalJson, 'utf8').digest();
  console.log('2. SHA-256 hash (bytes):', hashBytes.toString('hex'));

  // Step 3: Convert hash bytes to hex string
  const hashHex = hashBytes.toString('hex');
  console.log('3. Hash hex:', hashHex);

  // Step 4: SHA-512 hash of the hex string
  const sha512Hash = crypto.createHash('sha512').update(hashHex, 'utf8').digest();
  console.log('4. SHA-512 hash:', sha512Hash.toString('hex'));

  // Step 5: Truncate to first 32 bytes
  const truncatedHash = sha512Hash.slice(0, 32);
  console.log('5. Truncated hash (32 bytes):', truncatedHash.toString('hex'));

  // Step 6: Sign with secp256k1
  const keyPair = ec.keyFromPrivate(privateKeyHex, 'hex');
  const signature = keyPair.sign(truncatedHash);

  // Step 7: DER encoding
  const signatureHex = signature.toDER('hex');
  console.log('6. Signature (DER hex):', signatureHex);

  return { publicKeyHex, signatureHex, fingerprintValueWithSignerId };
}

async function testDigitalEvidenceAPI() {
  console.log('\n========== TESTING DIGITAL EVIDENCE API WITH SIGNING ==========\n');

  // Create a test hash
  const testText = 'This is a signed test prediction at ' + new Date().toISOString();
  const hash = crypto.createHash('sha256').update(testText).digest('hex');

  console.log('Test text:', testText);
  console.log('SHA-256 hash:', hash);

  const apiKey = envVars.DE_API_KEY;
  const apiUrl = envVars.DE_API_URL || 'https://de-api.constellationnetwork.io/v1';
  const orgId = envVars.DE_ORG_ID;
  const tenantId = envVars.DE_TENANT_ID;
  const privateKeyHex = envVars.DE_SIGNING_PRIVATE_KEY_HEX;

  if (!apiKey || !orgId || !tenantId || !privateKeyHex) {
    console.error('\n❌ ERROR: Missing required environment variables');
    console.error('DE_API_KEY:', apiKey ? 'SET' : 'NOT SET');
    console.error('DE_ORG_ID:', orgId ? 'SET' : 'NOT SET');
    console.error('DE_TENANT_ID:', tenantId ? 'SET' : 'NOT SET');
    console.error('DE_SIGNING_PRIVATE_KEY_HEX:', privateKeyHex ? 'SET' : 'NOT SET');
    process.exit(1);
  }

  // Build FingerprintValue (without signerId initially)
  const timestamp = new Date().toISOString();
  const eventId = crypto.randomUUID();
  const documentId = `prooflocker:${crypto.randomUUID()}`;

  const fingerprintValue = {
    orgId,
    tenantId,
    eventId,
    documentId,
    documentRef: hash,
    timestamp,
    version: 1,
  };

  // Sign the fingerprint value (this adds signerId internally)
  const { publicKeyHex, signatureHex, fingerprintValueWithSignerId } = signFingerprintValue(
    fingerprintValue,
    privateKeyHex
  );

  // Build proof
  const proof = {
    id: publicKeyHex,
    signature: signatureHex,
    algorithm: 'SECP256K1_RFC8785_V1',
  };

  // Build payload (omit metadata.hash)
  const payload = [
    {
      attestation: {
        content: fingerprintValueWithSignerId,
        proofs: [proof],
      },
    },
  ];

  console.log('\n--- FINAL PAYLOAD ---');
  console.log(JSON.stringify(payload, null, 2));
  console.log('\nPayload length:', JSON.stringify(payload).length);

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

    console.log('\n--- RESPONSE ---');
    console.log('Status:', response.status, response.statusText);
    console.log('Content-Type:', response.headers.get('content-type'));

    const responseText = await response.text();
    console.log('\nRaw response:');
    console.log(responseText);

    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        const result = Array.isArray(data) ? data[0] : data;

        console.log('\n--- PARSED RESULT ---');
        console.log(JSON.stringify(result, null, 2));

        if (result.accepted === true) {
          console.log('\n✅ SUCCESS! Submission ACCEPTED by Digital Evidence API!');
          console.log('Event ID:', result.eventId);
          console.log('Hash:', result.hash);
        } else if (result.errors && result.errors.length > 0) {
          console.log('\n⚠️  Submission received but has errors:');
          result.errors.forEach(err => console.log('  -', err));
        } else {
          console.log('\n⚠️  Submission received but not explicitly accepted');
        }
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
