/**
 * CSRF Verification — Kiểm tra Origin header
 *
 * Next.js Server Actions tự có CSRF token, nhưng nếu dùng
 * custom API routes thì cần verify Origin header thủ công.
 */

/** Danh sách origins được phép */
function getAllowedOrigins(): string[] {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return [
    siteUrl,
    'http://localhost:3000',
    'http://localhost:3001',
  ];
}

/**
 * Kiểm tra request có đến từ origin hợp lệ không
 * Dùng trong API routes (Server Actions đã tự bảo vệ)
 *
 * @example
 * if (!verifyCsrf(request)) {
 *   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
 * }
 */
export function verifyCsrf(request: Request): boolean {
  const origin = request.headers.get('origin');
  const allowedOrigins = getAllowedOrigins();

  // Nếu không có Origin header (same-origin hoặc non-browser request)
  // cần kiểm tra thêm Referer
  if (!origin) {
    const referer = request.headers.get('referer');
    if (!referer) return false;

    try {
      const refererUrl = new URL(referer);
      return allowedOrigins.some(
        (allowed) => new URL(allowed).origin === refererUrl.origin
      );
    } catch {
      return false;
    }
  }

  return allowedOrigins.includes(origin);
}

/**
 * Kiểm tra request method có phải mutation không
 * Mutation methods: POST, PUT, PATCH, DELETE
 */
export function isMutationMethod(method: string): boolean {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
}
