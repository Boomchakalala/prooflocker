import { ImageResponse } from "next/og";
import { getPredictionBySlug } from "@/lib/storage";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const prediction = await getPredictionBySlug(slug);

    if (!prediction || prediction.moderationStatus === "hidden") {
      return new Response("Not found", { status: 404 });
    }

    // Determine state
    const outcome = prediction.outcome || "pending";
    const isLocked =
      prediction.deStatus?.toUpperCase() === "CONFIRMED" ||
      prediction.onChainStatus === "confirmed";
    const isResolved = outcome === "correct" || outcome === "incorrect";

    // Bottom phrase logic (EXACT - DO NOT MODIFY)
    const getBottomPhrase = () => {
      if (outcome === "correct") return "Said it. Proved it.";
      if (outcome === "incorrect") return "This one didn't age well.";
      return "Say it now. Prove it later.";
    };

    // Truncate prediction text to 2 lines max (~140 chars)
    const displayText =
      prediction.text.length > 140
        ? prediction.text.substring(0, 137) + "..."
        : prediction.text;

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)",
            position: "relative",
          }}
        >
          {/* Star particles background */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.05) 0%, transparent 50%), " +
                "radial-gradient(circle at 80% 70%, rgba(147,51,234,0.08) 0%, transparent 50%), " +
                "radial-gradient(circle at 40% 80%, rgba(59,130,246,0.06) 0%, transparent 50%)",
            }}
          />

          {/* Main card */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "1040px",
              height: "520px",
              padding: "60px",
              background: "rgba(30, 27, 75, 0.6)",
              border: "1px solid rgba(139, 92, 246, 0.2)",
              borderRadius: "32px",
              backdropFilter: "blur(10px)",
              position: "relative",
            }}
          >
            {/* Prediction text */}
            <div
              style={{
                fontSize: 68,
                fontWeight: 700,
                color: "white",
                lineHeight: 1.2,
                marginBottom: 40,
                flex: 1,
                display: "flex",
                alignItems: "center",
              }}
            >
              {displayText}
            </div>

            {/* Locked badge */}
            {isOnChain && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontSize: 28,
                  color: "rgba(255,255,255,0.9)",
                  marginBottom: 40,
                }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Locked on-chain
              </div>
            )}

            {/* Bottom row: Logo and Outcome badge */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {/* ProofLocker logo */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                {/* Simple lock icon as logo placeholder */}
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="white"
                >
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path
                    d="M7 11V7a5 5 0 0 1 10 0v4"
                    stroke="white"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
                <span
                  style={{
                    fontSize: 32,
                    fontWeight: 600,
                    color: "white",
                  }}
                >
                  ProofLocker
                </span>
              </div>

              {/* Outcome badge */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "16px 32px",
                  background: outcomeBadge.bg,
                  border: `2px solid ${outcomeBadge.border}`,
                  borderRadius: 12,
                  fontSize: 28,
                  fontWeight: 600,
                  color: outcomeBadge.text,
                }}
              >
                {outcomeBadge.label}
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("OG image generation error:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
