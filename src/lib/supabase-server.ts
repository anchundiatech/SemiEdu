import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase client for server-side operations
 * @returns Supabase client instance
 */
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Creates a Supabase client for server-side operations with authentication
 * @returns Object containing supabase client and authenticated user
 */
export async function createServerClient() {
  const supabase = createClient();
  const cookieStore = cookies();

  // Get session from cookies manually
  const accessToken = cookieStore.get('sb-access-token')?.value;

  if (!accessToken) {
    return { supabase, user: null, error: 'No access token found' };
  }

  // Get the authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
  
  if (userError || !user) {
    return { supabase, user: null, error: 'Invalid or expired token' };
  }

  return { supabase, user, error: null };
}

/**
 * Middleware to check if user is a coordinator
 * @param user - The authenticated user object
 * @returns boolean indicating if user is coordinator
 */
export function isCoordinator(user: any): boolean {
  return user?.user_metadata?.rol === 'coordinador';
}
