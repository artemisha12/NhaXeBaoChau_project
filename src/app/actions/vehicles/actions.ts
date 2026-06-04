'use server';

import { getSupabaseServer } from '@/lib/supabase/server';
import { getAdminSession } from '@/lib/helpers/session';
import { mapDbToVehicle } from '@/lib/supabase/mappers';
import type { Vehicle } from '@/lib/types';
import { revalidatePath } from 'next/cache';

const STORAGE_BUCKET = 'Image Car';

// Upload ảnh xe lên Supabase Storage, trả về public URL
export async function uploadVehicleImageAction(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const session = await getAdminSession();
    if (!session) return { success: false, error: 'Chưa đăng nhập.' };

    const file = formData.get('file') as File;
    if (!file) return { success: false, error: 'Không có file.' };

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `vehicles/${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const supabase = getSupabaseServer();
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return { success: false, error: 'Không thể upload ảnh: ' + error.message };
    }

    // Dùng Supabase SDK để lấy public URL chuẩn (tránh lỗi encode)
    const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);
    const publicUrl = urlData.publicUrl;
    return { success: true, url: publicUrl };
  } catch (err: any) {
    console.error('uploadVehicleImageAction error:', err);
    return { success: false, error: 'Lỗi hệ thống khi upload ảnh.' };
  }
}

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
        image_url: vehicle.imageUrl || null,
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
        image_url: vehicle.imageUrl || null,
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

// Soft-delete xe + toàn bộ gói giá của xe đó
export async function deleteVehicleAction(
  id: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: 'Phiên đăng nhập hết hạn hoặc không hợp lệ.' };
    }

    const supabase = getSupabaseServer();

    // 1. Soft-delete tất cả packages của xe này
    const { error: pkgError } = await supabase
      .from('packages')
      .update({ is_deleted: true, is_active: false })
      .eq('vehicle_id', id);

    if (pkgError) {
      console.error('Error deleting packages:', pkgError);
      return { success: false, error: 'Không thể xóa gói giá của xe.' };
    }

    // 2. Soft-delete xe
    const { error: vehError } = await supabase
      .from('vehicles')
      .update({ is_deleted: true, is_active: false })
      .eq('vehicle_id', id);

    if (vehError) {
      console.error('Error deleting vehicle:', vehError);
      return { success: false, error: 'Không thể xóa xe.' };
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error in deleteVehicleAction:', error);
    return { success: false, error: 'Lỗi hệ thống khi xóa xe.' };
  }
}
