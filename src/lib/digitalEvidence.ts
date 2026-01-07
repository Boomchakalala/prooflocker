/**
 * Constellation Digital Evidence integration layer
 *
 * This module handles submission of fingerprints to Constellation Network's
 * Digital Evidence API. It uses a feature flag pattern: if API key is not
 * configured, it gracefully degrades to "pending" status.
 *
 * Required environment variables:
 * - DE_API_KEY: Digital Evidence API key
 * - DE_TENANT_ID: Digital Evidence tenant ID
 * - DE_ORG_ID: Digital Evidence organization ID
 *
 * Official API Documentation:
 * POST https://de-api.constellationnetwork.io/v1/fingerprints
 */

import crypto from "crypto";

interface DigitalEvidenceConfig {
  apiKey: string;
  apiUrl: string;
}

interface DigitalEvidenceResponse {
  success: boolean;
  eventId?: string; // Event ID from Digital Evidence
  hash?: string; // The fingerprint that was submitted
  accepted?: boolean; // Whether the submission was accepted
  timestamp?: string; // On-chain timestamp (server time)
  error?: string;
}

/**
 * Check if Digital Evidence API is configured
 */
export function isDigitalEvidenceEnabled(): boolean {
  return !!(process.env.DE_API_KEY && process.env.DE_TENANT_ID && process.env.DE_ORG_ID);
}

/**
 * Get Digital Evidence configuration
 */
function getDigitalEvidenceConfig(): DigitalEvidenceConfig | null {
  if (!isDigitalEvidenceEnabled()) {
    return null;
  }

  return {
    apiKey: process.env.DE_API_KEY!,
    apiUrl: process.env.DE_API_URL || "https://de-api.constellationnetwork.io/v1",
  };
}

/**
 * Submit a fingerprint to Constellation Digital Evidence
 *
 * Official API Spec:
 * POST https://de-api.constellationnetwork.io/v1/fingerprints
 * Headers:
 *   - X-API-Key: <api_key>
 *   - Content-Type: application/json
 * Body:
 *   {
 *     "attestation": {
 *       "hash": "<fingerprint>"
 *     },
 *     "metadata": {
 *       "source": "ProofLocker"
 *     }
 *   }
 *
 * @param fingerprint - SHA-256 hash of the prediction text
 * @param metadata - Additional metadata (e.g., proofId, userId)
 * @returns Response with eventId, hash, and accepted status if successful
 */
export async function submitToDigitalEvidence(
  fingerprint: string,
  metadata?: Record<string, string>
): Promise<DigitalEvidenceResponse> {
  const config = getDigitalEvidenceConfig();

  // If not configured, return pending status
  if (!config) {
    return {
      success: false,
      error: "Digital Evidence API not configured",
    };
  }

  try {
    const orgId = process.env.DE_ORG_ID!;
    const tenantId = process.env.DE_TENANT_ID!;
    const timestamp = new Date().toISOString();

    // Generate unique IDs for this submission
    // NOTE: API requires hex strings (not UUIDs) for certain fields
    const eventId = crypto.randomUUID();
    const documentId = metadata?.proofId || crypto.randomUUID();

    // signerId must be 64+ hex characters
    const signerId = crypto.createHash('sha256').update('ProofLocker').digest('hex');

    // documentRef must be hex pattern
    const documentRef = crypto.createHash('sha256').update(documentId).digest('hex');

    // proofId must be hex pattern
    const proofId = crypto.createHash('sha256').update(crypto.randomUUID()).digest('hex');

    // signature must be 64+ hex characters (placeholder until we implement real signing)
    const signature = crypto.createHash('sha256').update('placeholder_signature_' + fingerprint).digest('hex');

    // Build payload according to official API spec
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
              algorithm: "SECP256K1_RFC8785_V1",
            },
          ],
        },
        metadata: {
          hash: fingerprint, // Hash goes in metadata, not attestation
          tags: {
            source: "ProofLocker",
            ...metadata,
          },
        },
      },
    ];

    // Debug logging BEFORE fetch
    console.log("[Digital Evidence] ========== PRE-FETCH DEBUG ==========");
    console.log("[Digital Evidence] typeof payload:", typeof payload);
    console.log("[Digital Evidence] JSON.stringify(payload):", JSON.stringify(payload));
    console.log("[Digital Evidence] JSON.stringify(payload).length:", JSON.stringify(payload).length);
    console.log("[Digital Evidence] API URL:", `${config.apiUrl}/fingerprints`);
    console.log("[Digital Evidence] Org ID:", orgId);
    console.log("[Digital Evidence] Tenant ID:", tenantId);

    // Submit to Constellation Digital Evidence API
    const response = await fetch(`${config.apiUrl}/fingerprints`, {
      method: "POST",
      headers: {
        "X-API-Key": config.apiKey,
        "Content-Type": "application/json",
        "Accept": "*/*",
      },
      body: JSON.stringify(payload),
    });

    // Debug logging AFTER fetch
    console.log("[Digital Evidence] ========== POST-FETCH DEBUG ==========");
    console.log("[Digital Evidence] response.status:", response.status);
    console.log("[Digital Evidence] response.headers.get('content-type'):", response.headers.get("content-type"));

    const responseText = await response.text();
    console.log("[Digital Evidence] Raw response text:", responseText);
    console.log("[Digital Evidence] ========================================");

    if (!response.ok) {
      console.error("[Digital Evidence] API error - Status:", response.status, "Body:", responseText);
      return {
        success: false,
        error: `API error: ${response.status} - ${responseText}`,
      };
    }

    const data = JSON.parse(responseText);

    // API returns an array of results, get the first one
    const result = Array.isArray(data) ? data[0] : data;

    console.log("[Digital Evidence] SUCCESS! Parsed result:", JSON.stringify(result));

    // Check if submission has errors (means pending, not confirmed)
    const hasErrors = result.errors && result.errors.length > 0;
    const isAccepted = !hasErrors && (result.accepted !== false);

    if (hasErrors) {
      console.warn("[Digital Evidence] Submission received but has validation errors:", result.errors);
    }

    // Extract eventId, hash, and accepted from response
    return {
      success: true,
      eventId: result.eventId || eventId,
      hash: result.hash || fingerprint,
      accepted: isAccepted,
      timestamp,
    };
  } catch (error) {
    console.error("[Digital Evidence] EXCEPTION:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Verify a fingerprint against Digital Evidence
 *
 * Note: This function is a placeholder. Update with actual verification
 * endpoint when available from Digital Evidence API.
 *
 * @param fingerprint - SHA-256 hash to verify
 * @param eventId - Digital Evidence event ID
 * @returns Verification result with details
 */
export async function verifyDigitalEvidence(
  fingerprint: string,
  eventId: string
): Promise<{
  verified: boolean;
  timestamp?: string;
  error?: string;
}> {
  const config = getDigitalEvidenceConfig();

  if (!config) {
    return {
      verified: false,
      error: "Digital Evidence API not configured",
    };
  }

  // Placeholder - update when verification endpoint is available
  return {
    verified: false,
    error: "Verification endpoint not yet implemented",
  };
}

/**
 * Get a friendly message about Digital Evidence status
 */
export function getDigitalEvidenceStatusMessage(): string {
  if (isDigitalEvidenceEnabled()) {
    return "Digital Evidence integration active";
  }
  return "Digital Evidence keys not configured - proofs will remain pending until keys are added";
}
