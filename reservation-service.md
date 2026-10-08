# Reservation Service

## 1. Trách nhiệm (Responsibility)
Domain trung tâm, xử lý luồng đặt phòng: quản lý tồn kho theo loại phòng/ngày (`room_type_inventory`) và bản ghi đặt phòng (`reservation`). Đây là service điều phối, gọi sang các domain khác qua API:
- **Hotel Service**: verify `hotel_id`, `room_type_id` tồn tại.
- **Rate Service**: lấy giá (quote) để tính tổng tiền tại thời điểm đặt.
- **Guest Service**: verify `guest_id` tồn tại.

## 2. Data Model

### Bảng `room_type_inventory`
| Field           | Type          | Constraint |
|-----------------|---------------|------------|
| hotel_id        | UUID / BIGINT | PK (composite) |
| room_type_id    | UUID / BIGINT | PK (composite) |
| date            | DATE          | PK (composite) |
| total_inventory | INT           | tổng số phòng loại này có trong ngày |
| total_reserved  | INT           | số đã được đặt trong ngày |

> Số phòng còn trống (available) = `total_inventory - total_reserved`, tính runtime, không lưu cột riêng để tránh lệch dữ liệu.

### Bảng `reservation`
| Field        | Type          | Constraint |
|--------------|---------------|------------|
| reservation_id | UUID / BIGINT | PK       |
| hotel_id     | UUID / BIGINT | tham chiếu logic tới Hotel Service (không FK vật lý) |
| room_type_id | UUID / BIGINT | tham chiếu logic tới Hotel Service |
| start_date   | DATE          | NOT NULL |
| end_date     | DATE          | NOT NULL, > start_date |
| status       | ENUM          | `PENDING`, `CONFIRMED`, `CANCELLED`, `CHECKED_IN`, `CHECKED_OUT` |
| guest_id     | UUID / BIGINT | tham chiếu logic tới Guest Service |
| total_amount | DECIMAL(10,2) | tổng tiền (snapshot từ Rate Service tại thời điểm đặt) |
| created_at   | TIMESTAMP     |          |
| updated_at   | TIMESTAMP     |          |

## 3. API Endpoints (REST)

```
POST   /reservations                          - Tạo đặt phòng mới (luồng chính)
GET    /reservations/{reservation_id}         - Chi tiết 1 đặt phòng
GET    /reservations?guest_id=                - Danh sách đặt phòng theo khách hàng
PATCH  /reservations/{reservation_id}/cancel  - Huỷ đặt phòng
PATCH  /reservations/{reservation_id}/status  - Cập nhật trạng thái (check-in/check-out)

GET    /hotels/{hotel_id}/room-types/{room_type_id}/availability?from=&to= - Kiểm tra tồn kho còn trống theo khoảng ngày
```

### Luồng tạo reservation (POST /reservations)
1. Validate input (`hotel_id`, `room_type_id`, `guest_id`, `start_date < end_date`).
2. Gọi Guest Service `GET /guests/{guest_id}` → verify tồn tại.
3. Gọi Hotel Service (verify `hotel_id`/`room_type_id` hợp lệ) — có thể cache/bỏ qua nếu đã trust.
4. Kiểm tra tồn kho: với mỗi ngày trong `[start_date, end_date)`, đảm bảo `total_reserved < total_inventory`.
5. Gọi Rate Service `GET /internal/hotels/{hotel_id}/rates/quote?checkin=&checkout=` → lấy `total_rate`.
6. Trong 1 transaction:
   - Tăng `total_reserved` cho từng ngày trong `room_type_inventory` (optimistic lock hoặc `SELECT ... FOR UPDATE` để tránh overbooking).
   - Insert bản ghi `reservation` với `status = PENDING` (hoặc `CONFIRMED` tuỳ flow thanh toán).
7. Trả về reservation vừa tạo.

### Request/Response mẫu
```json
// POST /reservations
{
  "hotel_id": "h-001",
  "room_type_id": "rt-deluxe-king",
  "start_date": "2026-09-01",
  "end_date": "2026-09-03",
  "guest_id": "g-001"
}
```

```json
// Response
{
  "reservation_id": "res-1001",
  "hotel_id": "h-001",
  "room_type_id": "rt-deluxe-king",
  "start_date": "2026-09-01",
  "end_date": "2026-09-03",
  "status": "CONFIRMED",
  "guest_id": "g-001",
  "total_amount": 2400000
}
```

```json
// GET availability
{
  "hotel_id": "h-001",
  "room_type_id": "rt-deluxe-king",
  "daily_availability": [
    { "date": "2026-09-01", "available": 3 },
    { "date": "2026-09-02", "available": 2 }
  ]
}
```

## 4. Business Rules
- **Chống overbooking**: mọi thao tác tăng `total_reserved` phải nằm trong transaction có khoá (pessimistic lock `SELECT FOR UPDATE`, hoặc optimistic lock với version column). Đây là rule quan trọng nhất của domain này.
- Huỷ reservation (`cancel`): giảm lại `total_reserved` cho các ngày tương ứng, chuyển `status = CANCELLED`. Không cho huỷ nếu đã `CHECKED_OUT`.
- `end_date` phải sau `start_date` ít nhất 1 ngày.
- Không cho đặt ngày trong quá khứ (`start_date >= today`).
- Nếu Rate Service hoặc Hotel Service không phản hồi (timeout) → trả lỗi 503, không tạo reservation (fail-safe, tránh đặt phòng không có giá).
- `total_amount` là snapshot — nếu Rate Service đổi giá sau này, không ảnh hưởng reservation đã tạo.

## 5. Giao tiếp với domain khác (Service Communication)
| Gọi tới | Mục đích | Kiểu gọi |
|---------|----------|----------|
| Guest Service | Verify guest tồn tại | Sync HTTP (REST) |
| Hotel Service | Verify hotel/room_type | Sync HTTP (REST), có thể cache |
| Rate Service | Lấy quote giá | Sync HTTP (REST) |

> Đề xuất: dùng HTTP client có timeout + retry (exponential backoff) khi gọi các service trên. Không dùng DB join trực tiếp.

## 6. Cấu trúc thư mục đề xuất (map theo `domain/reservation`)
```
domain/reservation/
  ├── entity/
  │     ├── reservation.go
  │     └── room_type_inventory.go
  ├── repository/
  │     ├── reservation_repository.go
  │     └── inventory_repository.go
  ├── service/
  │     ├── reservation_service.go   (luồng nghiệp vụ chính, orchestration)
  │     └── inventory_service.go
  ├── client/                        (HTTP client gọi sang service khác)
  │     ├── guest_client.go
  │     ├── hotel_client.go
  │     └── rate_client.go
  ├── handler/
  │     └── reservation_handler.go
  └── dto/
        └── reservation_dto.go
```

## 7. Việc cần Codex làm
1. Sinh entity `Reservation`, `RoomTypeInventory` theo schema mục 2.
2. Sinh HTTP client interface gọi Guest/Hotel/Rate Service (mock được cho unit test).
3. Sinh repository với transaction + lock khi update `total_reserved` (chống overbooking — ưu tiên đúng nhất trong toàn bộ hệ thống).
4. Sinh service layer orchestration theo luồng mục 3, áp dụng business rules mục 4.
5. Sinh REST handler theo endpoint mục 3.
6. Unit test bắt buộc:
   - Overbooking: 2 request đặt đồng thời khi chỉ còn 1 phòng → chỉ 1 request thành công.
   - Huỷ reservation trả lại đúng tồn kho.
   - Rate Service timeout → không tạo reservation, trả lỗi rõ ràng.
7. Migration SQL tạo bảng `room_type_inventory` (composite PK), `reservation` (PK + index theo `guest_id`, `hotel_id`).
