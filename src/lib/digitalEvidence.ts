/**
 * Constellation Digital Evidence integration layer
 *
 * This module handles submission of fingerprints to Constellation Network's
 * Digital Evidence API. It uses a feature flag pattern: if API keys are not
 * configured, it gracefully degrades to "pending" status.
 *
 * Required environment variables:
 * - DE_API_KEY: Digital Evidence API key
 * - DE_ORG_ID: Organization ID
 * - DE_TENANT_ID: Tenant ID
 * - DE_API_URL: API endpoint (optional, defaults to production)
 */

interface DigitalEvidenceConfig {
  apiKey: string;
  orgId: string;
  tenantId: string;
  apiUrl: string;
}

interface DigitalEvidenceResponse {
  success: boolean;
  reference?: string; // Transaction/reference ID
  eventId?: string; // Event ID
  timestamp?: string; // On-chain timestamp
  error?: string;
}

/**
 * Check if Digital Evidence API is configured
 */
export function isDigitalEvidenceEnabled(): boolean {
  return !!(
    process.env.DE_API_KEY &&
    process.env.DE_ORG_ID &&
    process.env.DE_TENANT_ID
  );
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
    orgId: process.env.DE_ORG_ID!,
    tenantId: process.env.DE_TENANT_ID!,
    apiUrl: process.env.DE_API_URL || "https://api.constellationnetwork.io/digital-evidence",
  };
}

/**
 * Submit a fingerprint to Constellation Digital Evidence
 *
 * @param fingerprint - SHA-256 hash of the prediction text
 * @param metadata - Additional metadata (e.g., proofId, userId)
 * @returns Response with reference, eventId, and timestamp if successful
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
    const response = await fetch(`${config.apiUrl}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.apiKey}`,
        "X-Org-Id": config.orgId,
        "X-Tenant-Id": config.tenantId,
      },
      body: JSON.stringify({
        fingerprint,
        metadata: {
          ...metadata,
          source: "ProofLocker",
          version: "1.0",
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

    // Extract reference, eventId, and timestamp from response
    // Adjust these fields based on actual API response structure
    return {
      success: true,
      reference: data.transactionId || data.reference || data.txId,
      eventId: data.eventId || data.id,
      timestamp: data.timestamp || data.confirmedAt || new Date().toISOString(),
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
