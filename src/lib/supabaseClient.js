import { createClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'civicpulse_supabase_url';
const STORAGE_KEY_ANON = 'civicpulse_supabase_anon';

export function getStoredSupabaseConfig() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  const storedUrl = localStorage.getItem(STORAGE_KEY_URL);
  const storedAnon = localStorage.getItem(STORAGE_KEY_ANON);

  return {
    url: storedUrl || (envUrl && envUrl !== 'https://your-project-ref.supabase.co' ? envUrl : ''),
    anonKey: storedAnon || (envAnon && envAnon !== 'your-anon-key-here' ? envAnon : '')
  };
}

export function saveSupabaseConfig(url, anonKey) {
  if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim());
  if (anonKey) localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim());
}

export function clearSupabaseConfig() {
  localStorage.removeItem(STORAGE_KEY_URL);
  localStorage.removeItem(STORAGE_KEY_ANON);
}

let supabaseInstance = null;

export function getSupabase() {
  const { url, anonKey } = getStoredSupabaseConfig();
  if (!url || !anonKey) {
    return null;
  }
  if (!supabaseInstance || supabaseInstance.supabaseUrl !== url) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
    } catch (err) {
      console.warn("Failed to initialize Supabase client:", err);
      return null;
    }
  }
  return supabaseInstance;
}

export function isSupabaseConfigured() {
  return Boolean(getSupabase());
}

// ----------------- CRUD API HELPERS -----------------

export async function apiFetchGrievances() {
  const client = getSupabase();
  if (!client) return { data: null, isLive: false };
  
  const { data, error } = await client
    .from('grievances')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Supabase fetch error:", error);
    throw error;
  }
  return { data, isLive: true };
}

export async function apiCreateGrievance(item) {
  const client = getSupabase();
  if (!client) return { data: null, isLive: false };

  const { data, error } = await client
    .from('grievances')
    .insert([item])
    .select()
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    throw error;
  }
  return { data, isLive: true };
}

export async function apiUpdateGrievanceStatus(id, status, notes = null) {
  const client = getSupabase();
  if (!client) return { isLive: false };

  const updatePayload = { status };
  if (notes) updatePayload.resolution_notes = notes;

  const { data, error } = await client
    .from('grievances')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return { data, isLive: true };
}

export async function apiUpvoteGrievance(id, newCount) {
  const client = getSupabase();
  if (!client) return { isLive: false };

  const { data, error } = await client
    .from('grievances')
    .update({ upvotes: newCount })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return { data, isLive: true };
}

export async function apiDeleteGrievance(id) {
  const client = getSupabase();
  if (!client) return { isLive: false };

  const { error } = await client
    .from('grievances')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { isLive: true };
}

// ----------------- AUTH API HELPERS -----------------

export async function apiSignUp(email, password, fullName) {
  const client = getSupabase();
  if (!client) throw new Error("Supabase is not configured yet.");

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName }
    }
  });
  if (error) throw error;
  return data;
}

export async function apiSignIn(email, password) {
  const client = getSupabase();
  if (!client) throw new Error("Supabase is not configured yet.");

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw error;
  return data;
}

export async function apiSignOut() {
  const client = getSupabase();
  if (client) {
    await client.auth.signOut();
  }
}

export async function apiGetSession() {
  const client = getSupabase();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data?.session || null;
}
