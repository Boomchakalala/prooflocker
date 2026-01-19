import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { getPredictionBySlug } from '@/lib/storage';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Fetch prediction data directly from storage
    const prediction = await getPredictionBySlug(slug);

    if (!prediction) {
      throw new Error('Prediction not found');
    }

    // Fetch the ProofLocker logo (WHITE for OG cards)
    const logoUrl = new URL('/og/prooflocker-logo-white.png', request.url).toString();
    const logoResponse = await fetch(logoUrl);
    const logoArrayBuffer = await logoResponse.arrayBuffer();
    const logoBase64 = Buffer.from(logoArrayBuffer).toString('base64');
    const logoDataUrl = `data:image/png;base64,${logoBase64}`;

    // Determine state (matching in-app card logic)
    const isResolved = prediction.outcome !== null && prediction.outcome !== 'pending';
    const isCorrect = prediction.outcome === 'correct';

    // Deterministic bottom phrase based on state
    let bottomPhrase: string;
    if (!isResolved) {
      bottomPhrase = 'Say it now. Prove it later.';
    } else if (isCorrect) {
      bottomPhrase = 'Said it. Proved it.';
    } else {
      bottomPhrase = "This one didn't age well.";
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '80px',
            background: '#0a0a0a',
            backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(147, 51, 234, 0.25) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(37, 99, 235, 0.2) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(126, 34, 206, 0.2) 0%, transparent 60%)',
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

          {/* ProofLocker Logo - top right (WHITE, sharp, crisp) */}
          <img
            src={logoDataUrl}
            alt="ProofLocker"
            width="200"
            height="50"
            style={{
              position: 'absolute',
              top: '50px',
              right: '80px',
              opacity: 1,
            }}
          />

          {/* Main container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              maxWidth: '950px',
              position: 'relative',
              zIndex: 1,
              marginTop: '60px', // Space for logo at top
            }}
          >
            {/* Prediction text - Hero */}
            <div
              style={{
                fontSize: '52px',
                fontWeight: '700',
                color: 'white',
                lineHeight: '1.2',
                letterSpacing: '-0.02em',
                textShadow: '0 2px 20px rgba(0, 0, 0, 0.4)',
              }}
            >
              {prediction.text}
            </div>

            {/* Status badges - matching web app pill styles */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '12px',
                marginTop: '16px',
                marginBottom: '8px',
                flexWrap: 'wrap',
              }}
            >
              {/* Locked badge - always show */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 20px',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '600',
                  background: 'rgba(147, 51, 234, 0.1)',
                  color: '#c084fc',
                  border: '2px solid rgba(168, 85, 247, 0.3)',
                }}
              >
                Locked
              </div>

              {/* Resolved badge - only if resolved */}
              {isResolved && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 20px',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: '600',
                    background: 'rgba(34, 197, 94, 0.1)',
                    color: '#86efac',
                    border: '2px solid rgba(34, 197, 94, 0.3)',
                  }}
                >
                  Resolved
                </div>
              )}

              {/* Outcome badge - Correct or Incorrect (only if resolved) */}
              {isResolved && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 20px',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: '600',
                    background: isCorrect
                      ? 'rgba(34, 197, 94, 0.1)'
                      : 'rgba(239, 68, 68, 0.1)',
                    color: isCorrect ? '#86efac' : '#fca5a5',
                    border: isCorrect
                      ? '2px solid rgba(34, 197, 94, 0.3)'
                      : '2px solid rgba(239, 68, 68, 0.3)',
                  }}
                >
                  {isCorrect ? 'Correct' : 'Incorrect'}
                </div>
              )}
            </div>

            {/* Bottom phrase - deterministic based on state */}
            <div
              style={{
                fontSize: '22px',
                color: 'rgba(255, 255, 255, 0.75)',
                fontWeight: '500',
                letterSpacing: '-0.01em',
                textShadow: '0 1px 10px rgba(0, 0, 0, 0.3)',
                marginTop: '4px',
              }}
            >
              {bottomPhrase}
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
    console.error('OG Image generation error:', error);

    // Fallback image with proper styling
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0a0a0a',
            backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(147, 51, 234, 0.25) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(37, 99, 235, 0.2) 0%, transparent 50%)',
            color: 'white',
            fontSize: '48px',
            fontWeight: '700',
          }}
        >
          ProofLocker
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}
