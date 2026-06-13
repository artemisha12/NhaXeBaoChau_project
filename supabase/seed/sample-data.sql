-- ==========================================
-- Dữ liệu mẫu (Seed Data) cho nhà xe Bảo Châu
-- ==========================================

-- 1. Thêm thông tin cá nhân của admin
INSERT INTO admin_information (information_id, full_name, phone, email, address, position)
VALUES (1, 'Bảo Châu Admin', '0905123456', 'admin@nhaxebaochau.com', 'Huế', 'Quản trị viên')
ON CONFLICT (information_id) DO NOTHING;

-- 2. Thêm tài khoản đăng nhập admin (mật khẩu mặc định: BaoChau@2026)
INSERT INTO admins (admin_id, information_id, username, password_hash, role)
VALUES (1, 1, 'admin', '$2b$10$HcfFOXE9XYnfntr7BILvueDUbjU4uIQShNldEXa45JdEVq0lVstS6', 'admin')
ON CONFLICT (admin_id) DO NOTHING;

-- 3. Thêm cấu hình website mặc định
INSERT INTO site_settings (setting_id, hotline, zalo_phone, office_address, working_hours, banner_slogan, facebook_url, zalo_oa_url)
VALUES (1, '0767 375 375', '0767 375 375', 'Huế - Đà Nẵng - Hội An', '06:00 - 22:00', 'An toàn - Tiện lợi - Đúng giờ trên mọi hành trình.', 'https://facebook.com/nhaxebaochau', 'https://zalo.me/nhaxebaochau')
ON CONFLICT (setting_id) DO NOTHING;
