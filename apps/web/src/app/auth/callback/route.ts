import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = createClient();

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(`${origin}/member-login?error=로그인에 실패했습니다`);
    }

    // Get user info
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const userEmail = user.email;

      // Check if user's email matches any member company
      const { data: memberCompany } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('email', userEmail)
        .eq('organization_type', 'member')
        .single();

      if (memberCompany) {
        // Update user's profile with the organization
        await supabase
          .from('profiles')
          .update({ current_organization_id: memberCompany.id })
          .eq('id', user.id);

        // Redirect to member dashboard
        return NextResponse.redirect(`${origin}/dashboard`);
      } else {
        // No matching organization found - redirect to request page
        return NextResponse.redirect(`${origin}/access-pending`);
      }
    }
  }

  // If no code or user, redirect to login
  return NextResponse.redirect(`${origin}/member-login`);
}
