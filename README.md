# Hotel Reservation System

Ứng dụng đặt phòng khách sạn gồm:

- `app và các thư mục cùng cấp với BE/ là các thư mục frontend hiện tại: Next.js App Router, React, TypeScript và Tailwind CSS.
- `BE/`: Spring Boot API, PostgreSQL, Redis, Flyway và JWT authentication.

## Yêu cầu môi trường

- Node.js 20+
- npm 10+
- Java 21+
- PostgreSQL đang chạy
- Redis đang chạy tại `localhost:6379`

## 1. Cấu hình Backend

Tạo file `BE/.env`:

```env
DB_URL=jdbc:postgresql://localhost:5432/hotel_reservation
DB_USERNAME=postgres
DB_PASSWORD=123456
JWT_SECRET=thay-bang-chuoi-bi-mat-dai-it-nhat-32-ky-tu
JWT_ACCESS_EXPIRATION_MS=900000
JWT_REFRESH_EXPIRATION_MS=604800000
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

Tạo database PostgreSQL:

```sql
CREATE DATABASE hotel_reservation;
```

Chạy backend từ thư mục `BE`:

```bash
cd BE
./mvnw spring-boot:run
```

Trên Windows:

```powershell
cd BE
.\mvnw.cmd spring-boot:run
```

Backend mặc định chạy tại `http://localhost:8080`. Flyway sẽ chạy các migration khi ứng dụng khởi động.

Swagger UI: <http://localhost:8080/swagger-ui/index.html>

OpenAPI JSON: <http://localhost:8080/v3/api-docs>

## 2. Cấu hình Frontend

Tạo file `.env.local` ở thư mục frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Cài dependency và chạy development server:

```bash
npm install
npm run dev
```

Frontend mặc định chạy tại <http://localhost:3000>.

Các lệnh kiểm tra:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## 3. Luồng sử dụng chính

1. Mở `/register` để tạo tài khoản hoặc `/login` để đăng nhập.
2. Frontend lưu access token và tự gửi token qua header `Authorization: Bearer ...`.
3. Backend lấy user/guest từ JWT; frontend không gửi `guestId` trong request đặt phòng.
4. User có thể xem khách sạn, kiểm tra availability, quote giá, tạo và hủy reservation.
5. Admin truy cập các trang `/admin/*` để quản lý khách sạn, phòng, reservation và review.

Nếu database chưa có dữ liệu, trang danh sách khách sạn sẽ hiển thị trạng thái rỗng. Hãy tạo dữ liệu qua API/Swagger hoặc database trước khi kiểm tra các luồng nghiệp vụ.

## 4. API và xử lý lỗi

Frontend dùng Axios client tại `services/api.ts` để:

- Đọc base URL từ `NEXT_PUBLIC_API_URL`.
- Tự động thêm access token.
- Refresh token khi nhận `401`.
- Xóa session khi refresh thất bại.
- Hiển thị thông báo phù hợp cho lỗi `400`, `403`, `404`, `409`, `503` và lỗi mạng.

Không commit các file `.env`, `.env.local` hoặc secret JWT lên repository.
