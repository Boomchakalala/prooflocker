import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          background: "#0a0a0a",
          position: "relative",
          padding: "80px",
        }}
      >
        {/* Subtle gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.12) 0%, transparent 50%), " +
              "radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)",
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
            justifyContent: "space-between",
          }}
        >
          {/* Top: ProofLocker logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: 48,
                fontWeight: 700,
                color: "white",
                letterSpacing: "-0.02em",
              }}
            >
              ProofLocker
            </span>
          </div>

          {/* Center: Main messaging */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
              flex: 1,
              justifyContent: "center",
            }}
          >
            {/* Headline */}
            <div
              style={{
                fontSize: 88,
                fontWeight: 800,
                color: "white",
                lineHeight: 1,
                letterSpacing: "-0.03em",
              }}
            >
              Predictions locked.
            </div>
            <div
              style={{
                fontSize: 88,
                fontWeight: 800,
                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)",
                backgroundClip: "text",
                color: "transparent",
                lineHeight: 1,
                letterSpacing: "-0.03em",
              }}
            >
              Forever.
            </div>

            {/* Tagline */}
            <div
              style={{
                fontSize: 40,
                fontWeight: 500,
                color: "rgba(255, 255, 255, 0.7)",
                letterSpacing: "-0.01em",
                marginTop: 40,
              }}
            >
              Say it now. Prove it later.
            </div>
          </div>

          {/* Bottom badges */}
          <div
            style={{
              display: "flex",
              gap: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 24px",
                background: "rgba(6, 182, 212, 0.1)",
                border: "1px solid rgba(6, 182, 212, 0.3)",
                borderRadius: 8,
                fontSize: 20,
                fontWeight: 500,
                color: "rgb(34, 211, 238)",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Anonymous
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 24px",
                background: "rgba(168, 85, 247, 0.1)",
                border: "1px solid rgba(168, 85, 247, 0.3)",
                borderRadius: 8,
                fontSize: 20,
                fontWeight: 500,
                color: "rgb(192, 132, 252)",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Locked on-chain
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 24px",
                background: "rgba(59, 130, 246, 0.1)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                borderRadius: 8,
                fontSize: 20,
                fontWeight: 500,
                color: "rgb(96, 165, 250)",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Immutable
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
}
