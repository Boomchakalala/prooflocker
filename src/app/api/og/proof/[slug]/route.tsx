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

    // Fetch the ProofLocker logo
    const logoUrl = new URL('/logos/prooflocker-logo-dark.png', request.url).toString();
    const logoResponse = await fetch(logoUrl);
    const logoArrayBuffer = await logoResponse.arrayBuffer();
    const logoBase64 = Buffer.from(logoArrayBuffer).toString('base64');
    const logoDataUrl = `data:image/png;base64,${logoBase64}`;

    // Determine state (matching in-app card logic)
    const isResolved = prediction.outcome !== null && prediction.outcome !== 'pending';
    const isCorrect = prediction.outcome === 'correct';

    // Status badge and text - single badge design matching in-app
    let statusBadge: { text: string; type: string };
    let statusText: string;

    if (!isResolved) {
      // UNRESOLVED: Locked badge
      statusBadge = { text: '🔒 Locked', type: 'locked' };
      statusText = 'Prediction locked on-chain.';
    } else if (isCorrect) {
      // RESOLVED - CORRECT
      statusBadge = { text: '✅ Correct', type: 'correct' };
      statusText = 'Prediction verified on-chain.';
    } else {
      // RESOLVED - INCORRECT
      statusBadge = { text: '❌ Incorrect', type: 'incorrect' };
      statusText = 'Prediction resolved on-chain.';
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

          {/* ProofLocker Logo - top left (document header style) */}
          <img
            src={logoDataUrl}
            alt="ProofLocker"
            width="180"
            height="45"
            style={{
              position: 'absolute',
              top: '60px',
              left: '80px',
              opacity: 0.7,
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

            {/* Status badge - single badge matching in-app design */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                marginTop: '12px',
              }}
            >
              {/* Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 28px',
                  borderRadius: '8px',
                  fontSize: '20px',
                  fontWeight: '600',
                  background: statusBadge.type === 'locked'
                    ? 'rgba(168, 85, 247, 0.1)'
                    : statusBadge.type === 'correct'
                    ? 'rgba(34, 197, 94, 0.1)'
                    : 'rgba(239, 68, 68, 0.1)',
                  color: statusBadge.type === 'locked'
                    ? '#c084fc'
                    : statusBadge.type === 'correct'
                    ? '#4ade80'
                    : '#f87171',
                  border: statusBadge.type === 'locked'
                    ? '2px solid rgba(168, 85, 247, 0.3)'
                    : statusBadge.type === 'correct'
                    ? '2px solid rgba(34, 197, 94, 0.3)'
                    : '2px solid rgba(239, 68, 68, 0.3)',
                  maxWidth: 'fit-content',
                }}
              >
                {statusBadge.text}
              </div>

              {/* Status text under badge */}
              <div
                style={{
                  fontSize: '22px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: '500',
                  letterSpacing: '-0.01em',
                  textShadow: '0 1px 10px rgba(0, 0, 0, 0.3)',
                }}
              >
                {statusText}
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
            background: '#0a0515',
            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(88, 28, 135, 0.4) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(49, 46, 129, 0.3) 0%, transparent 50%)',
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
