import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { contentId, reviewStatus, notes } = await request.json();

    if (!contentId || !reviewStatus) {
      return NextResponse.json(
        { error: 'Content ID and review status are required' },
        { status: 400 }
      );
    }

    // Get current user
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get content
    const { data: content, error: fetchError } = await supabase
      .from('content_calendar')
      .select('*')
      .eq('id', contentId)
      .single();

    if (fetchError || !content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Create review record
    const { error: reviewError } = await supabase.from('content_reviews').insert({
      content_id: contentId,
      reviewer_id: user.id,
      review_status: reviewStatus,
      notes: notes || null,
    });

    if (reviewError) {
      console.error('Review insert error:', reviewError);
      return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
    }

    // Update content review status
    const { error: updateError } = await supabase
      .from('content_calendar')
      .update({
        review_status: reviewStatus,
        reviewer_notes: notes || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq('id', contentId);

    if (updateError) {
      console.error('Content update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update content review status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
    });
  } catch (error: any) {
    console.error('Review error:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}

// GET endpoint to fetch reviews for a content
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');

    if (!contentId) {
      return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
    }

    // Get current user
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Fetch reviews
    const { data: reviews, error: fetchError } = await supabase
      .from('content_reviews')
      .select('*')
      .eq('content_id', contentId)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Fetch reviews error:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }

    return NextResponse.json({ reviews: reviews || [] });
  } catch (error: any) {
    console.error('Fetch reviews error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
