/**
 * URL Safety — Kiểm tra URL an toàn, chặn XSS qua URL injection
 *
 * Ngăn chặn:
 * - javascript: protocol (XSS)
 * - data: protocol (data exfiltration)
 * - vbscript: protocol (legacy XSS)
 */

/** Các protocol an toàn cho navigation */
const SAFE_PROTOCOLS = ['http:', 'https:', 'tel:', 'mailto:'];

/**
 * Kiểm tra URL có an toàn để dùng trong href/src không
 *
 * @example
 * isSafeUrl('https://example.com')     → true
 * isSafeUrl('tel:0905123456')           → true
 * isSafeUrl('javascript:alert(1)')      → false
 * isSafeUrl('data:text/html,...')       → false
 * isSafeUrl('/about')                   → true (relative URL)
 */
export function isSafeUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;

  const trimmed = url.trim().toLowerCase();

  // Chặn các protocol nguy hiểm
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:')
  ) {
    return false;
  }

  try {
    const parsed = new URL(url);
    return SAFE_PROTOCOLS.includes(parsed.protocol);
  } catch {
    // Relative URL (bắt đầu bằng / hoặc không có protocol) — OK
    return trimmed.startsWith('/') || trimmed.startsWith('#') || !trimmed.includes(':');
  }
}

/**
 * Sanitize URL — trả về URL an toàn hoặc '#' nếu không hợp lệ
 *
 * @example
 * sanitizeUrl('javascript:alert(1)') → '#'
 * sanitizeUrl('https://example.com') → 'https://example.com'
 */
export function sanitizeUrl(url: string): string {
  return isSafeUrl(url) ? url : '#';
}

/**
 * Kiểm tra redirect URL an toàn — chỉ cho phép relative paths
 * Chống Open Redirect vulnerability
 *
 * @example
 * isSafeRedirect('/admin/dashboard')       → true
 * isSafeRedirect('https://evil.com')       → false
 * isSafeRedirect('//evil.com')             → false
 */
export function isSafeRedirect(url: string): boolean {
  if (!url || typeof url !== 'string') return false;

  const trimmed = url.trim();

  // Chỉ cho phép relative paths bắt đầu bằng /
  // Chặn protocol-relative URLs (//evil.com)
  return trimmed.startsWith('/') && !trimmed.startsWith('//');
}
