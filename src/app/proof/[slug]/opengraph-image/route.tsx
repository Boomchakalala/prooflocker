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

<<<<<<< HEAD
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

=======
>>>>>>> 1b291604e3b92c5442ae2d086b3704894518d4cd
    return new ImageResponse(
      (
        <div
          style={{
<<<<<<< HEAD
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
=======
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px',
            background: '#0a0515',
            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(88, 28, 135, 0.4) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(49, 46, 129, 0.3) 0%, transparent 50%), radial-gradient(circle at 50% 100%, rgba(30, 27, 75, 0.5) 0%, transparent 50%)',
            position: 'relative',
          }}
        >
          {/* Stars pattern */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              top: 0,
              left: 0,
              opacity: 0.4,
              display: 'flex',
            }}
          >
            {/* Create star dots */}
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${(i * 37 + 10) % 95}%`,
                  top: `${(i * 43 + 5) % 95}%`,
                  width: `${i % 3 === 0 ? '3px' : '2px'}`,
                  height: `${i % 3 === 0 ? '3px' : '2px'}`,
                  borderRadius: '50%',
                  background: 'white',
                  display: 'flex',
                }}
              />
            ))}
          </div>

          {/* Main content centered */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '48px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* Logo with lock icon */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
              }}
            >
              {/* Lock icon */}
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                style={{
                  filter: 'drop-shadow(0 4px 20px rgba(168, 85, 247, 0.4))',
                }}
              >
                <rect
                  x="5"
                  y="11"
                  width="14"
                  height="10"
                  rx="2"
                  fill="url(#grad1)"
                />
                <path
                  d="M7 11V7a5 5 0 0 1 10 0v4"
                  stroke="url(#grad2)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                  <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="100%" stopColor="#818cf8" />
                  </linearGradient>
                </defs>
              </svg>

              {/* ProofLocker text logo */}
              <div
                style={{
                  fontSize: '72px',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #c084fc 0%, #818cf8 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  letterSpacing: '-0.03em',
                  textShadow: '0 4px 30px rgba(168, 85, 247, 0.3)',
                }}
              >
                ProofLocker
              </div>
            </div>

            {/* Main tagline */}
            <div
              style={{
                fontSize: '48px',
                fontWeight: '700',
                color: 'white',
                textAlign: 'center',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                textShadow: '0 2px 20px rgba(0, 0, 0, 0.4)',
              }}
            >
              Predictions. Locked forever.
            </div>

            {/* Secondary tagline */}
            <div
              style={{
                fontSize: '36px',
                fontWeight: '500',
                color: 'rgba(255, 255, 255, 0.7)',
                textAlign: 'center',
                letterSpacing: '-0.01em',
                textShadow: '0 2px 15px rgba(0, 0, 0, 0.3)',
              }}
            >
              Say it now. Prove it later.
>>>>>>> 1b291604e3b92c5442ae2d086b3704894518d4cd
            </div>

            {/* Subtle separator line */}
            <div
              style={{
                width: '200px',
                height: '2px',
                background: 'linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.5), transparent)',
                marginTop: '20px',
              }}
            />
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

    // Fallback image with proper styling
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0a0515',
            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(88, 28, 135, 0.4) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(49, 46, 129, 0.3) 0%, transparent 50%)',
          }}
        >
          <div
            style={{
              fontSize: '72px',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #c084fc 0%, #818cf8 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            ProofLocker
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}
