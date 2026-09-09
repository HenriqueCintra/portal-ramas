import { createClient } from '@supabase/supabase-js';

// Get credentials — localStorage overrides .env (allows runtime override via UI panel)
export function getSupabaseCredentials() {
  if (typeof window === 'undefined') return { url: '', key: '' };

  const localUrl = localStorage.getItem('supabase_url');
  const localKey = localStorage.getItem('supabase_key');

  // .env vars (Vite exposes as import.meta.env)
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_KEY ||
    '';

  // localStorage wins only when explicitly set (non-empty string)
  const url = (localUrl && localUrl.trim()) ? localUrl.trim() : envUrl;
  const key = (localKey && localKey.trim()) ? localKey.trim() : envKey;

  return { url, key };
}

// Create a Supabase instance based on available credentials
export function createSupabase() {
  const { url, key } = getSupabaseCredentials();
  if (!url || !key) return null;
  try {
    return createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  } catch (e) {
    console.error('Error creating Supabase client:', e);
    return null;
  }
}

// Global instance that caches connection
let supabaseInstance = createSupabase();

export function getSupabase() {
  const { url, key } = getSupabaseCredentials();
  if (!url || !key) {
    supabaseInstance = null;
    return null;
  }

  if (!supabaseInstance) {
    supabaseInstance = createSupabase();
  }

  return supabaseInstance;
}

// Resets cached instance (needed after the user changes keys in the UI)
export function resetSupabaseInstance() {
  supabaseInstance = createSupabase();
  window.dispatchEvent(new CustomEvent('database-updated'));
}

// Test credentials by making a lightweight request
export async function testConnection(url, key) {
  if (!url || !key) return { success: false, message: 'Credenciais não informadas.' };
  try {
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { error } = await client.from('produtores').select('id').limit(1);

    if (error) {
      // Table missing but credentials valid
      if (
        error.code === 'PGRST116' ||
        error.message?.includes('relation') ||
        error.message?.includes('does not exist')
      ) {
        return { success: true, tablesMissing: true };
      }
      if (
        error.message?.includes('JWT') ||
        error.message?.includes('Invalid API key') ||
        error.message?.includes('invalid') ||
        error.status === 401 ||
        error.status === 403
      ) {
        return { success: false, message: 'Chave API ou URL inválida.' };
      }
      // Any other Supabase error — credentials likely OK
      return { success: true, tablesMissing: false };
    }

    return { success: true, tablesMissing: false };
  } catch (e) {
    console.error('Supabase connection test failed:', e);
    return { success: false, message: 'Erro de rede ou conexão inválida.' };
  }
}

