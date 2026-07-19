import { createClient } from '@supabase/supabase-js';

// Get credentials from localStorage or environment variables
export function getSupabaseCredentials() {
  if (typeof window === 'undefined') return { url: '', key: '' };
  
  const localUrl = localStorage.getItem('supabase_url');
  const localKey = localStorage.getItem('supabase_key');
  
  // Also try loading from Vite's env variables
  const url = localUrl || import.meta.env.VITE_SUPABASE_URL || '';
  const key = localKey || import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_KEY || '';
  
  return { url, key };
}

// Create a Supabase instance based on available credentials
export function createSupabase() {
  const { url, key } = getSupabaseCredentials();
  if (!url || !key) return null;
  try {
    return createClient(url, key, {
      auth: {
        persistSession: false // Clean frontend-only integration without complex auth state
      }
    });
  } catch (e) {
    console.error('Error creating Supabase client:', e);
    return null;
  }
}

// Global instance that cache connection
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
  // Dispatch event to notify application components
  window.dispatchEvent(new CustomEvent('database-updated'));
}

// Test credentials by making a lightweight request
export async function testConnection(url, key) {
  if (!url || !key) return false;
  try {
    const client = createClient(url, key);
    // Make a query. If API key is invalid, Supabase Gateway returns a 400/401 JWT error.
    // We check connection to a metadata structure or auth
    const { error } = await client.from('produtores').select('id').limit(1);
    
    if (error) {
      // If table doesn't exist yet, it's a PG SQL error 'relation "produtores" does not exist'
      // but it means credentials are VALID! (otherwise it would block at API key layer)
      if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return { success: true, tablesMissing: true };
      }
      if (error.message.includes('JWT') || error.message.includes('Invalid API key') || error.message.includes('invalid') || error.status === 401 || error.status === 403) {
        return { success: false, message: 'Chave API ou URL inválida.' };
      }
    }
    return { success: true, tablesMissing: false };
  } catch (e) {
    console.error('Supabase connection test failed:', e);
    return { success: false, message: 'Erro de rede ou conexão inválida.' };
  }
}
