import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
export async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  return { supabase, user };
}
export async function requireAdmin() {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase.from('profiles').select('role,status').eq('id', user.id).single();
  if (!profile || !['admin','super_admin','finance','support'].includes(profile.role) || profile.status !== 'active') redirect('/dashboard');
  return { supabase, user, profile };
}
