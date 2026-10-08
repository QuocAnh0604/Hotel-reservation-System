# Rate Service

## 1. Trách nhiệm (Responsibility)
Quản lý giá phòng theo ngày cho từng khách sạn. Đây là domain duy nhất được phép ghi/đọc bảng giá. Reservation Service khi tạo booking sẽ gọi sang Rate Service (qua API, không join DB) để lấy giá tại thời điểm đặt.

## 2. Data Model

### Bảng `room_type_rate`
| Field    | Type          | Constraint |
|----------|---------------|------------|
| hotel_id | UUID / BIGINT | PK (composite) |
| date     | DATE          | PK (composite) |
| rate     | DECIMAL(10,2) | NOT NULL, giá cho ngày đó |

> Ghi chú: theo sơ đồ gốc, `room_type_rate` chỉ có key là `(hotel_id, date)`. Nếu hệ thống cần giá khác nhau theo từng `room_type_id` (thực tế hay gặp), nên mở rộng PK thành `(hotel_id, room_type_id, date)`. Mặc định code theo đúng sơ đồ; để lại comment TODO cho việc mở rộng này.

## 3. API Endpoints (REST)

```
POST   /hotels/{hotel_id}/rates                     - Tạo/khởi tạo giá cho 1 ngày
GET    /hotels/{hotel_id}/rates?from=&to=            - Lấy giá theo khoảng ngày
GET    /hotels/{hotel_id}/rates/{date}               - Lấy giá 1 ngày cụ thể
PUT    /hotels/{hotel_id}/rates/{date}               - Cập nhật giá 1 ngày
POST   /hotels/{hotel_id}/rates/bulk                 - Set giá hàng loạt (VD: set giá cuối tuần, mùa cao điểm)
DELETE /hotels/{hotel_id}/rates/{date}                - Xoá giá 1 ngày (fallback về giá mặc định)
```

### Request/Response mẫu
```json
// POST /hotels/h-001/rates
{ "date": "2026-09-01", "rate": 1200000 }
```

```json
// GET /hotels/h-001/rates?from=2026-09-01&to=2026-09-03
[
  { "hotel_id": "h-001", "date": "2026-09-01", "rate": 1200000 },
  { "hotel_id": "h-001", "date": "2026-09-02", "rate": 1200000 },
  { "hotel_id": "h-001", "date": "2026-09-03", "rate": 1500000 }
]
```

```json
// POST /hotels/h-001/rates/bulk
{
  "dates": ["2026-12-31", "2027-01-01"],
  "rate": 3000000
}
```

## 4. Business Rules
- `rate` phải > 0.
- Nếu tra giá cho ngày chưa có bản ghi, service trả về giá mặc định (default rate) hoặc lỗi 404 tuỳ config — **cần đề xuất field `default_rate` ở mức hotel** để tránh thiếu dữ liệu (đề xuất bổ sung, không có trong sơ đồ gốc).
- Set giá cho ngày trong quá khứ: chặn hoặc cảnh báo (tuỳ business, mặc định: chặn với lỗi 400 "cannot set rate for past date").
- Bulk update phải chạy trong 1 transaction (all-or-nothing).

## 5. API nội bộ dùng cho Reservation Service
```
GET /internal/hotels/{hotel_id}/rates/quote?checkin=&checkout=
```
Trả về tổng giá cho cả khoảng lưu trú (dùng khi Reservation Service tạo booking):
```json
{
  "hotel_id": "h-001",
  "checkin": "2026-09-01",
  "checkout": "2026-09-03",
  "nights": 2,
  "total_rate": 2400000,
  "daily_breakdown": [
    { "date": "2026-09-01", "rate": 1200000 },
    { "date": "2026-09-02", "rate": 1200000 }
  ]
}
```

## 6. Cấu trúc thư mục đề xuất (map theo `domain/rate`)
```
domain/rate/
  ├── entity/
  │     └── room_type_rate.go
  ├── repository/
  │     └── rate_repository.go
  ├── service/
  │     └── rate_service.go
  ├── handler/
  │     └── rate_handler.go
  └── dto/
        └── rate_dto.go
```

## 7. Việc cần Codex làm
1. Sinh entity `RoomTypeRate` với composite key `(hotel_id, date)`.
2. Sinh repository (CRUD + query theo range ngày + bulk upsert).
3. Sinh service layer với business rules mục 4, và hàm `GetQuote(hotelId, checkin, checkout)` tổng hợp giá.
4. Sinh REST handler public (mục 3) và endpoint nội bộ (mục 5).
5. Unit test: set giá quá khứ bị chặn, quote đúng tổng số đêm, bulk update transaction rollback khi 1 ngày lỗi.
6. Migration SQL tạo bảng `room_type_rate` với composite PK, index theo `hotel_id`.
