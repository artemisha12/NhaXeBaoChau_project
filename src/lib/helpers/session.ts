import { cookies } from 'next/headers';
import { verifyAdminJWT } from './jwt';

export async function getAdminSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('bc_admin_session')?.value;

    if (!token) return null;

    return await verifyAdminJWT(token);
  } catch (error) {
    return null;
  }
}
