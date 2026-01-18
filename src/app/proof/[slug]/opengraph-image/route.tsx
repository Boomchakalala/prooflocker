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
