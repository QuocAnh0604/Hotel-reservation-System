# Hotel Reservation - Database và API

## 1. Tổng quan

Backend nằm trong thư mục `BE/`, sử dụng:

- Java 21
- Spring Boot
- PostgreSQL
- Spring Data JPA
- Flyway
- JWT Authentication

Database được cấu hình bằng biến môi trường:

```env
DB_URL=jdbc:postgresql://localhost:5432/hotel_reservation
DB_USERNAME=postgres
DB_PASSWORD=your-password
```

Frontend Next.js mặc định chạy tại:

```text
http://localhost:3000
```

Cấu hình CORS:

```env
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

## 2. Sơ đồ quan hệ

```text
hotel 1 ───────── n room
hotel 1 ───────── n review
guest 1 ───────── n reservation
guest 1 ───────── n review
reservation 1 ─── 0..1 review

hotel + room_type_id + date
        ├── room_type_inventory
        └── room_type_rate
```

## 3. Các bảng database

### `hotel`

Lưu thông tin khách sạn.

| Cột | Kiểu | Mô tả |
|---|---|---|
| `hotel_id` | BIGSERIAL | Khóa chính |
| `name` | VARCHAR(255) | Tên khách sạn |
| `address` | VARCHAR(500) | Địa chỉ |
| `location` | VARCHAR(255) | Khu vực/vị trí |
| `active` | BOOLEAN | Trạng thái hoạt động |
| `created_at` | TIMESTAMP | Thời gian tạo |
| `updated_at` | TIMESTAMP | Thời gian cập nhật |

Khách sạn được xóa mềm bằng cách đặt `active = false`.

### `room`

Lưu các phòng thuộc khách sạn.

| Cột | Kiểu | Mô tả |
|---|---|---|
| `room_id` | BIGSERIAL | Khóa chính |
| `room_type_id` | VARCHAR(100) | Mã loại phòng |
| `floor` | INTEGER | Tầng |
| `number` | VARCHAR(20) | Số phòng |
| `hotel_id` | BIGINT | FK đến `hotel` |
| `name` | VARCHAR(100) | Tên phòng |
| `is_available` | BOOLEAN | Phòng có đang sử dụng được không |
| `active` | BOOLEAN | Trạng thái xóa mềm |

### `guest`

Lưu thông tin khách đặt phòng.

| Cột | Kiểu | Mô tả |
|---|---|---|
| `guest_id` | BIGSERIAL | Khóa chính |
| `first_name` | VARCHAR(100) | Tên |
| `last_name` | VARCHAR(100) | Họ |
| `email` | VARCHAR(255) | Email duy nhất |
| `deleted_at` | TIMESTAMP | Xóa mềm |
| `created_at` | TIMESTAMP | Thời gian tạo |
| `updated_at` | TIMESTAMP | Thời gian cập nhật |

### `app_user`

Lưu tài khoản đăng nhập.

| Cột | Kiểu | Mô tả |
|---|---|---|
| `user_id` | BIGSERIAL | Khóa chính |
| `first_name` | VARCHAR(100) | Tên |
| `last_name` | VARCHAR(100) | Họ |
| `email` | VARCHAR(255) | Email duy nhất |
| `password` | VARCHAR(255) | Mật khẩu BCrypt |
| `role` | VARCHAR(30) | `USER` hoặc `ADMIN` |
| `enabled` | BOOLEAN | Tài khoản đang hoạt động |
| `created_at` | TIMESTAMP | Thời gian tạo |
| `updated_at` | TIMESTAMP | Thời gian cập nhật |

### `refresh_token`

Lưu refresh token theo thiết kế database. Authentication hiện tại đang phát hành JWT stateless.

| Cột | Kiểu | Mô tả |
|---|---|---|
| `token_id` | UUID | Khóa chính |
| `user_id` | BIGINT | FK đến `app_user` |
| `token_hash` | VARCHAR(255) | Hash refresh token |
| `expires_at` | TIMESTAMP | Thời gian hết hạn |
| `revoked` | BOOLEAN | Đã thu hồi hay chưa |
| `created_at` | TIMESTAMP | Thời gian tạo |

### `room_type_rate`

Lưu giá phòng theo khách sạn và ngày.

| Cột | Kiểu | Mô tả |
|---|---|---|
| `hotel_id` | BIGINT | Mã khách sạn |
| `rate_date` | DATE | Ngày áp dụng |
| `rate` | DECIMAL(10,2) | Giá phòng |

Khóa chính kết hợp: `hotel_id`, `rate_date`.

### `room_type_inventory`

Lưu tồn kho phòng theo loại phòng và từng ngày.

| Cột | Kiểu | Mô tả |
|---|---|---|
| `hotel_id` | BIGINT | Mã khách sạn |
| `room_type_id` | VARCHAR(100) | Mã loại phòng |
| `date` | DATE | Ngày tồn kho |
| `total_inventory` | INTEGER | Tổng số phòng |
| `total_reserved` | INTEGER | Số phòng đã đặt |

Khóa chính kết hợp: `hotel_id`, `room_type_id`, `date`.

Số phòng còn lại:

```text
available = total_inventory - total_reserved
```

### `reservation`

Lưu thông tin đặt phòng.

| Cột | Kiểu | Mô tả |
|---|---|---|
| `reservation_id` | BIGSERIAL | Khóa chính |
| `hotel_id` | BIGINT | Mã khách sạn |
| `room_type_id` | VARCHAR(100) | Mã loại phòng |
| `room_count` | INTEGER | Số lượng phòng |
| `start_date` | DATE | Ngày nhận phòng |
| `end_date` | DATE | Ngày trả phòng |
| `status` | VARCHAR(20) | Trạng thái đặt phòng |
| `guest_id` | BIGINT | Mã khách |
| `total_amount` | DECIMAL(10,2) | Tổng tiền |
| `created_at` | TIMESTAMP | Thời gian tạo |
| `updated_at` | TIMESTAMP | Thời gian cập nhật |

Các trạng thái:

```text
PENDING -> CONFIRMED -> CHECKED_IN -> CHECKED_OUT
PENDING -> CANCELLED
CONFIRMED -> CANCELLED
CHECKED_IN -> CANCELLED
```

### `review`

Lưu đánh giá khách sạn và loại phòng.

| Cột | Kiểu | Mô tả |
|---|---|---|
| `review_id` | BIGSERIAL | Khóa chính |
| `hotel_id` | BIGINT | FK đến `hotel` |
| `room_type_id` | VARCHAR(100) | Loại phòng được đánh giá |
| `guest_id` | BIGINT | FK đến `guest` |
| `reservation_id` | BIGINT | Reservation được review, duy nhất |
| `rating` | SMALLINT | Điểm từ 1 đến 5 |
| `comment` | VARCHAR(2000) | Nội dung review |
| `created_at` | TIMESTAMP | Thời gian tạo |
| `updated_at` | TIMESTAMP | Thời gian cập nhật |

Chỉ reservation có trạng thái `CHECKED_OUT` mới được tạo review.

## 4. Flyway migration

| Version | Nội dung |
|---|---|
| V1 | Tạo `hotel`, `room` |
| V2 | Tạo `guest` |
| V3 | Tạo `room_type_rate` |
| V4 | Tạo `room_type_inventory`, `reservation` |
| V5 | Tạo `app_user` |
| V6 | Tạo `refresh_token` |
| V7 | Ràng buộc không đặt vượt tồn kho |
| V8 | Thêm `room_count` vào reservation |
| V9 | Xóa cột optimistic locking cũ |
| V10 | Tạo `review` |

## 5. Authentication API

### Đăng ký

```http
POST /auth/register
```

```json
{
  "firstName": "An",
  "lastName": "Nguyen",
  "email": "an@example.com",
  "password": "password123"
}
```

### Đăng nhập

```http
POST /auth/login
```

```json
{
  "email": "an@example.com",
  "password": "password123"
}
```

Response gồm:

```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>",
  "tokenType": "Bearer",
  "user": {
    "userId": 1,
    "firstName": "An",
    "lastName": "Nguyen",
    "email": "an@example.com",
    "role": "USER"
  }
}
```

Các endpoint khác:

```http
POST /auth/refresh
GET  /auth/me
POST /auth/logout
```

## 6. Hotel và room API

### Hotel

```http
GET    /hotels
GET    /hotels/{hotelId}
POST   /hotels                         # ADMIN
PUT    /hotels/{hotelId}               # ADMIN
DELETE /hotels/{hotelId}               # ADMIN
```

Query hỗ trợ cho danh sách:

```http
GET /hotels?location=Da%20Nang&page=0&size=10
```

### Room

```http
GET    /hotels/{hotelId}/rooms
GET    /hotels/{hotelId}/rooms/{roomId}
POST   /hotels/{hotelId}/rooms                    # ADMIN
PUT    /hotels/{hotelId}/rooms/{roomId}           # ADMIN
PATCH  /hotels/{hotelId}/rooms/{roomId}/availability # ADMIN
DELETE /hotels/{hotelId}/rooms/{roomId}            # ADMIN
```

Query room:

```http
GET /hotels/{hotelId}/rooms?roomTypeId=DELUXE&floor=3&isAvailable=true
```

## 7. Availability và rate API

```http
GET /hotels/{hotelId}/room-types/{roomTypeId}/availability?from=2026-11-01&to=2026-11-03
GET /internal/hotels/{hotelId}/rates/quote?checkin=2026-11-01&checkout=2026-11-03
GET /hotels/{hotelId}/rates?from=2026-11-01&to=2026-11-03
```

Admin quản lý giá:

```http
POST   /hotels/{hotelId}/rates
PUT    /hotels/{hotelId}/rates/{date}
POST   /hotels/{hotelId}/rates/bulk
DELETE /hotels/{hotelId}/rates/{date}
```

## 8. Reservation API

```http
POST  /reservations
GET   /reservations/{reservationId}
GET   /reservations?guestId={guestId}
PATCH /reservations/{reservationId}/cancel
PATCH /reservations/{reservationId}/status
```

Tạo reservation:

```json
{
  "hotelId": 1,
  "roomTypeId": "DELUXE",
  "roomCount": 1,
  "startDate": "2026-11-01",
  "endDate": "2026-11-03",
  "guestId": 1
}
```

Admin xác nhận reservation:

```http
PATCH /reservations/{reservationId}/status
```

```json
{
  "status": "CONFIRMED"
}
```

## 9. Review API

```http
POST   /hotels/{hotelId}/reviews
GET    /hotels/{hotelId}/reviews
GET    /hotels/{hotelId}/reviews/summary
GET    /guests/{guestId}/reviews
GET    /reviews/{reviewId}
PUT    /reviews/{reviewId}
DELETE /reviews/{reviewId}
```

Tạo review:

```json
{
  "guestId": 1,
  "reservationId": 100,
  "roomTypeId": "DELUXE",
  "rating": 5,
  "comment": "Phòng sạch và nhân viên thân thiện."
}
```

## 10. Guest API

```http
POST   /guests
GET    /guests/{guestId}
GET    /guests?email=an@example.com
PUT    /guests/{guestId}
DELETE /guests/{guestId}
```

## 11. Quyền frontend

### USER

- Xem khách sạn và phòng.
- Đặt phòng.
- Xem reservation của mình.
- Hủy reservation của mình.
- Tạo review sau khi `CHECKED_OUT`.

### ADMIN

- Quản lý khách sạn và phòng.
- Quản lý giá phòng.
- Xem reservation.
- Xác nhận reservation bằng PATCH status.
- Check-in, check-out và hủy reservation.
- Quản lý review.

## 12. Mã lỗi thường gặp

| HTTP | Ý nghĩa |
|---|---|
| 400 | Dữ liệu request hoặc trạng thái không hợp lệ |
| 401 | Chưa đăng nhập hoặc token hết hạn |
| 403 | Không có quyền |
| 404 | Không tìm thấy dữ liệu |
| 409 | Trùng dữ liệu hoặc hết phòng |
| 503 | Service phụ thuộc không khả dụng |

