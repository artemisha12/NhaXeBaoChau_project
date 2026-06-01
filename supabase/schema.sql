-- Bảng thông tin cá nhân của admin
CREATE TABLE admin_information (
    information_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address VARCHAR(255),
    position VARCHAR(50),
    avatar_url TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng tài khoản đăng nhập admin
CREATE TABLE admins (
    admin_id SERIAL PRIMARY KEY,
    information_id INT UNIQUE REFERENCES admin_information(information_id) ON DELETE SET NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) DEFAULT 'staff', -- 'admin', 'staff'
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng phương tiện (xe)
CREATE TABLE vehicles (
    vehicle_id SERIAL PRIMARY KEY,
    vehicle_name VARCHAR(100) NOT NULL,
    license_plate VARCHAR(30) UNIQUE NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL, -- 'Xe ghép cao cấp', 'Xe riêng', etc.
    seat_count INT NOT NULL,
    image_url TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng tuyến đường
CREATE TABLE routes (
    route_id SERIAL PRIMARY KEY,
    departure_point VARCHAR(100) NOT NULL, -- Điểm đi (Huế, Đà Nẵng...)
    destination_point VARCHAR(100) NOT NULL, -- Điểm đến
    distance_km NUMERIC(6, 2),
    estimated_duration VARCHAR(50), -- ví dụ: '2 giờ', '45 phút'
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng gói giá (kết hợp xe + tuyến + loại gói)
CREATE TABLE packages (
    package_id SERIAL PRIMARY KEY,
    vehicle_id INT REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    route_id INT REFERENCES routes(route_id) ON DELETE CASCADE,
    package_type VARCHAR(30) NOT NULL CHECK (package_type IN ('shared-seat', 'private-trip')), -- ghép / bao chuyến
    price DECIMAL(12, 2) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng đơn đặt vé
CREATE TABLE bookings (
    booking_id SERIAL PRIMARY KEY,
    booking_code VARCHAR(50) UNIQUE NOT NULL, -- Mã đơn: BC-YYYYMMDD-XXX
    package_id INT REFERENCES packages(package_id) ON DELETE SET NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(100),
    pickup_address VARCHAR(255) NOT NULL,
    dropoff_address VARCHAR(255) NOT NULL,
    departure_date DATE NOT NULL,
    departure_time TIME,
    passenger_count INT DEFAULT 1,
    price_at_booking DECIMAL(12, 2) NOT NULL, -- Giá lưu tại thời điểm đặt (tránh đổi khi giá gói đổi)
    total_amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'completed', 'cancelled')),
    customer_note TEXT,
    internal_note TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng lịch sử thay đổi trạng thái đơn đặt vé
CREATE TABLE booking_status_history (
    history_id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES bookings(booking_id) ON DELETE CASCADE,
    admin_id INT REFERENCES admins(admin_id) ON DELETE SET NULL,
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    note TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng cấu hình website
CREATE TABLE site_settings (
    setting_id SERIAL PRIMARY KEY,
    hotline VARCHAR(20) NOT NULL,
    zalo_phone VARCHAR(20),
    office_address TEXT NOT NULL,
    working_hours VARCHAR(100) NOT NULL,
    banner_slogan TEXT NOT NULL,
    facebook_url VARCHAR(255),
    zalo_oa_url VARCHAR(255),
    is_deleted BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tạo các chỉ mục tối ưu hóa tìm kiếm
CREATE INDEX idx_bookings_phone ON bookings(customer_phone);
CREATE INDEX idx_bookings_code ON bookings(booking_code);
CREATE INDEX idx_bookings_date ON bookings(departure_date);
CREATE INDEX idx_packages_route_vehicle ON packages(route_id, vehicle_id);
