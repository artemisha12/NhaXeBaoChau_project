// Kiểm tra số điện thoại Việt Nam
// Hỗ trợ: 10 số bắt đầu bằng 0, hoặc +84 theo chuẩn quốc tế

/**
 * Regex cho số điện thoại Việt Nam hợp lệ
 * - Bắt đầu bằng 0: 10 chữ số (0xxx xxx xxx)
 * - Bắt đầu bằng +84: +84 + 9 chữ số
 * - Cho phép khoảng trắng, dấu gạch ngang giữa các nhóm số
 */
const VN_PHONE_REGEX = /^(0\d{9}|\+84\d{9})$/;

/**
 * Các đầu số di động Việt Nam hợp lệ (2024+)
 */
const VALID_PREFIXES = [
  // Viettel
  '032', '033', '034', '035', '036', '037', '038', '039', '086', '096', '097', '098',
  // Mobifone
  '070', '076', '077', '078', '079', '089', '090', '093',
  // Vinaphone
  '081', '082', '083', '084', '085', '088', '091', '094',
  // Vietnamobile
  '052', '056', '058', '092',
  // Gmobile
  '059', '099',
];

export type PhoneValidationResult = {
  valid: boolean;
  error?: string;
  /** Số điện thoại đã chuẩn hóa (chỉ chữ số và +) */
  normalized?: string;
};

/**
 * Validate số điện thoại Việt Nam
 *
 * @example
 * validateVietnamesePhone('0905 123 456')
 * // { valid: true, normalized: '0905123456' }
 *
 * validateVietnamesePhone('1234')
 * // { valid: false, error: 'Số điện thoại phải có 10 chữ số.' }
 */
export function validateVietnamesePhone(phone: string): PhoneValidationResult {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Vui lòng nhập số điện thoại.' };
  }

  // Chuẩn hóa: bỏ khoảng trắng, dấu gạch, dấu chấm
  const normalized = phone.replace(/[\s\-\.\(\)]/g, '');

  // Kiểm tra format
  if (!VN_PHONE_REGEX.test(normalized)) {
    return {
      valid: false,
      error: 'Số điện thoại không hợp lệ. Nhập 10 số bắt đầu bằng 0 (VD: 0905123456).',
    };
  }

  // Chuyển +84 → 0 để kiểm tra prefix
  const domesticNumber = normalized.startsWith('+84')
    ? '0' + normalized.slice(3)
    : normalized;

  // Kiểm tra đầu số (optional — có thể bỏ nếu quá strict)
  const prefix3 = domesticNumber.slice(0, 3);
  if (!VALID_PREFIXES.includes(prefix3)) {
    return {
      valid: false,
      error: 'Đầu số điện thoại không hợp lệ.',
    };
  }

  return { valid: true, normalized };
}
