// Không cho chọn ngày đã qua — Date validation utilities

export type DateValidationResult = {
  valid: boolean;
  error?: string;
};

/**
 * Kiểm tra ngày có hợp lệ và trong tương lai không
 * Không cho phép đặt vé ngày đã qua
 *
 * @param dateStr - String dạng 'YYYY-MM-DD' hoặc ISO format
 *
 * @example
 * validateFutureDate('2026-12-25') → { valid: true }
 * validateFutureDate('2020-01-01') → { valid: false, error: '...' }
 * validateFutureDate('invalid')    → { valid: false, error: '...' }
 */
export function validateFutureDate(dateStr: string): DateValidationResult {
  if (!dateStr || typeof dateStr !== 'string') {
    return { valid: false, error: 'Vui lòng chọn ngày khởi hành.' };
  }

  const date = new Date(dateStr);

  // Kiểm tra date có valid không
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Ngày không hợp lệ.' };
  }

  // So sánh với ngày hiện tại (bỏ giờ phút)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  if (date < today) {
    return { valid: false, error: 'Ngày khởi hành không được là ngày đã qua.' };
  }

  // Giới hạn đặt trước tối đa 90 ngày
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 90);

  if (date > maxDate) {
    return { valid: false, error: 'Chỉ có thể đặt vé trước tối đa 90 ngày.' };
  }

  return { valid: true };
}

/**
 * Kiểm tra thời gian khởi hành hợp lệ
 * Giới hạn trong khung giờ hoạt động: 05:00 - 22:00
 *
 * @param timeStr - String dạng 'HH:mm' hoặc 'HH:mm:ss'
 *
 * @example
 * validateDepartureTime('08:30') → { valid: true }
 * validateDepartureTime('03:00') → { valid: false, error: '...' }
 */
export function validateDepartureTime(timeStr: string): DateValidationResult {
  if (!timeStr || typeof timeStr !== 'string') {
    // Thời gian không bắt buộc
    return { valid: true };
  }

  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(timeStr)) {
    return { valid: false, error: 'Thời gian không hợp lệ. Dùng format HH:mm.' };
  }

  const [hours] = timeStr.split(':').map(Number);

  if (hours < 5 || hours >= 22) {
    return {
      valid: false,
      error: 'Giờ khởi hành phải trong khung 05:00 - 22:00.',
    };
  }

  return { valid: true };
}
