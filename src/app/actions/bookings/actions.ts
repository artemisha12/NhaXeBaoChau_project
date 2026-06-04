'use server';

import { getSupabaseServer } from '@/lib/supabase/server';
import { getAdminSession } from '@/lib/helpers/session';
import { mapDbToBooking } from '@/lib/supabase/mappers';
import type { Booking, BookingStatus } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { sendTelegramMessage, buildBookingMessage } from '@/lib/helpers/telegram';

// Fetch all bookings (Admin only)
export async function getBookings(): Promise<Booking[]> {
  try {
    const session = await getAdminSession();
    if (!session) {
      return []; // Return empty if not admin
    }

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        packages (
          package_id,
          routes ( departure_point, destination_point )
        )
      `)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }

    return (data || []).map(mapDbToBooking);
  } catch (error) {
    console.error('Error in getBookings action:', error);
    return [];
  }
}

// Add booking (Public & Admin)
export async function addBookingAction(
  bookingData: Omit<Booking, 'id' | 'code' | 'status'>
): Promise<{ success: boolean; data?: Booking; error?: string }> {
  try {
    const supabase = getSupabaseServer();

    // 1. Lấy package_id — ưu tiên từ data, fallback lookup theo tuyến + giá
    let packageId: number | null = bookingData.packageId || null;

    if (!packageId) {
      // Fallback: tìm theo tuyến đường
      let departure = '';
      let destination = '';
      const routeName = bookingData.routeName;
      if (routeName.includes('→')) { const p = routeName.split('→'); departure = p[0].trim(); destination = p[1].trim(); }
      else if (routeName.includes('-')) { const p = routeName.split('-'); departure = p[0].trim(); destination = p[1].trim(); }

      if (departure && destination) {
        const { data: route } = await supabase.from('routes').select('route_id').eq('departure_point', departure).eq('destination_point', destination).eq('is_deleted', false).maybeSingle();
        if (route) {
          const { data: pkg } = await supabase.from('packages').select('package_id').eq('route_id', route.route_id).eq('price', bookingData.priceAtBooking || 0).eq('is_deleted', false).maybeSingle();
          if (pkg) { packageId = pkg.package_id; }
          else {
            const { data: fb } = await supabase.from('packages').select('package_id').eq('route_id', route.route_id).eq('is_deleted', false).limit(1).maybeSingle();
            if (fb) packageId = fb.package_id;
          }
        }
      }
    }

    if (!packageId) {
      return { success: false, error: 'Không tìm thấy gói xe phù hợp. Vui lòng thử lại hoặc liên hệ nhà xe.' };
    }

    // 2. Tạo mã đặt vé BC-YYYYMMDD-XXX
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randNum = Math.floor(100 + Math.random() * 900);
    const bookingCode = `BC-${todayStr}-${randNum}`;

    // 3. Chèn vào bảng bookings
    const { data: newBookingRow, error } = await supabase
      .from('bookings')
      .insert([
        {
          booking_code: bookingCode,
          package_id: packageId,
          customer_name: bookingData.customerName,
          customer_phone: bookingData.phone,
          customer_email: bookingData.customerEmail || null,
          pickup_address: bookingData.pickupAddress,
          dropoff_address: bookingData.dropoffAddress,
          departure_date: bookingData.travelDate,
          passenger_count: bookingData.passengerCount,
          price_at_booking: bookingData.priceAtBooking || 0,
          total_amount: bookingData.totalPrice,
          status: 'new',
          customer_note: bookingData.customerNote || null,
          internal_note: bookingData.internalNote || null,
        },
      ])
      .select(`
        *,
        packages (
          package_id,
          routes ( departure_point, destination_point )
        )
      `)
      .single();

    if (error || !newBookingRow) {
      console.error('Error inserting booking:', error);
      return { success: false, error: 'Không thể khởi tạo đơn đặt vé.' };
    }

    // 4. Ghi nhận lịch sử trạng thái đầu tiên
    await supabase.from('booking_status_history').insert([
      {
        booking_id: newBookingRow.booking_id,
        old_status: 'created',
        new_status: 'new',
        note: 'Khách hàng gửi yêu cầu đặt vé trực tuyến.',
        admin_id: null, // Mặc định null vì do khách hàng đặt
      },
    ]);

    revalidatePath('/admin/bookings');

    // Gửi thông báo Telegram (không block flow chính)
    const mapped = mapDbToBooking(newBookingRow);
    sendTelegramMessage(buildBookingMessage({
      code: bookingCode,
      customerName: bookingData.customerName,
      phone: bookingData.phone,
      routeName: bookingData.routeName,
      travelDate: bookingData.travelDate,
      pickupAddress: bookingData.pickupAddress,
      dropoffAddress: bookingData.dropoffAddress,
      passengerCount: bookingData.passengerCount,
      totalPrice: bookingData.totalPrice,
    })).catch(() => {});

    return { success: true, data: mapped };
  } catch (error) {
    console.error('Error in addBookingAction:', error);
    return { success: false, error: 'Lỗi hệ thống khi đặt vé.' };
  }
}

// Fetch bookings có phân trang (Admin only)
export async function getBookingsPaginated(opts: {
  page: number;
  pageSize?: number;
  status?: string;
  route?: string;
  search?: string;
  date?: string;
}): Promise<{ bookings: Booking[]; total: number; hasMore: boolean }> {
  try {
    const session = await getAdminSession();
    if (!session) return { bookings: [], total: 0, hasMore: false };

    const { page, pageSize = 20, status, search, date } = opts;
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const supabase = getSupabaseServer();
    let query = supabase
      .from('bookings')
      .select(`*, packages(package_id, routes(departure_point, destination_point))`, { count: 'exact' })
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (status && status !== 'all') query = query.eq('status', status);
    if (date) query = query.eq('departure_date', date);
    if (search) query = query.or(`customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%,booking_code.ilike.%${search}%`);

    const { data, error, count } = await query;
    if (error) { console.error('getBookingsPaginated error:', error); return { bookings: [], total: 0, hasMore: false }; }

    const total = count ?? 0;
    return {
      bookings: (data || []).map(mapDbToBooking),
      total,
      hasMore: from + pageSize < total,
    };
  } catch (err) {
    console.error('getBookingsPaginated exception:', err);
    return { bookings: [], total: 0, hasMore: false };
  }
}

// Update booking status (Admin only)
export async function updateBookingStatusAction(
  bookingId: number,
  newStatus: BookingStatus,
  note: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: 'Phiên đăng nhập hết hạn hoặc không hợp lệ.' };
    }

    const supabase = getSupabaseServer();

    // Lấy trạng thái hiện tại của đơn hàng
    const { data: current, error: getError } = await supabase
      .from('bookings')
      .select('status')
      .eq('booking_id', bookingId)
      .single();

    if (getError || !current) {
      return { success: false, error: 'Không tìm thấy đơn đặt vé.' };
    }

    // Cập nhật trạng thái mới
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('booking_id', bookingId);

    if (updateError) {
      console.error('Error updating booking status:', updateError);
      return { success: false, error: 'Không thể cập nhật trạng thái.' };
    }

    // Ghi nhận lịch sử
    const historyNote = note || `Đổi trạng thái đơn sang: ${
      newStatus === 'confirmed' ? 'Đã xác nhận' : newStatus === 'completed' ? 'Hoàn thành' : 'Đã hủy'
    }.`;

    await supabase.from('booking_status_history').insert([
      {
        booking_id: bookingId,
        old_status: current.status,
        new_status: newStatus,
        note: historyNote,
        admin_id: session.adminId,
      },
    ]);

    revalidatePath('/admin/bookings');
    return { success: true };
  } catch (error) {
    console.error('Error in updateBookingStatusAction:', error);
    return { success: false, error: 'Lỗi hệ thống khi đổi trạng thái.' };
  }
}

// Update booking internal note (Admin only)
export async function updateBookingInternalNoteAction(
  bookingId: number,
  note: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: 'Phiên đăng nhập hết hạn hoặc không hợp lệ.' };
    }

    const supabase = getSupabaseServer();
    const { error } = await supabase
      .from('bookings')
      .update({ internal_note: note })
      .eq('booking_id', bookingId);

    if (error) {
      console.error('Error updating internal note:', error);
      return { success: false, error: 'Không thể cập nhật ghi chú nội bộ.' };
    }

    revalidatePath('/admin/bookings');
    return { success: true };
  } catch (error) {
    console.error('Error in updateBookingInternalNoteAction:', error);
    return { success: false, error: 'Lỗi hệ thống khi cập nhật ghi chú.' };
  }
}

// Update departure_time — column chưa có trong DB, chỉ cập nhật UI state
// TODO: Thêm migration: ALTER TABLE bookings ADD COLUMN departure_time TIME;
export async function updateBookingTravelTimeAction(
  _bookingId: number,
  _travelTime: string
): Promise<{ success: boolean; error?: string }> {
  return { success: true }; // Graceful no-op cho đến khi migration được chạy
}

// Fetch booking history (Admin only)
export async function getBookingHistory(): Promise<any[]> {
  try {
    const session = await getAdminSession();
    if (!session) {
      return [];
    }

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from('booking_status_history')
      .select(`
        history_id,
        booking_id,
        old_status,
        new_status,
        note,
        changed_at,
        admins (
          username,
          admin_information ( full_name )
        )
      `)
      .eq('is_deleted', false)
      .order('changed_at', { ascending: false });

    if (error) {
      console.error('Error fetching booking history:', error);
      return [];
    }

    return (data || []).map((db: any) => {
      const changedBy = db.admins?.admin_information?.full_name || db.admins?.username || 'Khách hàng';
      return {
        id: db.history_id,
        bookingId: db.booking_id,
        oldStatus: db.old_status || 'created',
        newStatus: db.new_status,
        note: db.note || '',
        changedAt: db.changed_at,
        changedBy,
      };
    });
  } catch (error) {
    console.error('Error in getBookingHistory action:', error);
    return [];
  }
}

// Dashboard stats - đếm từ DB theo ngày hiện tại
export async function getDashboardStats(): Promise<{
  todayCount: number;
  pendingCount: number;
  monthlyCount: number;
  monthlyRevenue: number;
  yesterdayCount: number;
  lastMonthCount: number;
  lastMonthRevenue: number;
}> {
  try {
    const supabase = getSupabaseServer();
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const monthStr = todayStr.slice(0, 7);
    const yesterday = new Date(now.getTime() - 86400000).toISOString().slice(0, 10);
    const lastMonth = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`;

    const [todayRes, pendingRes, monthlyRes, monthlyRevRes, yesterdayRes, lastMonthRes, lastMonthRevRes] = await Promise.all([
      supabase.from('bookings').select('booking_id', { count: 'exact', head: true }).eq('is_deleted', false).gte('created_at', todayStr + 'T00:00:00').lte('created_at', todayStr + 'T23:59:59'),
      supabase.from('bookings').select('booking_id', { count: 'exact', head: true }).eq('is_deleted', false).eq('status', 'new'),
      supabase.from('bookings').select('booking_id', { count: 'exact', head: true }).eq('is_deleted', false).gte('departure_date', monthStr + '-01').lte('departure_date', monthStr + '-31'),
      supabase.from('bookings').select('total_amount').eq('is_deleted', false).in('status', ['confirmed', 'completed']).gte('departure_date', monthStr + '-01').lte('departure_date', monthStr + '-31'),
      supabase.from('bookings').select('booking_id', { count: 'exact', head: true }).eq('is_deleted', false).gte('created_at', yesterday + 'T00:00:00').lte('created_at', yesterday + 'T23:59:59'),
      supabase.from('bookings').select('booking_id', { count: 'exact', head: true }).eq('is_deleted', false).gte('departure_date', lastMonth + '-01').lte('departure_date', lastMonth + '-31'),
      supabase.from('bookings').select('total_amount').eq('is_deleted', false).in('status', ['confirmed', 'completed']).gte('departure_date', lastMonth + '-01').lte('departure_date', lastMonth + '-31'),
    ]);

    const monthlyRevenue = (monthlyRevRes.data || []).reduce((s, b) => s + Number(b.total_amount), 0);
    const lastMonthRevenue = (lastMonthRevRes.data || []).reduce((s, b) => s + Number(b.total_amount), 0);

    return {
      todayCount: todayRes.count ?? 0,
      pendingCount: pendingRes.count ?? 0,
      monthlyCount: monthlyRes.count ?? 0,
      monthlyRevenue,
      yesterdayCount: yesterdayRes.count ?? 0,
      lastMonthCount: lastMonthRes.count ?? 0,
      lastMonthRevenue,
    };
  } catch {
    return { todayCount: 0, pendingCount: 0, monthlyCount: 0, monthlyRevenue: 0, yesterdayCount: 0, lastMonthCount: 0, lastMonthRevenue: 0 };
  }
}
