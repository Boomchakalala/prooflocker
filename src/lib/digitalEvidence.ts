/**
 * Constellation Digital Evidence integration layer
 *
 * This module handles submission of fingerprints to Constellation Network's
 * Digital Evidence API. It uses a feature flag pattern: if API key is not
 * configured, it gracefully degrades to "pending" status.
 *
 * Required environment variables:
 * - DE_API_KEY: Digital Evidence API key
 *
 * Official API Documentation:
 * POST https://de-api.constellationnetwork.io/v1/fingerprints
 */

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
  return !!process.env.DE_API_KEY;
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
    // CRITICAL: API expects an ARRAY of objects, not a single object
    const payload = [
      {
        attestation: {
          hash: fingerprint,
        },
        metadata: {
          source: "ProofLocker",
          ...metadata,
        },
      },
    ];

    const payloadString = JSON.stringify(payload);

    console.log("[Digital Evidence] Submitting fingerprint");
    console.log("[Digital Evidence] Payload:", payloadString);

    // Submit to Constellation Digital Evidence API
    const response = await fetch(`${config.apiUrl}/fingerprints`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-API-Key": config.apiKey,
      },
      body: payloadString,
    });

    console.log("[Digital Evidence] Response status:", response.status);

    const responseText = await response.text();
    console.log("[Digital Evidence] Response body:", responseText);

    if (!response.ok) {
      console.error("[Digital Evidence] API error:", response.status, responseText);
      return {
        success: false,
        error: `API error: ${response.status} - ${responseText}`,
      };
    }

    const data = JSON.parse(responseText);

    // API returns an array of results, get the first one
    const result = Array.isArray(data) ? data[0] : data;

    console.log("[Digital Evidence] Parsed result:", JSON.stringify(result));

    // Extract eventId, hash, and accepted from response
    return {
      success: true,
      eventId: result.eventId,
      hash: result.hash,
      accepted: result.accepted,
      timestamp: new Date().toISOString(), // Use server time
    };
  } catch (error) {
    console.error("[Digital Evidence] Error submitting:", error);
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
