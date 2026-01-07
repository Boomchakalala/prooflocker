/**
 * Generate a new secp256k1 key pair for Digital Evidence signing
 *
 * Run this once to generate your signing keys:
 * node generate-signing-key.js
 *
 * Then copy the private key to .env.local:
 * DE_SIGNING_PRIVATE_KEY_HEX=<your-private-key-hex>
 */

const { ec: EC } = require('elliptic');
const ec = new EC('secp256k1');

console.log('\n========== GENERATING SECP256K1 KEY PAIR ==========\n');

// Generate a new key pair
const keyPair = ec.genKeyPair();

// Get private key (32 bytes in hex)
const privateKeyHex = keyPair.getPrivate('hex');

// Get public key (uncompressed, 65 bytes in hex with 04 prefix)
const publicKeyHex = keyPair.getPublic().encode('hex', false);

// Get public key (compressed, 33 bytes in hex)
const publicKeyCompressedHex = keyPair.getPublic().encode('hex', true);

console.log('Private Key (keep this SECRET, never share):');
console.log(privateKeyHex);
console.log('\nPublic Key (uncompressed):');
console.log(publicKeyHex);
console.log('\nPublic Key (compressed):');
console.log(publicKeyCompressedHex);

console.log('\n========== INSTRUCTIONS ==========\n');
console.log('1. Copy the Private Key above');
console.log('2. Open .env.local');
console.log('3. Replace the placeholder:');
console.log('   DE_SIGNING_PRIVATE_KEY_HEX=' + privateKeyHex);
console.log('\n4. NEVER commit .env.local to git');
console.log('5. NEVER share your private key');
console.log('\n========================================\n');
