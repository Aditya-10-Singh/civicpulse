import { createClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'civicpulse_supabase_url';
const STORAGE_KEY_ANON = 'civicpulse_supabase_anon';
const STORAGE_KEY_LOCAL_USERS = 'civicpulse_registered_users';

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

// ----------------- LOCAL USER REGISTRY (DEMO & OFFLINE) -----------------

const DEFAULT_USERS = [
  {
    id: "usr-aditya-101",
    email: "aditya.singh00552@gmail.com",
    password: "password123",
    fullName: "Aditya Singh",
    role: "Lead Developer / Citizen",
    createdAt: "2026-10-24T10:00:00.000Z"
  },
  {
    id: "usr-pooja-102",
    email: "pooja.sharma@example.com",
    password: "password123",
    fullName: "Pooja Sharma",
    role: "Resident - Sector 14",
    createdAt: "2026-10-23T14:30:00.000Z"
  },
  {
    id: "usr-rohit-103",
    email: "rohit.verma@example.com",
    password: "password123",
    fullName: "Rohit Verma",
    role: "Ward Inspector",
    createdAt: "2026-10-22T09:15:00.000Z"
  }
];

export function getRegisteredUsers() {
  try {
    const data = localStorage.getItem(STORAGE_KEY_LOCAL_USERS);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_LOCAL_USERS, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(data);
  } catch (err) {
    return DEFAULT_USERS;
  }
}

export function registerLocalUser(email, password, fullName) {
  const users = getRegisteredUsers();
  const normalizedEmail = email.trim().toLowerCase();

  const exists = users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (exists) {
    throw new Error("An account with this email already exists. Please Sign In.");
  }

  const newUser = {
    id: "usr-" + Date.now().toString().slice(-6),
    email: normalizedEmail,
    password: password.trim(),
    fullName: fullName.trim(),
    role: "Registered Citizen",
    createdAt: new Date().toISOString()
  };

  const updated = [newUser, ...users];
  localStorage.setItem(STORAGE_KEY_LOCAL_USERS, JSON.stringify(updated));
  return newUser;
}

export function authenticateLocalUser(email, password) {
  const users = getRegisteredUsers();
  const normalizedEmail = email.trim().toLowerCase();

  const user = users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    throw new Error("Account not found with this email. Please register first!");
  }

  if (user.password !== password.trim()) {
    throw new Error("Incorrect password. Please verify and try again.");
  }

  return {
    id: user.id,
    email: user.email,
    user_metadata: {
      full_name: user.fullName,
      role: user.role
    }
  };
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
  if (!client) {
    return registerLocalUser(email, password, fullName);
  }

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
  if (!client) {
    return authenticateLocalUser(email, password);
  }

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw error;
  return data.user;
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
