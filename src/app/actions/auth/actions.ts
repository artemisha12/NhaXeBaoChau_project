'use server';

import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { getSupabaseServer } from '@/lib/supabase/server';
import { signAdminJWT } from '@/lib/helpers/jwt';

export async function loginAdminAction(
  usernameInput: string,
  passwordInput: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseServer();
    const username = usernameInput.trim();

    // 1. Lấy thông tin admin theo username
    const { data: admin, error: fetchError } = await supabase
      .from('admins')
      .select('admin_id, username, password_hash, role, information_id, failed_login_attempts, locked_until, is_active')
      .eq('username', username)
      .eq('is_deleted', false)
      .maybeSingle();

    if (fetchError) {
      console.error('Lỗi truy vấn admin:', fetchError);
      return { success: false, error: 'Lỗi hệ thống. Vui lòng thử lại.' };
    }

    if (!admin) {
      return { success: false, error: 'Sai tên đăng nhập hoặc mật khẩu.' };
    }

    if (!admin.is_active) {
      return { success: false, error: 'Tài khoản đã bị ngưng hoạt động.' };
    }

    // 2. Kiểm tra lockout
    const now = new Date();
    if (admin.locked_until) {
      const lockTime = new Date(admin.locked_until);
      if (now < lockTime) {
        const minutesLeft = Math.ceil((lockTime.getTime() - now.getTime()) / 60000);
        return {
          success: false,
          error: `Tài khoản tạm khóa. Vui lòng thử lại sau ${minutesLeft} phút.`,
        };
      }
      // Hết thời gian khóa, reset
      await supabase
        .from('admins')
        .update({ failed_login_attempts: 0, locked_until: null })
        .eq('admin_id', admin.admin_id);
      admin.failed_login_attempts = 0;
    }

    // 3. Xác thực mật khẩu bằng bcrypt
    const passwordMatch = await bcrypt.compare(passwordInput, admin.password_hash);

    if (passwordMatch) {
      // Thành công — reset failed attempts
      await supabase
        .from('admins')
        .update({ failed_login_attempts: 0, locked_until: null })
        .eq('admin_id', admin.admin_id);

      // Lấy full_name từ admin_information
      let fullName = 'Bảo Châu Admin';
      if (admin.information_id) {
        const { data: info } = await supabase
          .from('admin_information')
          .select('full_name')
          .eq('information_id', admin.information_id)
          .maybeSingle();
        if (info?.full_name) fullName = info.full_name;
      }

      // Tạo JWT và set cookie
      const token = await signAdminJWT({
        adminId: admin.admin_id,
        username: admin.username,
        role: admin.role || 'staff',
        fullName,
      });

      const cookieStore = await cookies();
      cookieStore.set('bc_admin_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 8 * 60 * 60, // 8 tiếng
      });

      return { success: true };
    } else {
      // Sai mật khẩu — tăng failed_login_attempts
      const nextAttempts = (admin.failed_login_attempts || 0) + 1;
      const updateFields: { failed_login_attempts: number; locked_until?: string } = {
        failed_login_attempts: nextAttempts,
      };

      if (nextAttempts >= 5) {
        updateFields.locked_until = new Date(now.getTime() + 15 * 60 * 1000).toISOString();
      }

      await supabase.from('admins').update(updateFields).eq('admin_id', admin.admin_id);

      if (nextAttempts >= 5) {
        return { success: false, error: 'Đăng nhập sai 5 lần liên tiếp. Tài khoản bị khóa 15 phút.' };
      }
      return { success: false, error: `Sai mật khẩu. Bạn còn ${5 - nextAttempts} lần thử.` };
    }
  } catch (error) {
    console.error('Lỗi login action:', error);
    return { success: false, error: 'Đã xảy ra lỗi hệ thống khi đăng nhập.' };
  }
}

export async function changePasswordAction(
  oldPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('bc_admin_session')?.value;
    if (!token) return { success: false, error: 'Chưa đăng nhập.' };

    const { verifyAdminJWT } = await import('@/lib/helpers/jwt');
    const session = await verifyAdminJWT(token);
    if (!session) return { success: false, error: 'Phiên đăng nhập hết hạn.' };

    if (newPassword.length < 8) {
      return { success: false, error: 'Mật khẩu mới phải có ít nhất 8 ký tự.' };
    }

    const supabase = getSupabaseServer();
    const { data: admin, error: fetchErr } = await supabase
      .from('admins')
      .select('admin_id, password_hash')
      .eq('admin_id', session.adminId)
      .single();

    if (fetchErr || !admin) return { success: false, error: 'Không tìm thấy tài khoản.' };

    const bcrypt = (await import('bcryptjs')).default;
    const match = await bcrypt.compare(oldPassword, admin.password_hash);
    if (!match) return { success: false, error: 'Mật khẩu hiện tại không đúng.' };

    const newHash = await bcrypt.hash(newPassword, 12);
    const { error: updateErr } = await supabase
      .from('admins')
      .update({ password_hash: newHash })
      .eq('admin_id', admin.admin_id);

    if (updateErr) return { success: false, error: 'Không thể cập nhật mật khẩu.' };

    return { success: true };
  } catch {
    return { success: false, error: 'Lỗi hệ thống khi đổi mật khẩu.' };
  }
}

export async function logoutAdminAction(): Promise<{ success: boolean }> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('bc_admin_session');
    return { success: true };
  } catch (error) {
    console.error('Lỗi logout action:', error);
    return { success: false };
  }
}

export async function getAdminInfoAction(): Promise<{
  success: boolean;
  admin?: { adminId: number; username: string; role: string; fullName: string };
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('bc_admin_session')?.value;

    if (!token) return { success: false };

    const { verifyAdminJWT } = await import('@/lib/helpers/jwt');
    const admin = await verifyAdminJWT(token);

    if (!admin) return { success: false };

    return {
      success: true,
      admin: {
        adminId: admin.adminId,
        username: admin.username,
        role: admin.role,
        fullName: admin.fullName,
      },
    };
  } catch (error) {
    return { success: false };
  }
}
