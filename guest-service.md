# Guest Service

## 1. Trách nhiệm (Responsibility)
Quản lý thông tin khách hàng (guest) — người thực hiện đặt phòng. Là "source of truth" cho hồ sơ khách hàng. Reservation Service chỉ lưu `guest_id`, không lưu thông tin cá nhân của khách.

## 2. Data Model

### Bảng `guest`
| Field      | Type          | Constraint |
|------------|---------------|------------|
| guest_id   | UUID / BIGINT | PK         |
| first_name | VARCHAR(100)  | NOT NULL   |
| last_name  | VARCHAR(100)  | NOT NULL   |
| email      | VARCHAR(255)  | UNIQUE, NOT NULL |
| created_at | TIMESTAMP     |            |
| updated_at | TIMESTAMP     |            |

## 3. API Endpoints (REST)
```
POST   /guests                  - Tạo hồ sơ khách hàng mới
GET    /guests/{guest_id}       - Lấy thông tin 1 khách hàng
GET    /guests?email=           - Tìm khách hàng theo email
PUT    /guests/{guest_id}       - Cập nhật thông tin khách hàng
DELETE /guests/{guest_id}       - Xoá khách hàng (soft delete)
```

### Request/Response mẫu
```json
// POST /guests
{
  "first_name": "An",
  "last_name": "Nguyen",
  "email": "an.nguyen@example.com"
}
```

```json
// GET /guests/g-001
{
  "guest_id": "g-001",
  "first_name": "An",
  "last_name": "Nguyen",
  "email": "an.nguyen@example.com"
}
```

## 4. Business Rules
- `email` là duy nhất trong toàn hệ thống → khi tạo mới, nếu email đã tồn tại: trả lỗi 409 Conflict.
- Validate format email chuẩn (regex hoặc lib).
- `first_name`, `last_name` không được rỗng.
- Xoá khách hàng: nên là soft delete (thêm cột `deleted_at`), vì Reservation Service có thể vẫn còn tham chiếu `guest_id` trong lịch sử đặt phòng.

## 5. Quan hệ với Auth (nếu có domain `auth` riêng)
Guest Service **không** xử lý authentication/authorization (login, password, token). Nếu hệ thống có domain `auth` riêng (như trong folder structure của bạn), thì:
- `auth` chịu trách nhiệm login/signup, sinh JWT, map `user_id` (auth) ↔ `guest_id` (guest service).
- Guest Service chỉ expose API CRUD hồ sơ, được gọi bởi `auth` sau khi user đăng ký thành công, hoặc bởi Reservation Service khi cần hiển thị thông tin khách.

## 6. Cấu trúc thư mục đề xuất (map theo `domain/guest`)
```
domain/guest/
  ├── entity/
  │     └── guest.go
  ├── repository/
  │     └── guest_repository.go
  ├── service/
  │     └── guest_service.go
  ├── handler/
  │     └── guest_handler.go
  └── dto/
        └── guest_dto.go
```

## 7. Việc cần Codex làm
1. Sinh entity `Guest` theo schema mục 2.
2. Sinh repository CRUD + tìm theo email.
3. Sinh service layer áp dụng business rules mục 4 (check email trùng, validate format).
4. Sinh REST handler theo mục 3.
5. Unit test: tạo trùng email → lỗi 409; validate email sai format → lỗi 400; soft delete không xoá vật lý record.
6. Migration SQL tạo bảng `guest` với unique index trên `email`.
