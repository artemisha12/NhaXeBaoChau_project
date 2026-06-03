// Kiểm tra giá hợp lệ — Price validation utilities

export type PriceValidationResult = {
  valid: boolean;
  error?: string;
};

/**
 * Kiểm tra giá tiền hợp lệ
 *
 * Quy tắc:
 * - Phải là số dương
 * - Tối thiểu 10,000 VND (tránh giá sai do nhầm đơn vị)
 * - Tối đa 100,000,000 VND (100 triệu — hợp lý cho xe ghép/bao chuyến)
 * - Phải là bội số của 1,000 VND
 *
 * @example
 * validatePrice(350000) → { valid: true }
 * validatePrice(-100)   → { valid: false, error: '...' }
 * validatePrice(500)    → { valid: false, error: '...' }
 */
export function validatePrice(price: number): PriceValidationResult {
  if (price === undefined || price === null || typeof price !== 'number') {
    return { valid: false, error: 'Vui lòng nhập giá.' };
  }

  if (isNaN(price) || !isFinite(price)) {
    return { valid: false, error: 'Giá không hợp lệ.' };
  }

  if (price <= 0) {
    return { valid: false, error: 'Giá phải là số dương.' };
  }

  if (price < 10_000) {
    return {
      valid: false,
      error: 'Giá tối thiểu 10,000 VND. Vui lòng kiểm tra lại đơn vị.',
    };
  }

  if (price > 100_000_000) {
    return {
      valid: false,
      error: 'Giá tối đa 100,000,000 VND.',
    };
  }

  if (price % 1000 !== 0) {
    return {
      valid: false,
      error: 'Giá phải là bội số của 1,000 VND.',
    };
  }

  return { valid: true };
}

/**
 * Format giá tiền sang chuỗi hiển thị tiếng Việt
 *
 * @example
 * formatPrice(350000) → '350.000 ₫'
 * formatPrice(1500000) → '1.500.000 ₫'
 */
export function formatPrice(price: number): string {
  return (
    new Intl.NumberFormat('vi-VN').format(price) + ' ₫'
  );
}

/**
 * Parse giá từ string input (cho phép có dấu chấm, dấu phẩy)
 *
 * @example
 * parsePrice('350.000') → 350000
 * parsePrice('1,500,000') → 1500000
 * parsePrice('abc') → NaN
 */
export function parsePrice(input: string): number {
  // Loại bỏ ký tự không phải số
  const cleaned = input.replace(/[^\d]/g, '');
  return parseInt(cleaned, 10);
}
