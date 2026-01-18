import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Fetch prediction data
    const predictionResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/predictions/${slug}`,
      { cache: 'no-store' }
    );

    if (!predictionResponse.ok) {
      throw new Error('Failed to fetch prediction');
    }

    const prediction = await predictionResponse.json();

    // Determine state
    const isResolved = prediction.outcome !== null && prediction.outcome !== 'pending';
    const isCorrect = prediction.outcome === 'correct';

    // State logic
    let statusBadges = [];
    let subtitle = '';

    if (!isResolved) {
      // State 1: Locked + Pending
      statusBadges = [{ text: '🔒 Locked', color: 'bg-green-500/20 text-green-400' }];
      subtitle = 'Prediction locked. Immutable.';
    } else if (isCorrect) {
      // State 2: Resolved + Correct
      statusBadges = [
        { text: '✓ Resolved', color: 'bg-green-500/20 text-green-400' },
        { text: 'Outcome: Correct', color: 'bg-green-500/20 text-green-400 border-2 border-green-500' },
      ];
      subtitle = 'Prediction correct. Still immutable.';
    } else {
      // State 3: Resolved + Incorrect
      statusBadges = [
        { text: '✓ Resolved', color: 'bg-green-500/20 text-green-400' },
        { text: 'Outcome: Incorrect', color: 'bg-red-500/20 text-red-400 border-2 border-red-500' },
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
              {prediction.prediction}
            </div>

            {/* Status badges */}
            <div
              style={{
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              {statusBadges.map((badge, i) => (
                <div
                  key={i}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '24px',
                    fontSize: '20px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    background: badge.color.includes('green') ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: badge.color.includes('green') ? '#4ade80' : '#f87171',
                    border: badge.color.includes('border') ? '2px solid' : 'none',
                    borderColor: badge.color.includes('green') ? '#4ade80' : '#f87171',
                  }}
                >
                  {badge.text}
                </div>
              ))}
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
