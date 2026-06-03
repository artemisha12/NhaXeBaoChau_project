'use server';

import { getSupabaseServer } from '@/lib/supabase/server';
import { getAdminSession } from '@/lib/helpers/session';
import { mapDbToBooking } from '@/lib/supabase/mappers';
import type { Booking, BookingStatus } from '@/lib/types';
import { revalidatePath } from 'next/cache';

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

    // 1. Phân giải package_id từ routeName và priceAtBooking
    let packageId: number | null = null;
    let departure = '';
    let destination = '';
    const routeName = bookingData.routeName;

    if (routeName.includes('→')) {
      const parts = routeName.split('→');
      departure = parts[0].trim();
      destination = parts[1].trim();
    } else if (routeName.includes('-')) {
      const parts = routeName.split('-');
      departure = parts[0].trim();
      destination = parts[1].trim();
    }

    if (departure && destination) {
      // Tìm route
      const { data: route } = await supabase
        .from('routes')
        .select('route_id')
        .eq('departure_point', departure)
        .eq('destination_point', destination)
        .eq('is_deleted', false)
        .maybeSingle();

      if (route) {
        // Tìm package khớp với giá cước
        const { data: pkg } = await supabase
          .from('packages')
          .select('package_id')
          .eq('route_id', route.route_id)
          .eq('price', bookingData.priceAtBooking || 0)
          .eq('is_deleted', false)
          .maybeSingle();

        if (pkg) {
          packageId = pkg.package_id;
        } else {
          // Fallback: Tìm package đầu tiên của tuyến này
          const { data: fallbackPkg } = await supabase
            .from('packages')
            .select('package_id')
            .eq('route_id', route.route_id)
            .eq('is_deleted', false)
            .limit(1)
            .maybeSingle();
          if (fallbackPkg) {
            packageId = fallbackPkg.package_id;
          }
        }
      }
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
          departure_time: null, // Sẽ được cập nhật sau nếu cần
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
    return {
      success: true,
      data: mapDbToBooking(newBookingRow),
    };
  } catch (error) {
    console.error('Error in addBookingAction:', error);
    return { success: false, error: 'Lỗi hệ thống khi đặt vé.' };
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
