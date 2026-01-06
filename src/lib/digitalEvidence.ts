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
    // Submit to Constellation Digital Evidence API
    const response = await fetch(`${config.apiUrl}/fingerprints`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": config.apiKey,
      },
      body: JSON.stringify({
        attestation: {
          hash: fingerprint,
        },
        metadata: {
          source: "ProofLocker",
          ...metadata,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Digital Evidence API error:", response.status, errorText);
      return {
        success: false,
        error: `API error: ${response.status}`,
      };
    }

    const data = await response.json();

    // Extract eventId, hash, and accepted from response
    return {
      success: true,
      eventId: data.eventId,
      hash: data.hash,
      accepted: data.accepted,
      timestamp: new Date().toISOString(), // Use server time
    };
  } catch (error) {
    console.error("Error submitting to Digital Evidence:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Verify a fingerprint against Digital Evidence
 *
 * @param fingerprint - SHA-256 hash to verify
 * @param reference - Digital Evidence reference/transaction ID
 * @returns Verification result with details
 */
export async function verifyDigitalEvidence(
  fingerprint: string,
  reference: string
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

  try {
    const response = await fetch(`${config.apiUrl}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.apiKey}`,
        "X-Org-Id": config.orgId,
        "X-Tenant-Id": config.tenantId,
      },
      body: JSON.stringify({
        fingerprint,
        reference,
      }),
    });

    if (!response.ok) {
      return {
        verified: false,
        error: `API error: ${response.status}`,
      };
    }

    const data = await response.json();

    return {
      verified: data.verified || data.match || false,
      timestamp: data.timestamp || data.confirmedAt,
    };
  } catch (error) {
    console.error("Error verifying with Digital Evidence:", error);
    return {
      verified: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
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
