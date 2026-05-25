import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Using untyped client for broad compatibility with Supabase SDK update() generics.
// Row types are imported directly from types.ts where needed.

let _client: SupabaseClient | null = null;

/** Browser client — usa a anon key. RLS controla o acesso. */
export function getSupabaseClient(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabase env vars not set. Copy .env.local.example to .env.local and fill in the values.');
  }
  _client = createClient(url, key);
  return _client;
}

/** Server/API client — usa service role key. Ignora RLS. Usar APENAS em API routes. */
export function getServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY not set');
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

/** Verifica o token JWT de um request e retorna o user, ou null se inválido. */
export async function verifyAuthHeader(request: Request): Promise<{ id: string; email?: string } | null> {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const svc = getServiceClient();
  const { data: { user }, error } = await svc.auth.getUser(token);
  if (error || !user) return null;
  return user;
}
