'use server';

import { getSupabaseServer } from '@/lib/supabase/server';
import { getAdminSession } from '@/lib/helpers/session';
import { mapDbToVehicle } from '@/lib/supabase/mappers';
import type { Vehicle } from '@/lib/types';
import { revalidatePath } from 'next/cache';

// Load vehicles
export async function getVehicles(): Promise<Vehicle[]> {
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('is_deleted', false)
      .order('vehicle_id', { ascending: true });

    if (error) {
      console.error('Error fetching vehicles:', error);
      return [];
    }

    return (data || []).map(mapDbToVehicle);
  } catch (error) {
    console.error('Error in getVehicles action:', error);
    return [];
  }
}

// Add vehicle
export async function addVehicleAction(
  vehicle: Omit<Vehicle, 'id' | 'status'>
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: 'Phiên đăng nhập hết hạn hoặc không hợp lệ.' };
    }

    const supabase = getSupabaseServer();
    const { error } = await supabase.from('vehicles').insert([
      {
        vehicle_name: vehicle.name,
        vehicle_type: vehicle.type,
        seat_count: vehicle.seats,
        license_plate: vehicle.plateNumber,
        description: vehicle.description,
        is_active: true,
      },
    ]);

    if (error) {
      console.error('Error adding vehicle:', error);
      if (error.code === '23505') {
        return { success: false, error: 'Biển số xe đã tồn tại trên hệ thống.' };
      }
      return { success: false, error: 'Không thể thêm xe mới.' };
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error in addVehicleAction:', error);
    return { success: false, error: 'Lỗi hệ thống khi thêm xe.' };
  }
}

// Update vehicle
export async function updateVehicleAction(
  id: number,
  vehicle: Omit<Vehicle, 'id'>
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: 'Phiên đăng nhập hết hạn hoặc không hợp lệ.' };
    }

    const supabase = getSupabaseServer();
    const { error } = await supabase
      .from('vehicles')
      .update({
        vehicle_name: vehicle.name,
        vehicle_type: vehicle.type,
        seat_count: vehicle.seats,
        license_plate: vehicle.plateNumber,
        description: vehicle.description,
        is_active: vehicle.status === 'active',
      })
      .eq('vehicle_id', id);

    if (error) {
      console.error('Error updating vehicle:', error);
      if (error.code === '23505') {
        return { success: false, error: 'Biển số xe đã tồn tại trên hệ thống.' };
      }
      return { success: false, error: 'Không thể cập nhật xe.' };
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error in updateVehicleAction:', error);
    return { success: false, error: 'Lỗi hệ thống khi cập nhật xe.' };
  }
}

// Toggle vehicle status (active/hidden)
export async function toggleVehicleStatusAction(
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
      .from('vehicles')
      .select('is_active')
      .eq('vehicle_id', id)
      .single();

    if (getError || !current) {
      return { success: false, error: 'Không tìm thấy xe.' };
    }

    const { error } = await supabase
      .from('vehicles')
      .update({ is_active: !current.is_active })
      .eq('vehicle_id', id);

    if (error) {
      console.error('Error toggling vehicle status:', error);
      return { success: false, error: 'Không thể thay đổi trạng thái xe.' };
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error in toggleVehicleStatusAction:', error);
    return { success: false, error: 'Lỗi hệ thống khi đổi trạng thái xe.' };
  }
}
