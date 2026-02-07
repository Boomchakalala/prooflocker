import { ImageResponse } from 'next/og';
import { supabase } from '@/lib/supabase';
import { getReliabilityTier, getTierInfo } from '@/lib/user-scoring';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: userId } = await params;

  // Fetch user stats
  const { data: statsData } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Fetch predictions to get pseudonym
  const { data: predictions } = await supabase
    .from('predictions')
    .select('pseudonym, author_number')
    .or(`user_id.eq.${userId},anon_id.eq.${userId}`)
    .limit(1)
    .single();

  const reliabilityScore = statsData?.reliability_score || 0;
  const tier = getReliabilityTier(reliabilityScore);
  const tierInfo = getTierInfo(tier);

  const displayName = predictions?.pseudonym || `Anon #${predictions?.author_number || '0000'}`;
  const totalPoints = statsData?.total_points || 0;
  const correctPredictions = statsData?.correct_predictions || 0;
  const totalPredictions = statsData?.total_predictions || 0;

  // Tier icons
  const tierIcons: Record<string, string> = {
    legend: '⭐',
    master: '👑',
    expert: '💎',
    trusted: '✓',
    novice: '•',
  };

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0A0A0F 0%, #1a1a2e 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Background Glow */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '20%',
            width: '600px',
            height: '600px',
            background: tierInfo.color.includes('purple')
              ? 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)'
              : tierInfo.color.includes('blue')
              ? 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        {/* Card Container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '32px',
            padding: '60px 80px',
            backdropFilter: 'blur(10px)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Tier Badge */}
          <div
            style={{
              fontSize: '120px',
              marginBottom: '20px',
            }}
          >
            {tierIcons[tier]}
          </div>

          {/* Tier Label */}
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: tierInfo.color.includes('purple')
                ? '#A855F7'
                : tierInfo.color.includes('blue')
                ? '#3B82F6'
                : tierInfo.color.includes('green')
                ? '#10B981'
                : '#6B7280',
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            {tierInfo.label}
          </div>

          {/* Reliability Score */}
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              marginBottom: '40px',
            }}
          >
            <span
              style={{
                fontSize: '80px',
                fontWeight: 'bold',
                color: '#FFFFFF',
              }}
            >
              {reliabilityScore}
            </span>
            <span
              style={{
                fontSize: '36px',
                color: '#9CA3AF',
                marginLeft: '8px',
              }}
            >
              /1000
            </span>
          </div>

          {/* Username */}
          <div
            style={{
              fontSize: '32px',
              color: '#D1D5DB',
              marginBottom: '24px',
            }}
          >
            {displayName}
          </div>

          {/* Stats */}
          <div
            style={{
              display: 'flex',
              gap: '48px',
              fontSize: '24px',
              color: '#9CA3AF',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ color: '#10B981', fontSize: '32px', fontWeight: 'bold' }}>
                {correctPredictions}
              </span>
              <span>Correct</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ color: '#6B7280', fontSize: '32px', fontWeight: 'bold' }}>
                {totalPredictions}
              </span>
              <span>Total</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ color: '#3B82F6', fontSize: '32px', fontWeight: 'bold' }}>
                {totalPoints.toLocaleString()}
              </span>
              <span>Points</span>
            </div>
          </div>
        </div>

        {/* ProofLocker Branding */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '24px', color: '#6B7280' }}>ProofLocker</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
