/**
 * Convert standard Arabic/English digits to Bengali numerals
 */
export function toBengaliNumber(num: number | string | undefined | null): string {
  if (num === undefined || num === null) return '০';
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (digit) => bengaliDigits[parseInt(digit, 10)]);
}

/**
 * Format date into clean Bengali representation
 */
export function formatBengaliDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return toBengaliNumber(dateStr);
    }
    const months = [
      'জানুয়ারি',
      'ফেব্রুয়ারি',
      'মার্চ',
      'এপ্রিল',
      'মে',
      'জুন',
      'জুলাই',
      'আগস্ট',
      'সেপ্টেম্বর',
      'অক্টোবর',
      'নভেম্বর',
      'ডিসেম্বর',
    ];
    const day = toBengaliNumber(d.getDate());
    const month = months[d.getMonth()];
    const year = toBengaliNumber(d.getFullYear());

    let hours = d.getHours();
    const minutes = d.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    if (hours === 0) hours = 12;

    const time = `${toBengaliNumber(hours)}:${toBengaliNumber(String(minutes).padStart(2, '0'))} ${period}`;

    return `${day} ${month}, ${year} · ${time}`;
  } catch {
    return toBengaliNumber(dateStr);
  }
}

/**
 * Calculate reading time in minutes (Bengali text estimate)
 */
export function getReadingTime(text: string): string {
  if (!text) return '১ মিনিট পাঠ';
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 180));
  return `${toBengaliNumber(minutes)} মিনিট পাঠ`;
}

/**
 * Generate a clean URL slug from title (handles Bengali and English transliterations)
 */
export function generateSlug(title: string): string {
  if (!title) return `item-${Date.now()}`;
  return title
    .trim()
    .toLowerCase()
    .replace(/[^\w\s\u0980-\u09FF-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || `item-${Date.now()}`;
}
