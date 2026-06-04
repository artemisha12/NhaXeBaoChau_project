const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';
const API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

export async function sendTelegramMessage(text: string): Promise<void> {
  if (!BOT_TOKEN || !CHAT_ID) return;
  try {
    await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML' }),
    });
  } catch {
    // Không ảnh hưởng flow chính nếu Telegram lỗi
  }
}

export function buildBookingMessage(booking: {
  code: string;
  customerName: string;
  phone: string;
  routeName: string;
  travelDate: string;
  pickupAddress: string;
  dropoffAddress: string;
  passengerCount: number;
  totalPrice: number;
}): string {
  const price = new Intl.NumberFormat('vi-VN').format(booking.totalPrice) + 'đ';
  const date = booking.travelDate;
  return [
    `🚗 <b>ĐƠN ĐẶT VÉ MỚI</b>`,
    `━━━━━━━━━━━━━━━━━━`,
    `📋 Mã đơn: <b>${booking.code}</b>`,
    `👤 Khách: <b>${booking.customerName}</b>`,
    `📞 SĐT: <code>${booking.phone}</code>`,
    `🛣 Tuyến: <b>${booking.routeName}</b>`,
    `📅 Ngày đi: <b>${date}</b>`,
    `📍 Đón: ${booking.pickupAddress}`,
    `📍 Trả: ${booking.dropoffAddress}`,
    `👥 Số khách: <b>${booking.passengerCount} người</b>`,
    `💰 Tổng tiền: <b>${price}</b>`,
    `━━━━━━━━━━━━━━━━━━`,
    `⏰ ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`,
  ].join('\n');
}
