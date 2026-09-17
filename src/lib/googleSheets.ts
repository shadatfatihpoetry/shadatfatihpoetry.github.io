const API_URL = String((import.meta as any).env?.VITE_GOOGLE_SCRIPT_URL || '').trim();
const TOKEN_KEY = 'shadat_google_admin_token';

export function isGoogleSheetsConfigured(): boolean {
  return Boolean(API_URL && API_URL.startsWith('https://'));
}

export function getGoogleApiUrl(): string {
  return API_URL;
}

export function getAdminToken(): string {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function clearAdminToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function parseResponse(response: Response): Promise<any> {
  const text = await response.text();
  let data: any;
  try { data = JSON.parse(text); } catch { throw new Error(text || 'সার্ভার থেকে বৈধ উত্তর পাওয়া যায়নি।'); }
  if (!response.ok || data?.ok === false) throw new Error(data?.error || `API error ${response.status}`);
  return data;
}

export async function googleGet(action = 'all'): Promise<any> {
  if (!API_URL) throw new Error('Google Sheets API URL সেট করা হয়নি।');
  const response = await fetch(`${API_URL}?action=${encodeURIComponent(action)}`, { method: 'GET' });
  return parseResponse(response);
}

export async function googlePost(payload: Record<string, any>): Promise<any> {
  if (!API_URL) throw new Error('Google Sheets API URL সেট করা হয়নি।');
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function adminLogin(email: string, password: string): Promise<{ token: string; user: { email: string; role: string } }> {
  const result = await googlePost({ action: 'login', email: email.trim(), password });
  localStorage.setItem(TOKEN_KEY, result.token);
  return result;
}

export async function adminRequest(action: string, extra: Record<string, any> = {}): Promise<any> {
  return googlePost({ action, token: getAdminToken(), ...extra });
}

export async function fetchAllData(): Promise<any> {
  const token = getAdminToken();
  if (token) {
    try { return await adminRequest('adminAll'); } catch { /* fall through to public data */ }
  }
  return googleGet('all');
}

export async function uploadCoverToGoogleDrive(file: File, contentType: 'poems' | 'stories' | 'novels'): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + chunk, bytes.length)));
  }
  const base64 = btoa(binary);
  const result = await adminRequest('uploadCover', {
    filename: file.name,
    mimeType: file.type || 'application/octet-stream',
    contentType,
    base64,
  });
  return result.url;
}
