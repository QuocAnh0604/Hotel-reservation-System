# Database documentation

## Tổng quan

Dự án sử dụng PostgreSQL làm cơ sở dữ liệu quan hệ. Schema được quản lý bằng
[Flyway](https://flywaydb.org/) trong thư mục
`src/main/resources/db/migration` và được tạo theo thứ tự từ `V1` đến `V6`.

Hibernate chỉ kiểm tra schema hiện có (`ddl-auto=validate`); ứng dụng không tự
động tạo hoặc cập nhật bảng.

## Cấu hình kết nối

Các biến môi trường được đọc từ file `.env` hoặc môi trường triển khai:

| Biến | Mô tả |
|---|---|
| `DB_URL` | JDBC URL của PostgreSQL |
| `DB_USERNAME` | Tên người dùng database |
| `DB_PASSWORD` | Mật khẩu database |

Ví dụ:

```properties
DB_URL=jdbc:postgresql://localhost:5432/hotel_reservation
DB_USERNAME=postgres
DB_PASSWORD=your-password
```

Không commit thông tin xác thực thật vào repository.

## Mô hình quan hệ

```text
hotel 1 ──── n room
app_user 1 ──── n refresh_token

room_type_rate       (hotel_id, rate_date)
room_type_inventory  (hotel_id, room_type_id, date)
reservation          (guest_id, hotel_id, room_type_id)
```

`room_type_id` là mã loại phòng dùng để liên kết logic giữa các module. Các
cột `hotel_id` và `guest_id` trong một số bảng nghiệp vụ hiện được liên kết ở
tầng service, không phải tất cả đều có foreign key vật lý trong database.

## Các bảng

### `hotel`

Lưu thông tin khách sạn.

| Cột | Kiểu | Ràng buộc / ý nghĩa |
|---|---|---|
| `hotel_id` | `BIGSERIAL` | Khóa chính |
| `name` | `VARCHAR(255)` | Tên khách sạn, bắt buộc |
| `address` | `VARCHAR(500)` | Địa chỉ, bắt buộc |
| `location` | `VARCHAR(255)` | Vị trí, tùy chọn |
| `active` | `BOOLEAN` | Mặc định `TRUE` |
| `created_at` | `TIMESTAMP` | Mặc định thời điểm tạo |
| `updated_at` | `TIMESTAMP` | Mặc định thời điểm cập nhật |

### `room`

Lưu các phòng thuộc khách sạn.

| Cột | Kiểu | Ràng buộc / ý nghĩa |
|---|---|---|
| `room_id` | `BIGSERIAL` | Khóa chính |
| `room_type_id` | `VARCHAR(100)` | Mã loại phòng |
| `floor` | `INTEGER` | Tầng, tùy chọn |
| `number` | `VARCHAR(20)` | Số phòng, bắt buộc |
| `hotel_id` | `BIGINT` | FK đến `hotel.hotel_id` |
| `name` | `VARCHAR(100)` | Tên phòng, bắt buộc |
| `is_available` | `BOOLEAN` | Mặc định `TRUE` |
| `active` | `BOOLEAN` | Mặc định `TRUE` |

Index: `idx_room_hotel_id`, `idx_room_type_id`.

### `guest`

Lưu thông tin khách đặt phòng.

| Cột | Kiểu | Ràng buộc / ý nghĩa |
|---|---|---|
| `guest_id` | `BIGSERIAL` | Khóa chính |
| `first_name` | `VARCHAR(100)` | Tên, bắt buộc |
| `last_name` | `VARCHAR(100)` | Họ, bắt buộc |
| `email` | `VARCHAR(255)` | Email, bắt buộc |
| `deleted_at` | `TIMESTAMP` | Thời điểm xóa mềm |
| `created_at` | `TIMESTAMP` | Mặc định thời điểm tạo |
| `updated_at` | `TIMESTAMP` | Mặc định thời điểm cập nhật |

Email được duy nhất không phân biệt hoa thường qua index
`uq_guest_email` trên `LOWER(email)`.

### `room_type_rate`

Lưu giá của khách sạn theo ngày.

| Cột | Kiểu | Ràng buộc / ý nghĩa |
|---|---|---|
| `hotel_id` | `BIGINT` | Mã khách sạn |
| `rate_date` | `DATE` | Ngày áp dụng giá |
| `rate` | `DECIMAL(10,2)` | Giá, phải lớn hơn `0` |

Khóa chính kết hợp: (`hotel_id`, `rate_date`). Có index
`idx_room_type_rate_hotel_id`.

### `room_type_inventory`

Lưu tổng số phòng và số phòng đã đặt theo khách sạn, loại phòng và ngày.

| Cột | Kiểu | Ràng buộc / ý nghĩa |
|---|---|---|
| `hotel_id` | `BIGINT` | Mã khách sạn |
| `room_type_id` | `VARCHAR(100)` | Mã loại phòng |
| `date` | `DATE` | Ngày tồn kho |
| `total_inventory` | `INT` | Tổng tồn kho, không âm |
| `total_reserved` | `INT` | Đã đặt, mặc định `0`, không âm |
| `version` | `BIGINT` | Version phục vụ optimistic locking, mặc định `0` |

Khóa chính kết hợp: (`hotel_id`, `room_type_id`, `date`).

### `reservation`

Lưu thông tin đặt phòng.

| Cột | Kiểu | Ràng buộc / ý nghĩa |
|---|---|---|
| `reservation_id` | `BIGSERIAL` | Khóa chính |
| `hotel_id` | `BIGINT` | Mã khách sạn |
| `room_type_id` | `VARCHAR(100)` | Mã loại phòng |
| `start_date` | `DATE` | Ngày nhận phòng |
| `end_date` | `DATE` | Ngày trả phòng; phải sau `start_date` |
| `status` | `VARCHAR(20)` | Trạng thái đặt phòng |
| `guest_id` | `BIGINT` | Mã khách |
| `total_amount` | `DECIMAL(10,2)` | Tổng tiền |
| `created_at` | `TIMESTAMP` | Mặc định thời điểm tạo |
| `updated_at` | `TIMESTAMP` | Mặc định thời điểm cập nhật |

Index: `idx_reservation_guest_id`, `idx_reservation_hotel_id`.

### `app_user`

Lưu tài khoản đăng nhập và phân quyền.

| Cột | Kiểu | Ràng buộc / ý nghĩa |
|---|---|---|
| `user_id` | `BIGSERIAL` | Khóa chính |
| `first_name` | `VARCHAR(100)` | Tên, bắt buộc |
| `last_name` | `VARCHAR(100)` | Họ, bắt buộc |
| `email` | `VARCHAR(255)` | Duy nhất |
| `password` | `VARCHAR(255)` | Mật khẩu đã mã hóa |
| `role` | `VARCHAR(30)` | Mặc định `USER` |
| `enabled` | `BOOLEAN` | Mặc định `TRUE` |

### `refresh_token`

Lưu refresh token phục vụ xác thực phiên đăng nhập.

| Cột | Kiểu | Ràng buộc / ý nghĩa |
|---|---|---|
| `token_id` | `UUID` | Khóa chính |
| `user_id` | `BIGINT` | FK đến `app_user.user_id`, xóa dây chuyền |
| `token_hash` | `VARCHAR(255)` | Hash của refresh token |
| `expires_at` | `TIMESTAMP` | Thời điểm hết hạn |
| `revoked` | `BOOLEAN` | Mặc định `FALSE` |
| `created_at` | `TIMESTAMP` | Mặc định thời điểm tạo |

Index: `idx_refresh_token_user_id`, `idx_refresh_token_expires_at`.

## Migration

| Version | File | Nội dung |
|---|---|---|
| V1 | `V1__create_hotel_room.sql` | Tạo `hotel`, `room` |
| V2 | `V2__create_guest.sql` | Tạo `guest` |
| V3 | `V3__create_room_type_rate.sql` | Tạo `room_type_rate` |
| V4 | `V4__create_reservation.sql` | Tạo `room_type_inventory`, `reservation` |
| V5 | `V5__create_app_user.sql` | Tạo `app_user` |
| V6 | `V6__create_refresh_token.sql` | Tạo `refresh_token` |

Khi thêm thay đổi schema, tạo migration mới với version tăng dần, không sửa
các migration đã chạy trên môi trường dùng chung.
