import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 10;

/**
 * DELETE /api/user/delete-account
 *
 * Deletes the authenticated user's account and all associated data.
 *
 * WARNING: This is permanent and cannot be undone.
 * Blockchain-recorded claims will remain permanent and publicly accessible.
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get authenticated user
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token and get user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Use service role client for admin operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const adminSupabase = createClient(supabaseUrl, serviceKey);

    console.log(`[DeleteAccount] Starting account deletion for user: ${user.id}`);

    // Step 1: Delete user_stats
    const { error: statsError } = await adminSupabase
      .from('user_stats')
      .delete()
      .eq('user_id', user.id);

    if (statsError) {
      console.error('[DeleteAccount] Error deleting user_stats:', statsError);
      // Continue anyway - not critical
    }

    // Step 2: Unlink predictions (set user_id to null, keep anon_id)
    // This preserves the prediction but removes the association
    const { error: predictionsError } = await adminSupabase
      .from('predictions')
      .update({ user_id: null, claimedAt: null })
      .eq('user_id', user.id);

    if (predictionsError) {
      console.error('[DeleteAccount] Error unlinking predictions:', predictionsError);
      // Continue anyway
    }

    // Step 3: Delete user from auth.users (Supabase Admin API)
    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error('[DeleteAccount] Error deleting user:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete account. Please contact support.' },
        { status: 500 }
      );
    }

    console.log(`[DeleteAccount] ✓ Account deleted successfully for user: ${user.id}`);

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('[DeleteAccount] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
