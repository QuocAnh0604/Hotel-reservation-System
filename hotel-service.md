# Hotel Service

## 1. Trách nhiệm (Responsibility)
Quản lý thông tin khách sạn (hotel) và phòng (room) vật lý. Đây là domain "nguồn sự thật" (source of truth) cho:
- Danh sách khách sạn, địa chỉ, vị trí.
- Danh sách phòng thuộc từng khách sạn, loại phòng, tầng, số phòng, trạng thái khả dụng.

Domain này **không** biết gì về giá (Rate Service), đặt phòng (Reservation Service) hay khách hàng (Guest Service). Các domain khác chỉ được tham chiếu tới `hotel_id` / `room_type_id`, không được join trực tiếp vào DB của Hotel Service.

## 2. Data Model

### Bảng `hotel`
| Field      | Type         | Constraint |
|------------|--------------|------------|
| hotel_id   | UUID / BIGINT| PK         |
| name       | VARCHAR(255) | NOT NULL   |
| address    | VARCHAR(500) | NOT NULL   |
| location   | VARCHAR(255) | (lat,long hoặc geohash) |
| created_at | TIMESTAMP    |            |
| updated_at | TIMESTAMP    |            |

### Bảng `room`
| Field        | Type          | Constraint |
|--------------|---------------|------------|
| room_id      | UUID / BIGINT | PK         |
| room_type_id | UUID / BIGINT | FK logic tới Rate/Reservation service (chỉ lưu id, không join) |
| floor        | INT           |            |
| number       | VARCHAR(20)   | số phòng, ví dụ "1203" |
| hotel_id     | UUID / BIGINT | FK tới `hotel.hotel_id` (cùng service) |
| name         | VARCHAR(100)  | tên hiển thị, VD "Deluxe King 1203" |
| is_available | BOOLEAN       | trạng thái phòng có thể xếp khách hay không (maintenance, out of order...) |

> Lưu ý: `is_available` ở đây là trạng thái **vật lý** của phòng (đang sửa chữa, dọn dẹp...), khác với tồn kho theo ngày (`room_type_inventory` thuộc Reservation Service).

## 3. API Endpoints (REST)

### Hotel
```
POST   /hotels                  - Tạo khách sạn mới
GET    /hotels/{hotel_id}       - Lấy thông tin 1 khách sạn
GET    /hotels                  - Danh sách khách sạn (filter theo location, phân trang)
PUT    /hotels/{hotel_id}       - Cập nhật thông tin khách sạn
DELETE /hotels/{hotel_id}       - Xoá khách sạn (soft delete khuyến nghị)
```

### Room
```
POST   /hotels/{hotel_id}/rooms             - Thêm phòng vào khách sạn
GET    /hotels/{hotel_id}/rooms             - Danh sách phòng của khách sạn (filter room_type_id, floor, is_available)
GET    /hotels/{hotel_id}/rooms/{room_id}   - Chi tiết 1 phòng
PUT    /hotels/{hotel_id}/rooms/{room_id}   - Cập nhật phòng
PATCH  /hotels/{hotel_id}/rooms/{room_id}/availability - Cập nhật is_available
DELETE /hotels/{hotel_id}/rooms/{room_id}   - Xoá phòng
```

### Response mẫu
```json
// GET /hotels/{hotel_id}
{
  "hotel_id": "h-001",
  "name": "Grand Hanoi Hotel",
  "address": "123 Tran Hung Dao, Hoan Kiem, Ha Noi",
  "location": "21.0245,105.8412"
}
```

```json
// GET /hotels/{hotel_id}/rooms/{room_id}
{
  "room_id": "r-1203",
  "room_type_id": "rt-deluxe-king",
  "floor": 12,
  "number": "1203",
  "hotel_id": "h-001",
  "name": "Deluxe King 1203",
  "is_available": true
}
```

## 4. Business Rules
- `hotel_id` là bất biến sau khi tạo.
- Không cho xoá khách sạn nếu vẫn còn phòng active (trả lỗi 409, yêu cầu xoá/deactivate hết phòng trước).
- `room.hotel_id` không được thay đổi sau khi tạo (nếu cần đổi khách sạn, phải tạo phòng mới).
- Validate `room_type_id` chỉ ở mức format (không gọi sang service khác để verify — tránh coupling đồng bộ).

## 5. Cấu trúc thư mục đề xuất (map theo `domain/hotel`)
```
domain/hotel/
  ├── entity/
  │     ├── hotel.go (hoặc .ts/.py tuỳ stack)
  │     └── room.go
  ├── repository/
  │     ├── hotel_repository.go
  │     └── room_repository.go
  ├── service/
  │     ├── hotel_service.go
  │     └── room_service.go
  ├── handler/            (REST controller/handler)
  │     ├── hotel_handler.go
  │     └── room_handler.go
  └── dto/
        ├── hotel_dto.go
        └── room_dto.go
```

## 6. Việc cần Codex làm
1. Sinh entity/model cho `hotel` và `room` theo schema trên.
2. Sinh repository layer (CRUD, dùng interface để dễ mock test).
3. Sinh service layer áp dụng business rules ở mục 4.
4. Sinh REST handler theo endpoint ở mục 3, kèm validate input.
5. Sinh unit test cho service layer (happy path + case xoá hotel còn phòng).
6. Sinh migration SQL tạo bảng `hotel`, `room` (index trên `hotel_id`, `room_type_id`).
