import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'shadat_poetry_supabase_url';
const STORAGE_KEY_KEY = 'shadat_poetry_supabase_key';

export function getSupabaseCredentials(): { url: string; key: string; isLive: boolean } {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
  const customUrl = localStorage.getItem(STORAGE_KEY_URL);
  const customKey = localStorage.getItem(STORAGE_KEY_KEY);

  const url = customUrl || envUrl || '';
  const key = customKey || envKey || '';

  const isLive = Boolean(url && key && url.startsWith('https://') && !url.includes('placeholder'));
  return { url, key, isLive };
}

let cachedClient: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export function getSupabase(): SupabaseClient | null {
  const { url, key, isLive } = getSupabaseCredentials();
  if (!isLive) return null;

  if (cachedClient && lastUrl === url && lastKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    lastUrl = url;
    lastKey = key;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export function saveCustomSupabaseCredentials(url: string, key: string) {
  if (url && key) {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_KEY);
  }
  cachedClient = null;
}

export function clearCustomSupabaseCredentials() {
  localStorage.removeItem(STORAGE_KEY_URL);
  localStorage.removeItem(STORAGE_KEY_KEY);
  cachedClient = null;
}

export type CoverContentType = 'poems' | 'stories' | 'novels';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

/**
 * Validate that the selected file is an allowed image type and within size limits.
 */
export function validateCoverImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'কোনো ফাইল নির্বাচন করা হয়নি।' };
  }

  const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
  const isMimeValid = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isExtValid = ALLOWED_EXTENSIONS.includes(fileExt);

  if (!isMimeValid && !isExtValid) {
    return {
      valid: false,
      error: 'শুধুমাত্র JPG, JPEG, PNG অথবা WebP ফরম্যাটের ছবি গ্রহণযোগ্য।',
    };
  }

  // 10MB limit
  const maxBytes = 10 * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: 'ছবির আকার সর্বোচ্চ ১০ মেগাবাইট (MB) পর্যন্ত হতে পারে।',
    };
  }

  return { valid: true };
}

/**
 * Generate a unique safe storage path: covers/{content-type}/{uuid}.{extension}
 */
export function generateCoverStoragePath(contentType: CoverContentType, file: File): string {
  let ext = 'jpg';
  const rawExt = file.name.split('.').pop()?.toLowerCase();
  if (rawExt === 'png') ext = 'png';
  else if (rawExt === 'webp') ext = 'webp';
  else if (rawExt === 'jpg' || rawExt === 'jpeg') ext = 'jpg';
  else if (file.type === 'image/png') ext = 'png';
  else if (file.type === 'image/webp') ext = 'webp';

  const uuid =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });

  return `covers/${contentType}/${uuid}.${ext}`;
}

/**
 * Real Supabase Storage upload to 'covers' bucket.
 * Generates unique safe path and returns public URL from getPublicUrl.
 */
export async function uploadCoverImageToStorage(
  file: File,
  contentType: CoverContentType
): Promise<{ url: string | null; path: string | null; error: string | null }> {
  // 1. Image validation
  const validation = validateCoverImageFile(file);
  if (!validation.valid) {
    return { url: null, path: null, error: validation.error || 'অগ্রহণযোগ্য ছবি ফাইল' };
  }

  // 2. Supabase client check
  const supabase = getSupabase();
  if (!supabase) {
    return {
      url: null,
      path: null,
      error: 'Supabase সংযোগ সক্রিয় নেই। দয়া করে এডমিন প্যানেল থেকে Supabase কনফিগারেশন চেক করুন।',
    };
  }

  // 3. Generate safe unique path
  const storagePath = generateCoverStoragePath(contentType, file);

  try {
    const { error: uploadError } = await supabase.storage
      .from('covers')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || undefined,
      });

    if (uploadError) {
      let friendlyMsg = `ছবি আপলোড ব্যর্থ হয়েছে: ${uploadError.message}`;
      const msgLower = uploadError.message.toLowerCase();
      if (
        msgLower.includes('row-level security') ||
        msgLower.includes('policy') ||
        msgLower.includes('unauthorized') ||
        msgLower.includes('violates')
      ) {
        friendlyMsg = 'ছবি আপলোডের অনুমতি নেই। নিশ্চিত করুন আপনি যথাযথ এডমিন হিসেবে লগইন করেছেন।';
      } else if (msgLower.includes('bucket not found')) {
        friendlyMsg = "Supabase Storage-এ 'covers' নামের পাবলিক বাকেট পাওয়া যায়নি। বাকেট নিশ্চিত করুন।";
      } else if (msgLower.includes('entity too large') || msgLower.includes('payload too large')) {
        friendlyMsg = 'ছবির ফাইলের আকার বাকেট সীমার চেয়ে বড়। ছোট আকারের ছবি নির্বাচন করুন।';
      }
      return { url: null, path: null, error: friendlyMsg };
    }

    const { data } = supabase.storage.from('covers').getPublicUrl(storagePath);
    if (!data?.publicUrl) {
      return { url: null, path: null, error: 'পাবলিক URL তৈরি করতে ব্যর্থ হয়েছে।' };
    }

    return {
      url: data.publicUrl,
      path: storagePath,
      error: null,
    };
  } catch (err: any) {
    return {
      url: null,
      path: null,
      error: err?.message || 'ছবি আপলোড করতে গিয়ে অপ্রত্যাশিত ত্রুটি দেখা দিয়েছে।',
    };
  }
}

/**
 * Safely extract storage path from a Supabase public URL if it belongs to 'covers' bucket.
 */
export function extractStoragePathFromUrl(url: string, bucket: string = 'covers'): string | null {
  if (!url || typeof url !== 'string') return null;
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx !== -1) {
    const raw = url.substring(idx + marker.length).split('?')[0];
    return decodeURIComponent(raw);
  }
  return null;
}

/**
 * Safely delete an old cover image from Supabase Storage 'covers' bucket.
 * Non-blocking: never throws error to avoid breaking database records.
 */
export async function deleteCoverFromStorage(urlOrPath: string): Promise<boolean> {
  if (!urlOrPath) return false;
  const supabase = getSupabase();
  if (!supabase) return false;

  const storagePath =
    urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')
      ? extractStoragePathFromUrl(urlOrPath, 'covers')
      : urlOrPath;

  if (!storagePath) {
    // External URL (e.g., Unsplash or external CDN), skip deletion
    return false;
  }

  try {
    const { error } = await supabase.storage.from('covers').remove([storagePath]);
    if (error) {
      console.warn('পূর্ববর্তী কভার চিত্র মোছার সময় সতর্কবার্তা:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('পূর্ববর্তী কভার চিত্র মোছার সময় ব্যতিক্রম:', err);
    return false;
  }
}

/**
 * Backward-compatible helper for cover image upload
 */
export async function uploadCoverImage(
  file: File,
  folder: string = 'poems'
): Promise<{ url: string | null; error: string | null }> {
  const contentType: CoverContentType =
    folder === 'stories' ? 'stories' : folder === 'novels' ? 'novels' : 'poems';
  const res = await uploadCoverImageToStorage(file, contentType);
  return { url: res.url, error: res.error };
}
