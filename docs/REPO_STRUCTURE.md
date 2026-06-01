# Giải thích cấu trúc repo Nhà xe Bảo Châu

## public/images

Chứa toàn bộ ảnh tĩnh của website.

- `hero`: ảnh banner/hero đầu trang.
- `logo`: logo nhà xe.
- `fleet`: ảnh xe.
- `icons`: icon hotline, Zalo, tuyến đường, địa chỉ.

## src/app

Chứa các trang chính và các hàm xử lý dữ liệu.

### src/app/actions

Chứa logic xử lý dữ liệu phía server.

- `bookings`: tạo đơn đặt vé, tự sinh mã đơn, cập nhật trạng thái đơn, ghi chú nội bộ.
- `vehicles`: thêm, sửa, ẩn xe.
- `routes`: thêm, sửa, ẩn tuyến đường.
- `packages`: thêm, sửa, ẩn gói giá.
- `settings`: cập nhật hotline, Zalo, địa chỉ, giờ làm việc, slogan.
- `auth`: đăng nhập, đăng xuất admin.

### src/app/admin

Khu vực Admin Dashboard.

- `dashboard`: trang tổng quan số đơn mới, đơn chờ, đơn trong tuần/tháng.
- `bookings`: quản lý đơn đặt vé.
  - `new`: danh sách đơn mới gửi/chờ xử lý.
  - `detail`: xem chi tiết đơn.
  - `status`: cập nhật trạng thái đơn: mới gửi, đã xác nhận, hoàn thành, đã huỷ.
- `vehicles`: quản lý xe.
- `routes`: quản lý tuyến đường.
- `packages`: quản lý gói giá.
  - `shared-seat`: giá xe ghép theo chỗ.
  - `private-trip`: giá bao chuyến nguyên xe.
- `settings`: cài đặt thông tin website.
  - `contact`: hotline, Zalo hỗ trợ.
  - `banner`: slogan/câu giới thiệu.
  - `footer`: địa chỉ, giờ làm việc, mạng xã hội.

### src/app/login

Trang đăng nhập admin/nhân viên.

## src/components

Chứa component giao diện tái sử dụng.

### src/components/landing

Component cho Landing Page:

- `header`: logo, hotline, nút đặt vé.
- `hero`: banner, slogan, CTA.
- `vehicles`: danh sách xe đang hoạt động.
- `prices`: bảng giá theo tuyến.
- `booking-form`: form đặt vé.
- `footer`: địa chỉ, hotline, Zalo, giờ hoạt động.

### src/components/admin

Component cho Admin Dashboard:

- `layout`: sidebar, header admin.
- `dashboard`: thẻ thống kê, danh sách đơn mới nhất.
- `bookings`: bảng đơn, lọc đơn, form cập nhật trạng thái, ghi chú nội bộ.
- `vehicles`: bảng xe, form thêm/sửa xe.
- `routes`: bảng tuyến, form thêm/sửa tuyến.
- `packages`: bảng giá, form thêm/sửa gói giá.
- `settings`: form chỉnh hotline, Zalo, địa chỉ, slogan.

### src/components/common

Component dùng chung: button, input, modal, table, pagination, status badge.

## src/lib

Chứa phần dùng chung cho toàn dự án.

- `supabase`: cấu hình kết nối Supabase.
- `helpers`: hàm tạo mã đơn, format tiền, format ngày.
- `validations`: kiểm tra form, số điện thoại, ngày đi, giá.
- `constants`: trạng thái đơn, loại gói giá, role admin.
- `types`: kiểu dữ liệu Booking, Vehicle, Route, Package, Setting, AdminUser.

## src/i18n

Chứa file ngôn ngữ nếu sau này cần đa ngôn ngữ.

## supabase

Chứa database.

- `migrations`: lịch sử tạo/sửa bảng.
- `seed`: dữ liệu mẫu.
- Có thể thêm `schema.sql` để mô tả toàn bộ bảng.

## docs

Chứa tài liệu dự án, hướng dẫn cấu trúc, database, API, user flow.
