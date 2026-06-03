'use server';

import { getSupabaseServer } from '@/lib/supabase/server';
import { getAdminSession } from '@/lib/helpers/session';
import type { SiteSettings } from '@/context/AdminContext';
import { revalidatePath } from 'next/cache';

// Fetch settings
export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('is_deleted', false)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching site settings:', error);
      return null;
    }

    if (!data) return null;

    return {
      hotline: data.hotline,
      zaloPhone: data.zalo_phone || '',
      officeAddress: data.office_address,
      workingHours: data.working_hours,
      bannerSlogan: data.banner_slogan,
      facebookUrl: data.facebook_url || '',
      zaloOaUrl: data.zalo_oa_url || '',
    };
  } catch (error) {
    console.error('Error in getSiteSettings action:', error);
    return null;
  }
}

// Update settings (Admin only)
export async function updateSiteSettingsAction(
  settings: Partial<SiteSettings>
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: 'Phiên đăng nhập hết hạn hoặc không hợp lệ.' };
    }

    const supabase = getSupabaseServer();

    // Tìm setting hiện tại
    const { data: current } = await supabase
      .from('site_settings')
      .select('setting_id')
      .limit(1)
      .maybeSingle();

    const dbFields = {
      hotline: settings.hotline,
      zalo_phone: settings.zaloPhone,
      office_address: settings.officeAddress,
      working_hours: settings.workingHours,
      banner_slogan: settings.bannerSlogan,
      facebook_url: settings.facebookUrl,
      zalo_oa_url: settings.zaloOaUrl,
    };

    // Loại bỏ undefined fields
    const cleanedFields = Object.fromEntries(
      Object.entries(dbFields).filter(([_, v]) => v !== undefined)
    );

    let error = null;

    if (current) {
      const res = await supabase
        .from('site_settings')
        .update(cleanedFields)
        .eq('setting_id', current.setting_id);
      error = res.error;
    } else {
      const res = await supabase.from('site_settings').insert([cleanedFields]);
      error = res.error;
    }

    if (error) {
      console.error('Error updating site settings:', error);
      return { success: false, error: 'Không thể cập nhật cấu hình website.' };
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error in updateSiteSettingsAction:', error);
    return { success: false, error: 'Lỗi hệ thống khi cập nhật cấu hình.' };
  }
}
