# Auth Service

## 1. Trách nhiệm (Responsibility)
Domain xử lý xác thực (authentication) và phân quyền (authorization) cho toàn hệ thống. Không xử lý business logic đặt phòng/khách sạn/giá — chỉ:
- Đăng ký / đăng nhập tài khoản (user thường và admin/staff).
- Sinh & verify JWT (access token + refresh token).
- Quản lý role (`GUEST`, `ADMIN`, `STAFF`...).
- Cung cấp middleware/guard để các service khác (hoặc chính API Gateway) verify token và check quyền.
- Cung cấp API cho **admin quản lý user** và **xem danh sách reservation** (đóng vai trò lớp bảo vệ + tổng hợp, gọi sang Guest Service / Reservation Service qua HTTP, không lưu dữ liệu của các domain đó).

> Quan hệ với Guest Service: `auth.user_id` là tài khoản đăng nhập (email/password), `guest.guest_id` là hồ sơ khách hàng (tên, email liên hệ). Khi 1 user đăng ký thành công, Auth Service gọi Guest Service tạo `guest` tương ứng và lưu map `user_id ↔ guest_id`.

## 2. Data Model

### Bảng `user`
| Field         | Type          | Constraint |
|---------------|---------------|------------|
| user_id       | UUID / BIGINT | PK         |
| email         | VARCHAR(255)  | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255)  | NOT NULL (bcrypt/argon2) |
| role          | ENUM          | `GUEST`, `STAFF`, `ADMIN` |
| guest_id      | UUID / BIGINT | nullable, tham chiếu logic tới Guest Service (chỉ có với role GUEST) |
| status        | ENUM          | `ACTIVE`, `DISABLED` |
| created_at    | TIMESTAMP     |            |
| updated_at    | TIMESTAMP     |            |

### Bảng `refresh_token`
| Field       | Type          | Constraint |
|-------------|---------------|------------|
| token_id    | UUID          | PK         |
| user_id     | UUID / BIGINT | FK tới `user.user_id` |
| token_hash  | VARCHAR(255)  | NOT NULL, lưu hash không lưu raw token |
| expires_at  | TIMESTAMP     | NOT NULL   |
| revoked     | BOOLEAN       | default false |
| created_at  | TIMESTAMP     |            |

## 3. API Endpoints (REST)

### Auth công khai
```
POST /auth/register           - Đăng ký tài khoản (role mặc định GUEST, tự tạo guest profile)
POST /auth/login              - Đăng nhập, trả về access_token + refresh_token
POST /auth/refresh            - Cấp access_token mới từ refresh_token
POST /auth/logout             - Revoke refresh_token hiện tại
GET  /auth/me                 - Lấy thông tin user đang đăng nhập (từ access_token)
```

### Admin — Quản lý user
```
GET    /admin/users                     - Danh sách user (filter theo role, status, phân trang)
GET    /admin/users/{user_id}           - Chi tiết 1 user
PATCH  /admin/users/{user_id}/role      - Đổi role (VD nâng lên STAFF/ADMIN)
PATCH  /admin/users/{user_id}/status    - Khoá/mở tài khoản (ACTIVE/DISABLED)
POST   /admin/staff                     - Admin tạo tài khoản STAFF/ADMIN mới
```

### Admin — Xem reservation (tổng hợp từ Reservation Service)
```
GET /admin/reservations                 - Danh sách TẤT CẢ reservation (filter hotel_id, status, date range, guest_id, phân trang)
GET /admin/reservations/{reservation_id} - Chi tiết 1 reservation (kèm thông tin guest, hotel nếu cần)
```
> Auth Service **không lưu** dữ liệu reservation. Hai endpoint này chỉ đóng vai trò cổng có kiểm tra quyền `ADMIN`/`STAFF`, sau đó forward/gọi sang API nội bộ của Reservation Service (VD: `GET /internal/reservations?...`) rồi trả kết quả về. Nếu hệ thống dùng API Gateway để route trực tiếp, có thể bỏ bước forward này và chỉ cần Gateway check role trong JWT — tuỳ kiến trúc, xem mục 6.

### Request/Response mẫu
```json
// POST /auth/register
{ "email": "an.nguyen@example.com", "password": "Secret123!", "first_name": "An", "last_name": "Nguyen" }
```

```json
// POST /auth/login response
{
  "access_token": "eyJhbGciOi...",
  "refresh_token": "eyJhbGciOi...",
  "expires_in": 900,
  "user": { "user_id": "u-001", "email": "an.nguyen@example.com", "role": "GUEST" }
}
```

```json
// GET /admin/reservations?status=CONFIRMED&hotel_id=h-001
{
  "data": [
    {
      "reservation_id": "res-1001",
      "hotel_id": "h-001",
      "guest_id": "g-001",
      "status": "CONFIRMED",
      "start_date": "2026-09-01",
      "end_date": "2026-09-03"
    }
  ],
  "page": 1,
  "total": 42
}
```

## 4. Business Rules
- Password: hash bằng bcrypt/argon2, không bao giờ lưu/trả plaintext.
- Access token: JWT, thời hạn ngắn (VD 15 phút), chứa `user_id`, `role`.
- Refresh token: thời hạn dài (VD 7-30 ngày), lưu hash trong DB, cho phép revoke (logout, đổi password → revoke toàn bộ refresh token cũ).
- Đăng ký: email phải unique (409 nếu trùng), tự động gọi Guest Service tạo `guest` record và lưu `guest_id` vào `user`.
- Chỉ role `ADMIN` được: đổi role user khác, khoá/mở tài khoản, tạo tài khoản STAFF/ADMIN.
- Role `STAFF` và `ADMIN` mới được gọi các endpoint `/admin/*`; role `GUEST` gọi sẽ bị 403.
- Khoá tài khoản (`status = DISABLED`): user đó không login được nữa, các token cũ (nếu còn hạn) cũng bị coi là invalid (check status khi verify token, hoặc revoke hết refresh token khi disable).
- Không cho tự đổi role của chính mình (tránh admin tự hạ quyền nhầm) — tuỳ chọn, có thể enforce hoặc bỏ qua nếu không cần.

## 5. Middleware / Guard dùng chung
Cung cấp middleware để các service khác (hoặc chính Auth Service) dùng lại:
```
AuthMiddleware      - verify access_token hợp lệ, gắn user_id + role vào request context
RequireRole(roles)  - chặn nếu role của user không nằm trong danh sách cho phép, VD RequireRole("ADMIN", "STAFF")
```

## 6. Kiến trúc gọi sang Reservation Service
| Gọi tới | Mục đích | Kiểu gọi |
|---------|----------|----------|
| Guest Service | Tạo guest profile khi register | Sync HTTP (REST) |
| Reservation Service | Lấy danh sách/tổng hợp reservation cho admin | Sync HTTP (REST), endpoint nội bộ `/internal/reservations` |

> Lưu ý kiến trúc: nếu dùng API Gateway (như thiết kế gốc của ByteByteGo), có 2 cách làm:
> 1. **Auth Service làm cổng trung gian** (như mục 3 mô tả) — đơn giản để bắt đầu, dễ audit log tập trung ở Auth.
> 2. **Gateway route thẳng tới Reservation Service**, Gateway chỉ verify JWT + role (không qua Auth Service mỗi request) — hiệu năng tốt hơn khi scale, khuyến nghị khi hệ thống lớn.
     > Chọn cách 1 để code trước cho đơn giản, ghi TODO chuyển sang cách 2 sau.

## 7. Cấu trúc thư mục đề xuất (map theo `domain/auth`)
```
domain/auth/
  ├── entity/
  │     ├── user.go
  │     └── refresh_token.go
  ├── repository/
  │     ├── user_repository.go
  │     └── refresh_token_repository.go
  ├── service/
  │     ├── auth_service.go       (register/login/refresh/logout)
  │     └── admin_service.go      (quản lý user, tổng hợp reservation)
  ├── client/
  │     ├── guest_client.go       (gọi Guest Service tạo guest profile)
  │     └── reservation_client.go (gọi Reservation Service lấy danh sách)
  ├── middleware/
  │     ├── auth_middleware.go
  │     └── role_guard.go
  ├── handler/
  │     ├── auth_handler.go
  │     └── admin_handler.go
  └── dto/
        ├── auth_dto.go
        └── admin_dto.go
```

## 8. Việc cần Codex làm
1. Sinh entity `User`, `RefreshToken` theo schema mục 2.
2. Sinh repository CRUD + tìm user theo email, theo role, phân trang.
3. Sinh service `auth_service`: register (kèm gọi Guest Service), login (verify password, sinh JWT), refresh (verify refresh_token hash + hạn), logout (revoke).
4. Sinh middleware `AuthMiddleware` và `RequireRole` dùng JWT chuẩn (VD `jsonwebtoken`/`golang-jwt`).
5. Sinh service `admin_service`: list/update user, gọi Reservation Service lấy danh sách reservation (mục 6).
6. Sinh REST handler theo toàn bộ endpoint mục 3.
7. Unit test bắt buộc:
    - Đăng ký trùng email → 409.
    - Login sai password → 401.
    - Gọi `/admin/*` với role GUEST → 403.
    - Access token hết hạn → 401, dùng refresh_token hợp lệ cấp lại access_token mới.
    - Tài khoản `DISABLED` không login được và token cũ bị từ chối.
8. Migration SQL tạo bảng `user` (unique index `email`), `refresh_token` (index `user_id`).