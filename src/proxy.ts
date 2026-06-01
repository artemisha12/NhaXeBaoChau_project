import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// ════════════════════════════════════════════════════════════
//  CONFIG: Định nghĩa routes
// ════════════════════════════════════════════════════════════

/** Các route public — không yêu cầu auth */
const PUBLIC_ROUTES = ['/', '/login'];

/** Route trang login admin */
const ADMIN_LOGIN_ROUTE = '/admin/login';

/** Prefix cho mọi admin route cần bảo vệ */
const ADMIN_PROTECTED_PREFIX = '/admin';

/** Các path KHÔNG chạy middleware */
const IGNORED_PREFIXES = [
  '/_next',
  '/api',
  '/images',
  '/favicon.ico',
];

// ════════════════════════════════════════════════════════════
//  RATE LIMITING: In-memory store (Edge-compatible)
//  ⚠️ Production nên dùng Upstash Redis thay thế
// ════════════════════════════════════════════════════════════

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limiting cho một IP
 * @param key - Khóa unique (thường là IP hoặc IP + action)
 * @param limit - Số request tối đa
 * @param windowMs - Thời gian cửa sổ (ms)
 */
function rateLimit(
  key: string,
  limit: number = 60,
  windowMs: number = 60_000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  // Dọn dẹp entries quá hạn (mỗi 100 entries)
  if (rateLimitStore.size > 10_000) {
    for (const [k, v] of rateLimitStore) {
      if (now > v.resetTime) rateLimitStore.delete(k);
    }
  }

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  record.count++;
  if (record.count > limit) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: limit - record.count };
}

/**
 * Rate limit đặc biệt cho login (chặt hơn: 5 req / 60s)
 */
function rateLimitLogin(ip: string): { allowed: boolean; remaining: number } {
  return rateLimit(`login:${ip}`, 5, 60_000);
}

/**
 * Rate limit cho booking form (3 req / 5 phút)
 */
function rateLimitBooking(ip: string): { allowed: boolean; remaining: number } {
  return rateLimit(`booking:${ip}`, 3, 5 * 60_000);
}

// ════════════════════════════════════════════════════════════
//  SECURITY HEADERS
// ════════════════════════════════════════════════════════════

/**
 * Áp dụng security headers cho mọi response
 */
function applySecurityHeaders(response: NextResponse): NextResponse {
  // Chống clickjacking — không cho embed trong iframe
  response.headers.set('X-Frame-Options', 'DENY');

  // Chống MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Chống XSS (legacy browsers)
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Kiểm soát referrer
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Tắt các tính năng browser không cần thiết
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );

  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      // Next.js cần unsafe-inline & unsafe-eval cho dev mode
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      // Cho phép kết nối tới Supabase
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      // Cho phép Leaflet tile servers (map)
      "img-src 'self' data: blob: https: https://*.tile.openstreetmap.org",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );

  // HSTS — Bắt buộc HTTPS (chỉ production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  return response;
}

// ════════════════════════════════════════════════════════════
//  SESSION VERIFICATION
// ════════════════════════════════════════════════════════════

/**
 * Kiểm tra admin session từ httpOnly cookie
 */
async function verifyAdminSession(request: NextRequest): Promise<boolean> {
  const sessionToken = request.cookies.get('bc_admin_session')?.value;

  if (!sessionToken) return false;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-for-dev-only-change-in-env');
    const { payload } = await jwtVerify(sessionToken, secret);
    return !!payload && (payload.exp ?? 0) > Date.now() / 1000;
  } catch {
    return false;
  }
}

// ════════════════════════════════════════════════════════════
//  MAIN MIDDLEWARE
// ════════════════════════════════════════════════════════════

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Bỏ qua static files & internal routes ──
  if (IGNORED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // ── 2. Lấy IP cho rate limiting ──
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  // ── 3. Rate Limiting — tất cả routes ──
  const { allowed, remaining } = rateLimit(ip);
  if (!allowed) {
    return new NextResponse(
      JSON.stringify({ error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60',
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  // ── 4. Rate Limiting đặc biệt cho login POST ──
  if (pathname === ADMIN_LOGIN_ROUTE && request.method === 'POST') {
    const loginLimit = rateLimitLogin(ip);
    if (!loginLimit.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: 'Quá nhiều lần đăng nhập. Vui lòng thử lại sau 1 phút.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
          },
        }
      );
    }
  }

  // ── 5. PUBLIC ROUTES — cho phép tự do ──
  if (PUBLIC_ROUTES.includes(pathname)) {
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    return applySecurityHeaders(response);
  }

  // ── 6. ADMIN LOGIN PAGE — nếu đã login thì redirect về dashboard ──
  if (pathname === ADMIN_LOGIN_ROUTE) {
    const isAuthenticated = await verifyAdminSession(request);
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    const response = NextResponse.next();
    return applySecurityHeaders(response);
  }

  // ── 7. ADMIN PROTECTED ROUTES — yêu cầu authentication ──
  if (pathname.startsWith(ADMIN_PROTECTED_PREFIX)) {
    const isAuthenticated = await verifyAdminSession(request);

    if (!isAuthenticated) {
      // Lưu URL gốc để redirect lại sau khi login
      const loginUrl = new URL(ADMIN_LOGIN_ROUTE, request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Admin pages: không cache
    const response = NextResponse.next();
    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return applySecurityHeaders(response);
  }

  // ── 8. Mọi route khác — apply security headers ──
  const response = NextResponse.next();
  return applySecurityHeaders(response);
}

// ════════════════════════════════════════════════════════════
//  MATCHER — Routes mà middleware xử lý
// ════════════════════════════════════════════════════════════

export const config = {
  matcher: [
    /*
     * Match tất cả paths NGOẠI TRỪ:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - Files có extension (.png, .jpg, .svg, .css, .js, .webp, .ico)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
