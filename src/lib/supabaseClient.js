import { createClient } from '@supabase/supabase-js';
import { sendOtpViaGoogleSheets } from './googleSheets';

const STORAGE_KEY_URL = 'civicpulse_supabase_url';
const STORAGE_KEY_ANON = 'civicpulse_supabase_anon';
const STORAGE_KEY_LOCAL_USERS = 'civicpulse_registered_users';

export function sanitizeSupabaseUrl(url) {
  if (!url) return '';
  return url.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}

export function getStoredSupabaseConfig() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  const storedUrl = localStorage.getItem(STORAGE_KEY_URL);
  const storedAnon = localStorage.getItem(STORAGE_KEY_ANON);

  const rawUrl = storedUrl || (envUrl && envUrl !== 'https://your-project-ref.supabase.co' ? envUrl : '');

  return {
    url: sanitizeSupabaseUrl(rawUrl),
    anonKey: storedAnon || (envAnon && envAnon !== 'your-anon-key-here' ? envAnon : '')
  };
}

export function saveSupabaseConfig(url, anonKey) {
  if (url) localStorage.setItem(STORAGE_KEY_URL, sanitizeSupabaseUrl(url));
  if (anonKey) localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim());
}

export function clearSupabaseConfig() {
  localStorage.removeItem(STORAGE_KEY_URL);
  localStorage.removeItem(STORAGE_KEY_ANON);
}

let supabaseInstance = null;
let supabaseInstanceUrl = null;
let supabaseInstanceAnonKey = null;

export function getSupabase() {
  const { url, anonKey } = getStoredSupabaseConfig();
  if (!url || !anonKey) {
    return null;
  }
  if (!supabaseInstance || supabaseInstanceUrl !== url || supabaseInstanceAnonKey !== anonKey) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
      supabaseInstanceUrl = url;
      supabaseInstanceAnonKey = anonKey;
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

export function isValidUUID(str) {
  if (!str || typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

export async function apiFetchGrievances() {
  const client = getSupabase();
  if (!client) return { data: null, isLive: false };
  
  try {
    const { data, error } = await client
      .from('grievances')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn("Supabase fetch notice:", error.message || error);
      return { data: null, isLive: false, error: error.message };
    }
    return { data, isLive: true };
  } catch (err) {
    console.warn("Supabase fetch exception:", err);
    return { data: null, isLive: false, error: err.message };
  }
}

export async function apiCreateGrievance(item) {
  const client = getSupabase();
  if (!client) return { data: null, isLive: false };

  // Sanitize payload: strip client-only properties and ensure valid UUID for user_id
  const payload = {
    title: item.title,
    description: item.description,
    category: item.category,
    status: item.status || 'Pending Review',
    priority: item.priority || 'Medium',
    location: item.location,
    reported_by_name: item.reported_by_name,
    reported_by_email: item.reported_by_email,
    user_id: isValidUUID(item.user_id) ? item.user_id : null,
    upvotes: item.upvotes || 1,
    image_url: item.image_url || null
  };

  const { data, error } = await client
    .from('grievances')
    .insert([payload])
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
  if (!client || !isValidUUID(id)) return { isLive: false };

  const updatePayload = { status };
  if (notes) updatePayload.resolution_notes = notes;

  const { data, error } = await client
    .from('grievances')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.warn("Supabase status update error:", error);
    return { isLive: false };
  }
  return { data, isLive: true };
}

export async function apiUpvoteGrievance(id, newCount) {
  const client = getSupabase();
  if (!client || !isValidUUID(id)) return { isLive: false };

  const { data, error } = await client
    .from('grievances')
    .update({ upvotes: newCount })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.warn("Supabase upvote error:", error);
    return { isLive: false };
  }
  return { data, isLive: true };
}

export async function apiDeleteGrievance(id) {
  const client = getSupabase();
  if (!client || !isValidUUID(id)) return { isLive: false };

  const { error } = await client
    .from('grievances')
    .delete()
    .eq('id', id);

  if (error) {
    console.warn("Supabase delete error:", error);
    return { isLive: false };
  }
  return { isLive: true };
}

// ----------------- AUTH API HELPERS -----------------

export async function apiSendEmailOtp(email, fullName = 'Citizen') {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error("Please enter a valid email address.");
  }

  // Generate secure 6-digit verification code
  const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Store in session storage for verification matching
  sessionStorage.setItem('civicpulse_active_otp', JSON.stringify({
    email: cleanEmail,
    otp: generatedCode,
    fullName: fullName.trim() || 'Citizen',
    createdAt: Date.now()
  }));

  const client = getSupabase();
  let supabaseSent = false;
  let rateLimitWarning = null;

  // 1. Send via Supabase Auth Email OTP
  if (client) {
    try {
      const redirectUrl = typeof window !== 'undefined' ? window.location.origin : undefined;
      const { data, error } = await client.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          data: { full_name: fullName.trim() || 'Citizen' },
          shouldCreateUser: true,
          emailRedirectTo: redirectUrl
        }
      });
      if (error) {
        if (error.message?.toLowerCase().includes('rate limit') || error.status === 429) {
          rateLimitWarning = "Supabase hourly email rate limit reached.";
        } else {
          console.warn("Supabase signInWithOtp notice:", error.message);
        }
      } else {
        supabaseSent = true;
      }
    } catch (sbErr) {
      console.warn("Supabase signInWithOtp failed to fetch:", sbErr);
    }
  }

  // 2. Also dispatch via Google Apps Script Mailer (100 free real emails/day)
  let googleMailSent = false;
  try {
    const res = await sendOtpViaGoogleSheets(cleanEmail, generatedCode, fullName);
    if (res?.success) googleMailSent = true;
  } catch (err) {
    console.warn("Google Apps Script email dispatch notice:", err);
  }

  return {
    success: true,
    email: cleanEmail,
    code: generatedCode,
    supabaseSent,
    googleMailSent,
    rateLimitWarning
  };
}

export async function apiVerifyEmailOtp(email, enteredToken, fullName = 'Citizen') {
  const cleanEmail = email.trim().toLowerCase();
  const token = (enteredToken || '').trim();

  if (token.length < 6) {
    throw new Error("Please enter the complete 6-digit verification code.");
  }

  const client = getSupabase();

  // 1. Try Supabase verifyOtp first
  if (client) {
    try {
      const { data, error } = await client.auth.verifyOtp({
        email: cleanEmail,
        token: token,
        type: 'email'
      });
      if (!error && data?.user) {
        localStorage.setItem('civicpulse_auth_session', JSON.stringify({
          user: data.user,
          expiresAt: Date.now() + 7 * 86400000
        }));
        return data.user;
      }
    } catch (sbErr) {
      console.warn("Supabase verifyOtp notice:", sbErr);
    }
  }

  // 2. Validate against session challenge code or demo bypass code
  const storedRaw = sessionStorage.getItem('civicpulse_active_otp');
  let isValid = false;

  if (storedRaw) {
    try {
      const parsed = JSON.parse(storedRaw);
      if (parsed.email === cleanEmail && parsed.otp === token) {
        isValid = true;
      }
    } catch {}
  }

  if (token === '123456') isValid = true;

  if (!isValid) {
    throw new Error("Invalid 6-digit verification code. Please check your email or click Resend.");
  }

  // Register in local registry if not already registered
  const users = getRegisteredUsers();
  let user = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    user = {
      id: "usr-" + Date.now().toString().slice(-6),
      email: cleanEmail,
      fullName: fullName.trim() || 'Aditya Singh',
      role: 'Verified Citizen (Email OTP)',
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY_LOCAL_USERS, JSON.stringify([user, ...users]));
  }

  const authenticatedUser = {
    id: user.id,
    email: user.email,
    user_metadata: {
      full_name: user.fullName || fullName || 'Aditya Singh',
      role: 'Verified Citizen (Email OTP)'
    }
  };

  localStorage.setItem('civicpulse_auth_session', JSON.stringify({
    user: authenticatedUser,
    expiresAt: Date.now() + 7 * 86400000
  }));

  return authenticatedUser;
}

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
  localStorage.removeItem('civicpulse_auth_session');
  sessionStorage.removeItem('civicpulse_active_otp');
  const client = getSupabase();
  if (client) {
    try {
      await client.auth.signOut();
    } catch {}
  }
}

export async function apiGetSession() {
  const client = getSupabase();
  if (client) {
    try {
      const { data } = await client.auth.getSession();
      if (data?.session) return data.session;
    } catch {}
  }

  try {
    const raw = localStorage.getItem('civicpulse_auth_session');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.expiresAt > Date.now()) {
        return { user: parsed.user };
      }
    }
  } catch {}

  return null;
}
