/**
 * Sanitization helpers — Loại bỏ nội dung nguy hiểm khỏi user input
 *
 * QUAN TRỌNG: Luôn sanitize TRƯỚC khi lưu database.
 * React JSX tự escape output, nhưng dữ liệu trong DB vẫn cần sạch.
 */

/**
 * Loại bỏ tất cả HTML tags khỏi input string
 * Phòng chống Stored XSS
 *
 * @example stripHtml('<script>alert(1)</script>Xin chào') → 'alert(1)Xin chào'
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim();
}

/**
 * Escape các ký tự đặc biệt HTML cho hiển thị an toàn
 * Dùng khi cần hiển thị raw text mà không qua React JSX
 *
 * @example escapeHtml('<b>bold</b>') → '&lt;b&gt;bold&lt;/b&gt;'
 */
export function escapeHtml(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return input.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Sanitize số điện thoại — chỉ giữ lại số và dấu +
 * Loại bỏ khoảng trắng, dấu gạch ngang, dấu chấm, v.v.
 *
 * @example sanitizePhone('0905 123-456') → '0905123456'
 * @example sanitizePhone('+84 905 123 456') → '+84905123456'
 */
export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

/**
 * Trim và chuẩn hóa whitespace — loại bỏ khoảng trắng thừa
 *
 * @example normalizeWhitespace('  Huế    Đà Nẵng  ') → 'Huế Đà Nẵng'
 */
export function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

/**
 * Sanitize một object input — áp dụng stripHtml + normalizeWhitespace
 * cho tất cả string fields
 */
export function sanitizeStringFields<T extends Record<string, unknown>>(
  obj: T
): T {
  const result = { ...obj };
  for (const key in result) {
    const value = result[key];
    if (typeof value === 'string') {
      (result as Record<string, unknown>)[key] = normalizeWhitespace(
        stripHtml(value)
      );
    }
  }
  return result;
}
