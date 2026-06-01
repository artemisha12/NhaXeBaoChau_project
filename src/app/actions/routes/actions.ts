'use server';

import { getSupabaseServer } from '@/lib/supabase/server';
import { getAdminSession } from '@/lib/helpers/session';
import { mapDbToRoute } from '@/lib/supabase/mappers';
import type { RouteItem } from '@/lib/types';
import { revalidatePath } from 'next/cache';

// Fetch all routes
export async function getRoutes(): Promise<RouteItem[]> {
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('is_deleted', false)
      .order('route_id', { ascending: true });

    if (error) {
      console.error('Error fetching routes:', error);
      return [];
    }

    return (data || []).map(mapDbToRoute);
  } catch (error) {
    console.error('Error in getRoutes action:', error);
    return [];
  }
}

// Add route
export async function addRouteAction(
  route: Omit<RouteItem, 'id' | 'status'>
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: 'Phiên đăng nhập hết hạn hoặc không hợp lệ.' };
    }

    const supabase = getSupabaseServer();
    const { error } = await supabase.from('routes').insert([
      {
        departure_point: route.from,
        destination_point: route.to,
        distance_km: route.distanceKm,
        estimated_duration: route.duration,
        is_active: true,
      },
    ]);

    if (error) {
      console.error('Error adding route:', error);
      return { success: false, error: 'Không thể thêm tuyến đường mới.' };
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error in addRouteAction:', error);
    return { success: false, error: 'Lỗi hệ thống khi thêm tuyến đường.' };
  }
}

// Update route
export async function updateRouteAction(
  id: number,
  route: Omit<RouteItem, 'id'>
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: 'Phiên đăng nhập hết hạn hoặc không hợp lệ.' };
    }

    const supabase = getSupabaseServer();
    const { error } = await supabase
      .from('routes')
      .update({
        departure_point: route.from,
        destination_point: route.to,
        distance_km: route.distanceKm,
        estimated_duration: route.duration,
        is_active: route.status === 'active',
      })
      .eq('route_id', id);

    if (error) {
      console.error('Error updating route:', error);
      return { success: false, error: 'Không thể cập nhật tuyến đường.' };
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error in updateRouteAction:', error);
    return { success: false, error: 'Lỗi hệ thống khi cập nhật tuyến đường.' };
  }
}

// Toggle route status
export async function toggleRouteStatusAction(
  id: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: 'Phiên đăng nhập hết hạn hoặc không hợp lệ.' };
    }

    const supabase = getSupabaseServer();
    
    // Lấy status hiện tại
    const { data: current, error: getError } = await supabase
      .from('routes')
      .select('is_active')
      .eq('route_id', id)
      .single();

    if (getError || !current) {
      return { success: false, error: 'Không tìm thấy tuyến đường.' };
    }

    const { error } = await supabase
      .from('routes')
      .update({ is_active: !current.is_active })
      .eq('route_id', id);

    if (error) {
      console.error('Error toggling route status:', error);
      return { success: false, error: 'Không thể thay đổi trạng thái tuyến đường.' };
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error in toggleRouteStatusAction:', error);
    return { success: false, error: 'Lỗi hệ thống khi đổi trạng thái tuyến đường.' };
  }
}
