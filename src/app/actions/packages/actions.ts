'use server';

import { getSupabaseServer } from '@/lib/supabase/server';
import { getAdminSession } from '@/lib/helpers/session';
import { mapDbToPackage } from '@/lib/supabase/mappers';
import type { PricePackage } from '@/lib/types';
import { revalidatePath } from 'next/cache';

// Fetch all packages
export async function getPackages(): Promise<PricePackage[]> {
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from('packages')
      .select(`
        package_id,
        vehicle_id,
        route_id,
        package_type,
        price,
        description,
        is_active,
        vehicles ( vehicle_name ),
        routes ( departure_point, destination_point )
      `)
      .eq('is_deleted', false)
      .order('package_id', { ascending: true });

    if (error) {
      console.error('Error fetching packages:', error);
      return [];
    }

    return (data || []).map(mapDbToPackage);
  } catch (error) {
    console.error('Error in getPackages action:', error);
    return [];
  }
}

// Helper to find vehicle_id and route_id from names
async function resolveIdsFromName(supabase: any, vehicleName: string, routeName: string) {
  // 1. Tìm vehicle
  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('vehicle_id')
    .eq('vehicle_name', vehicleName)
    .eq('is_deleted', false)
    .maybeSingle();

  if (!vehicle) {
    throw new Error(`Không tìm thấy dòng xe: ${vehicleName}`);
  }

  // 2. Phân tích tuyến đường và tìm route
  let departure = '';
  let destination = '';
  
  if (routeName.includes('→')) {
    const parts = routeName.split('→');
    departure = parts[0].trim();
    destination = parts[1].trim();
  } else if (routeName.includes('-')) {
    const parts = routeName.split('-');
    departure = parts[0].trim();
    destination = parts[1].trim();
  } else {
    throw new Error(`Định dạng tuyến đường không hợp lệ: ${routeName}`);
  }

  const { data: route } = await supabase
    .from('routes')
    .select('route_id')
    .eq('departure_point', departure)
    .eq('destination_point', destination)
    .eq('is_deleted', false)
    .maybeSingle();

  if (!route) {
    throw new Error(`Không tìm thấy tuyến đường từ "${departure}" đến "${destination}"`);
  }

  return { vehicleId: vehicle.vehicle_id, routeId: route.route_id };
}

// Add package
export async function addPackageAction(
  pkg: Omit<PricePackage, 'id' | 'status'>
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: 'Phiên đăng nhập hết hạn hoặc không hợp lệ.' };
    }

    const supabase = getSupabaseServer();
    let vehicleId: number;
    let routeId: number;

    try {
      const resolved = await resolveIdsFromName(supabase, pkg.vehicleName, pkg.routeName);
      vehicleId = resolved.vehicleId;
      routeId = resolved.routeId;
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi phân giải thông tin xe/tuyến đường.' };
    }

    const { error } = await supabase.from('packages').insert([
      {
        vehicle_id: vehicleId,
        route_id: routeId,
        package_type: pkg.type,
        price: pkg.price,
        description: pkg.description,
        is_active: true,
      },
    ]);

    if (error) {
      console.error('Error adding package:', error);
      return { success: false, error: 'Không thể thêm gói giá cước mới.' };
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error in addPackageAction:', error);
    return { success: false, error: 'Lỗi hệ thống khi thêm gói giá.' };
  }
}

// Update package
export async function updatePackageAction(
  id: number,
  pkg: Omit<PricePackage, 'id'>
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: 'Phiên đăng nhập hết hạn hoặc không hợp lệ.' };
    }

    const supabase = getSupabaseServer();
    let vehicleId: number;
    let routeId: number;

    try {
      const resolved = await resolveIdsFromName(supabase, pkg.vehicleName, pkg.routeName);
      vehicleId = resolved.vehicleId;
      routeId = resolved.routeId;
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi phân giải thông tin xe/tuyến đường.' };
    }

    const { error } = await supabase
      .from('packages')
      .update({
        vehicle_id: vehicleId,
        route_id: routeId,
        package_type: pkg.type,
        price: pkg.price,
        description: pkg.description,
        is_active: pkg.status === 'active',
      })
      .eq('package_id', id);

    if (error) {
      console.error('Error updating package:', error);
      return { success: false, error: 'Không thể cập nhật gói cước.' };
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error in updatePackageAction:', error);
    return { success: false, error: 'Lỗi hệ thống khi cập nhật gói cước.' };
  }
}

// Toggle package status
export async function togglePackageStatusAction(
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
      .from('packages')
      .select('is_active')
      .eq('package_id', id)
      .single();

    if (getError || !current) {
      return { success: false, error: 'Không tìm thấy gói cước.' };
    }

    const { error } = await supabase
      .from('packages')
      .update({ is_active: !current.is_active })
      .eq('package_id', id);

    if (error) {
      console.error('Error toggling package status:', error);
      return { success: false, error: 'Không thể thay đổi trạng thái gói cước.' };
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error in togglePackageStatusAction:', error);
    return { success: false, error: 'Lỗi hệ thống khi đổi trạng thái gói cước.' };
  }
}
