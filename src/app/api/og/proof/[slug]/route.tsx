import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { getPredictionBySlug } from '@/lib/storage';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Fetch prediction data directly from storage
    const prediction = await getPredictionBySlug(slug);

    if (!prediction) {
      throw new Error('Prediction not found');
    }

    // Determine state
    const isResolved = prediction.outcome !== null && prediction.outcome !== 'pending';
    const isCorrect = prediction.outcome === 'correct';

    // State logic
    let statusBadges = [];
    let subtitle = '';

    if (!isResolved) {
      // State 1: Locked + Pending
      statusBadges = [{ text: '🔒 Locked', type: 'locked' }];
      subtitle = 'Prediction locked. Immutable.';
    } else if (isCorrect) {
      // State 2: Resolved + Correct
      statusBadges = [
        { text: '✓ Resolved', type: 'resolved' },
        { text: 'Outcome: Correct', type: 'correct' },
      ];
      subtitle = 'Prediction correct. Still immutable.';
    } else {
      // State 3: Resolved + Incorrect
      statusBadges = [
        { text: '✓ Resolved', type: 'resolved' },
        { text: 'Outcome: Incorrect', type: 'incorrect' },
      ];
      subtitle = 'Prediction incorrect. Still immutable.';
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
            background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(120, 40, 200, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(30, 60, 150, 0.3) 0%, transparent 50%)',
            position: 'relative',
          }}
        >
          {/* Stars effect */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              top: 0,
              left: 0,
              backgroundImage: 'radial-gradient(2px 2px at 20px 30px, white, transparent), radial-gradient(2px 2px at 60px 70px, white, transparent), radial-gradient(1px 1px at 50px 50px, white, transparent), radial-gradient(1px 1px at 130px 80px, white, transparent), radial-gradient(2px 2px at 90px 10px, white, transparent)',
              backgroundSize: '200px 200px',
              opacity: 0.3,
            }}
          />

          {/* Logo - top right */}
          <div
            style={{
              position: 'absolute',
              top: '60px',
              right: '80px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: 'white',
              fontSize: '32px',
              fontWeight: '600',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
              }}
            >
              🔒
            </div>
            <span>ProofLocker</span>
          </div>

          {/* Main container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '30px',
              maxWidth: '1000px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* Prediction text */}
            <div
              style={{
                fontSize: '58px',
                fontWeight: '700',
                color: 'white',
                lineHeight: '1.2',
                letterSpacing: '-0.02em',
              }}
            >
              {prediction.text}
            </div>

            {/* Status badges */}
            <div
              style={{
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              {statusBadges.map((badge, i) => {
                let bg = '';
                let color = '';
                let border = '';

                if (badge.type === 'locked' || badge.type === 'resolved') {
                  bg = 'rgba(34, 197, 94, 0.15)';
                  color = '#4ade80';
                } else if (badge.type === 'correct') {
                  bg = 'rgba(34, 197, 94, 0.15)';
                  color = '#4ade80';
                  border = '2px solid #4ade80';
                } else if (badge.type === 'incorrect') {
                  bg = 'rgba(239, 68, 68, 0.15)';
                  color = '#f87171';
                  border = '2px solid #f87171';
                }

                return (
                  <div
                    key={i}
                    style={{
                      padding: '12px 24px',
                      borderRadius: '24px',
                      fontSize: '20px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      background: bg,
                      color: color,
                      border: border || 'none',
                    }}
                  >
                    {badge.text}
                  </div>
                );
              })}
            </div>

            {/* Subtitle */}
            <div
              style={{
                fontSize: '24px',
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: '400',
              }}
            >
              {subtitle}
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

    // Fallback image
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
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
