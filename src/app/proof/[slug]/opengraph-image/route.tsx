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
            background: "#0a0a0a",
            position: "relative",
            padding: "64px",
          }}
        >
          {/* Subtle gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 40%), " +
                "radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.06) 0%, transparent 40%)",
            }}
          />

          {/* Main content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Top: White ProofLocker logo */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "48px",
              }}
            >
              <span
                style={{
                  fontSize: 40,
                  fontWeight: 700,
                  color: "white",
                  letterSpacing: "-0.02em",
                }}
              >
                ProofLocker
              </span>
            </div>

            {/* State badges row */}
            <div
              style={{
                display: "flex",
                gap: 12,
                marginBottom: 40,
              }}
            >
              {/* Locked badge */}
              {isLocked && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 20px",
                    background: "rgba(168, 85, 247, 0.1)",
                    border: "1px solid rgba(168, 85, 247, 0.3)",
                    borderRadius: 8,
                    fontSize: 20,
                    fontWeight: 500,
                    color: "rgb(192, 132, 252)",
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Locked
                </div>
              )}

              {/* Resolved badge */}
              {isResolved && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 20px",
                    background: "rgba(34, 197, 94, 0.1)",
                    border: "1px solid rgba(34, 197, 94, 0.3)",
                    borderRadius: 8,
                    fontSize: 20,
                    fontWeight: 500,
                    color: "rgb(74, 222, 128)",
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Resolved
                </div>
              )}
            </div>

            {/* Hero: Prediction text */}
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontSize: 64,
                  fontWeight: 700,
                  color: "white",
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                }}
              >
                {displayText}
              </div>
            </div>

            {/* Bottom section */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 32,
              }}
            >
              {/* Outcome badge (if resolved) */}
              {isResolved && (
                <div style={{ display: "flex" }}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 28px",
                      background:
                        outcome === "correct"
                          ? "rgba(34, 197, 94, 0.1)"
                          : "rgba(239, 68, 68, 0.1)",
                      border:
                        outcome === "correct"
                          ? "2px solid rgba(34, 197, 94, 0.3)"
                          : "2px solid rgba(239, 68, 68, 0.3)",
                      borderRadius: 10,
                      fontSize: 28,
                      fontWeight: 600,
                      color:
                        outcome === "correct"
                          ? "rgb(74, 222, 128)"
                          : "rgb(248, 113, 113)",
                    }}
                  >
                    {outcome === "correct" ? (
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    {outcome === "correct" ? "Correct" : "Incorrect"}
                  </div>
                </div>
              )}

              {/* Bottom phrase - centered, subtle */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  fontSize: 24,
                  fontWeight: 500,
                  color: "rgba(255, 255, 255, 0.5)",
                  letterSpacing: "0.01em",
                }}
              >
                {getBottomPhrase()}
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
