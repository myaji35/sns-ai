import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { spreadsheetId, sheetTitle, data } = await request.json();

    if (!spreadsheetId || !data || !Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
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

    // Transform data to content_calendar format
    const contentItems = data.map((row: any) => ({
      user_id: user.id,
      title: row['제목'] || row['Title'] || row['title'] || '',
      description: row['설명'] || row['Description'] || row['description'] || '',
      content_type: row['타입'] || row['Type'] || row['type'] || 'blog',
      platform: row['플랫폼'] || row['Platform'] || row['platform'] || 'blog',
      scheduled_date: row['날짜'] || row['Date'] || row['date'] || null,
      status: 'pending',
      source_sheet_id: spreadsheetId,
      source_sheet_name: sheetTitle,
    }));

    // Insert into content_calendar
    const { data: insertedData, error: insertError } = await supabase
      .from('content_calendar')
      .insert(contentItems)
      .select();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to save content items' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imported: insertedData?.length || 0,
      items: insertedData,
    });
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Failed to import data' },
      { status: 500 }
    );
  }
}
