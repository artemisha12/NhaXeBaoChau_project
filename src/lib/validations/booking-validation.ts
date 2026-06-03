// Kiểm tra form đặt vé — Server-side & Client-side validation
// QUAN TRỌNG: Client-side validation chỉ để UX, server-side mới là bảo mật

import { validateVietnamesePhone } from './phone-validation';
import { validateFutureDate } from './date-validation';

/**
 * Dữ liệu input từ form đặt vé
 */
export type BookingInput = {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  pickupAddress: string;
  dropoffAddress: string;
  departureDate: string;
  departureTime?: string;
  passengerCount: number;
  packageId?: number;
  customerNote?: string;
};

/**
 * Kết quả validation
 */
export type ValidationResult = {
  valid: boolean;
  errors: Record<string, string>;
};

/**
 * Validate toàn bộ form đặt vé
 *
 * @example
 * const result = validateBooking(formData);
 * if (!result.valid) {
 *   console.log(result.errors);
 *   // { customerName: 'Tên phải từ 2-100 ký tự.', ... }
 * }
 */
export function validateBooking(input: BookingInput): ValidationResult {
  const errors: Record<string, string> = {};

  // ── Tên khách hàng: 2-100 ký tự, không chứa HTML ──
  if (!input.customerName || input.customerName.trim().length < 2) {
    errors.customerName = 'Tên khách hàng phải có ít nhất 2 ký tự.';
  } else if (input.customerName.length > 100) {
    errors.customerName = 'Tên khách hàng tối đa 100 ký tự.';
  } else if (/<[^>]*>/g.test(input.customerName)) {
    errors.customerName = 'Tên không hợp lệ.';
  }

  // ── Số điện thoại: Validate format Việt Nam ──
  const phoneResult = validateVietnamesePhone(input.customerPhone);
  if (!phoneResult.valid) {
    errors.customerPhone = phoneResult.error!;
  }

  // ── Email (nếu có): Format email hợp lệ ──
  if (input.customerEmail && input.customerEmail.trim().length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.customerEmail)) {
      errors.customerEmail = 'Email không hợp lệ.';
    }
    if (input.customerEmail.length > 100) {
      errors.customerEmail = 'Email tối đa 100 ký tự.';
    }
  }

  // ── Địa chỉ đón: 5-255 ký tự ──
  if (!input.pickupAddress || input.pickupAddress.trim().length < 5) {
    errors.pickupAddress = 'Địa chỉ đón phải có ít nhất 5 ký tự.';
  } else if (input.pickupAddress.length > 255) {
    errors.pickupAddress = 'Địa chỉ đón tối đa 255 ký tự.';
  }

  // ── Địa chỉ trả: 5-255 ký tự ──
  if (!input.dropoffAddress || input.dropoffAddress.trim().length < 5) {
    errors.dropoffAddress = 'Địa chỉ trả phải có ít nhất 5 ký tự.';
  } else if (input.dropoffAddress.length > 255) {
    errors.dropoffAddress = 'Địa chỉ trả tối đa 255 ký tự.';
  }

  // ── Ngày khởi hành: không được là ngày quá khứ ──
  const dateResult = validateFutureDate(input.departureDate);
  if (!dateResult.valid) {
    errors.departureDate = dateResult.error!;
  }

  // ── Số hành khách: 1-30 ──
  if (
    !input.passengerCount ||
    !Number.isInteger(input.passengerCount) ||
    input.passengerCount < 1 ||
    input.passengerCount > 30
  ) {
    errors.passengerCount = 'Số hành khách phải từ 1-30.';
  }

  // ── Ghi chú (nếu có): tối đa 500 ký tự ──
  if (input.customerNote && input.customerNote.length > 500) {
    errors.customerNote = 'Ghi chú tối đa 500 ký tự.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
