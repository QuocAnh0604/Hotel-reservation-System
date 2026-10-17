# TASK: Integrate Hotel Reservation APIs into the Existing Next.js Frontend

## 1. Mục tiêu

Tích hợp toàn bộ API của hệ thống Hotel Reservation từ Spring Boot Backend vào giao diện Next.js hiện tại.

Frontend đã được xây dựng trước bằng mock data. Nhiệm vụ của bạn là chuyển các chức năng đang dùng mock data sang gọi API thật, đồng thời giữ nguyên giao diện và trải nghiệm người dùng hiện có.

**Không xây dựng lại giao diện từ đầu. Không tự ý thay đổi thiết kế, màu sắc, layout, responsive hoặc luồng điều hướng nếu không cần thiết.**

Trước khi sửa code:
1. Đọc cấu trúc toàn bộ frontend.
2. Đọc `package.json`, cấu hình Next.js, các trang, components, hooks, contexts, services và types hiện có.
3. Xác định những trang đang dùng mock data và các chức năng tương ứng.
4. Đối chiếu với API specification bên dưới.
5. Lập kế hoạch tích hợp rồi thực hiện trực tiếp trên code hiện có.

Không dừng lại ở việc phân tích hoặc đề xuất. Hãy triển khai code thực tế, kiểm tra và sửa các lỗi phát sinh.

## 2. Công nghệ và cấu hình

- Frontend: Next.js, React, TypeScript.
- Backend: Spring Boot.
- Base URL backend: `http://localhost:8080`.
- Database backend: PostgreSQL.
- Sử dụng Axios nếu project hiện tại đã sử dụng Axios. Nếu đã có API client thì tái sử dụng, không tạo thêm client trùng lặp.

Tạo hoặc cập nhật file `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Đọc base URL từ `process.env.NEXT_PUBLIC_API_URL`, không hardcode URL backend trong từng service.

Không ghi đè các biến môi trường khác đang có. Nếu `.env.local` đã tồn tại thì chỉ bổ sung biến cần thiết.

## 3. Kiến trúc frontend

Tái sử dụng cấu trúc và quy ước hiện tại. Nếu project đã có các thư mục sau, hãy sử dụng chúng:

- `services/`: API client và các hàm gọi API.
- `types/`: TypeScript interfaces/types cho request và response.
- `hooks/`: hooks phục vụ tải dữ liệu và thao tác nghiệp vụ.
- `context/`: trạng thái đăng nhập và user hiện tại.
- `components/`: các components giao diện dùng chung.
- `app/`: các trang Next.js App Router.

Nếu thiếu, chỉ bổ sung cấu trúc thực sự cần thiết.

Tổ chức service theo nghiệp vụ, ví dụ:
- `api.ts`
- `auth.service.ts`
- `hotel.service.ts`
- `room.service.ts`
- `availability.service.ts`
- `rate.service.ts`
- `reservation.service.ts`
- `review.service.ts`

Có thể gộp hoặc tách file theo quy ước hiện có, nhưng phải tránh trùng lặp logic.

Không gọi API trực tiếp rải rác trong JSX nếu có thể xử lý thông qua service và hook hiện tại.

## 4. API client và xử lý lỗi

Tạo hoặc cập nhật một Axios instance dùng chung.

Yêu cầu:
- Base URL lấy từ `NEXT_PUBLIC_API_URL`.
- Request JSON có header `Content-Type: application/json` khi phù hợp.
- Request interceptor tự động thêm `Authorization: Bearer <accessToken>` khi có access token.
- Không yêu cầu token cho các API public.
- Không log token, password hoặc thông tin xác thực ra console.
- Chuẩn hóa xử lý lỗi HTTP để các trang có thể hiển thị thông báo phù hợp.

Xử lý các mã HTTP:
- `400`: Hiển thị lỗi validation hoặc message nghiệp vụ từ backend.
- `401`: Thử refresh token theo quy trình bên dưới; nếu refresh thất bại thì xóa session và yêu cầu đăng nhập lại.
- `403`: Hiển thị thông báo không có quyền truy cập.
- `404`: Hiển thị thông báo không tìm thấy dữ liệu.
- `409`: Hiển thị lỗi xung đột, chẳng hạn hết phòng hoặc dữ liệu bị trùng.
- `503`: Thông báo dịch vụ backend phụ thuộc hiện không khả dụng.
- Lỗi mạng: Hiển thị thông báo kết nối thất bại.

Ưu tiên lấy message từ response backend, ví dụ `{ "message": "No rooms available" }`. Nếu backend trả về định dạng khác, xử lý an toàn và có fallback.

Không giả định mọi response lỗi đều có trường `message`.

## 5. Authentication

### Đăng ký

`POST /auth/register`

Request:

```json
{
  "firstName": "An",
  "lastName": "Nguyen",
  "email": "an@example.com",
  "password": "password123"
}
```

Tích hợp vào trang đăng ký hiện có:
- Validate các trường cần thiết.
- Kiểm tra định dạng email và các quy tắc mật khẩu theo validation hiện có.
- Hiển thị lỗi từ backend.
- Chống gửi form nhiều lần khi request đang chạy.
- Sau khi đăng ký thành công, xử lý theo response thực tế và luồng hiện tại của ứng dụng; không giả định rằng đăng ký tự động đăng nhập nếu backend không trả token.

### Đăng nhập

`POST /auth/login`

Request:

```json
{
  "email": "an@example.com",
  "password": "password123"
}
```

Response mẫu:

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
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

Sau khi đăng nhập:
- Lưu và sử dụng token theo quy ước session hiện có.
- Cập nhật thông tin user trong AuthContext hoặc cơ chế quản lý auth hiện tại.
- Chuyển trang theo luồng điều hướng hiện có và quyền thực tế của user.
- Không để mock user quyết định quyền truy cập sau khi đã đăng nhập bằng API thật.

### Refresh token

`POST /auth/refresh`

Request:

```json
{
  "refreshToken": "eyJ..."
}
```

Khi API trả `401`:
1. Nếu chưa thử refresh cho request hiện tại, gọi refresh token.
2. Nếu refresh thành công, cập nhật token mới theo đúng response backend và gửi lại request ban đầu một lần.
3. Ngăn nhiều request đồng thời kích hoạt nhiều refresh request bằng cơ chế queue hoặc promise dùng chung.
4. Không refresh lặp vô hạn.
5. Nếu refresh thất bại, xóa session và đưa user về trang đăng nhập khi phù hợp.
6. Không tự giả định response refresh giống response login; hãy đối chiếu với code hoặc OpenAPI backend.

Nếu backend chưa hỗ trợ refresh theo cách cần thiết, ghi rõ điểm chưa khớp thay vì bịa response.

### Lấy user hiện tại

`GET /auth/me`

Dùng để xác thực và đồng bộ user khi tải lại trang nếu phù hợp với thiết kế auth hiện tại.

Không gọi liên tục trên mỗi lần render.

### Logout

`POST /auth/logout`

Khi đăng xuất:
- Gọi API logout nếu có session/token phù hợp.
- Dù API logout thất bại, vẫn xử lý xóa session ở frontend theo cách an toàn.
- Xóa access token và refresh token.
- Reset AuthContext và dữ liệu user trong bộ nhớ.
- Điều hướng về trang public phù hợp.

### AuthContext

Tái sử dụng hoặc cập nhật `AuthContext` hiện có để quản lý:
- User hiện tại.
- Trạng thái đã đăng nhập.
- Role `USER` hoặc `ADMIN`.
- Trạng thái khởi tạo/loading auth.
- Các hàm login, register, logout và refresh/session restore khi cần.

Với Next.js App Router, đặt logic dùng React hooks và browser APIs trong Client Components hoặc provider phù hợp. Không truy cập `localStorage` trực tiếp trong Server Components.

Không làm lộ trang admin hoặc thông tin user trong lúc auth đang khởi tạo.

**Lưu ý bảo mật:** Ưu tiên cơ chế session an toàn nếu backend hỗ trợ. Nếu phải lưu JWT trong `localStorage` theo kiến trúc hiện có thì không lưu mật khẩu, không log token và phải xử lý đúng việc khôi phục session. Không tự triển khai cookie HttpOnly từ frontend nếu backend chưa hỗ trợ.

## 6. Hotel API

### Danh sách khách sạn

`GET /hotels`

Query parameters:
- `page`
- `size`
- `sort`
- `location`

Ví dụ:

`GET /hotels?page=0&size=10&sort=name,asc`

`GET /hotels?location=Da%20Nang&page=0&size=10`

Response dạng Spring Page:

```json
{
  "content": [
    {
      "hotelId": 1,
      "name": "Sun Hotel",
      "address": "12 Nguyen Hue",
      "location": "Da Nang"
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "size": 10,
  "number": 0
}
```

Tích hợp vào trang danh sách khách sạn:
- Thay mock data bằng dữ liệu API.
- Giữ nguyên card, layout và giao diện hiện tại.
- Kết nối tìm kiếm/lọc theo location nếu giao diện có chức năng này.
- Kết nối phân trang nếu giao diện hỗ trợ.
- Xử lý loading, lỗi và danh sách rỗng.
- Không giả định response luôn có dữ liệu.

Lưu ý: `page` của backend bắt đầu từ `0`. Nếu UI hiển thị trang bắt đầu từ `1`, cần chuyển đổi đúng giữa UI và API.

### Chi tiết khách sạn

`GET /hotels/{hotelId}`

Tích hợp vào trang chi tiết khách sạn. Lấy `hotelId` từ route params, tải dữ liệu thật và xử lý trường hợp ID không hợp lệ hoặc khách sạn không tồn tại.

### Quản lý khách sạn ADMIN

- `POST /hotels`
- `PUT /hotels/{hotelId}`
- `DELETE /hotels/{hotelId}`

Request tạo khách sạn:

```json
{
  "name": "Sun Hotel",
  "address": "12 Nguyen Hue",
  "location": "Da Nang"
}
```

Tích hợp vào màn hình quản lý khách sạn admin hiện có:
- Form tạo mới.
- Form chỉnh sửa.
- Xóa mềm có xác nhận.
- Reload hoặc cập nhật danh sách sau khi thao tác thành công.
- Hiển thị lỗi validation và lỗi nghiệp vụ.
- Chỉ cho `ADMIN` thực hiện các thao tác quản trị.

Không tự giả định response của PUT/DELETE nếu tài liệu chưa nêu rõ.

## 7. Room API

### Danh sách phòng

`GET /hotels/{hotelId}/rooms`

Query parameters có thể gồm:
- `roomTypeId`
- `floor`
- `isAvailable`
- `page`
- `size`

Ví dụ:

`GET /hotels/1/rooms?roomTypeId=DELUXE&page=0&size=10`

Response mẫu:

```json
{
  "content": [
    {
      "roomId": 10,
      "roomTypeId": "DELUXE",
      "floor": 3,
      "number": "301",
      "hotelId": 1,
      "name": "Deluxe King Room",
      "available": true
    }
  ],
  "totalElements": 1,
  "totalPages": 1
}
```

Tích hợp vào trang quản lý phòng theo khách sạn:
- Hiển thị danh sách phòng.
- Kết nối bộ lọc nếu UI có.
- Kết nối phân trang nếu UI có.
- Xử lý loading, lỗi và danh sách rỗng.

Chú ý: response danh sách phòng dùng trường `available`, trong khi request cập nhật trạng thái dùng `isAvailable`. Phải ánh xạ theo đúng schema thực tế, không tùy tiện đổi tên trường trên wire format.

### Chi tiết phòng

`GET /hotels/{hotelId}/rooms/{roomId}`

### Quản lý phòng ADMIN

- `POST /hotels/{hotelId}/rooms`
- `PUT /hotels/{hotelId}/rooms/{roomId}`
- `PATCH /hotels/{hotelId}/rooms/{roomId}/availability`
- `DELETE /hotels/{hotelId}/rooms/{roomId}`

Request tạo phòng:

```json
{
  "roomTypeId": "DELUXE",
  "floor": 3,
  "number": "301",
  "name": "Deluxe King Room",
  "isAvailable": true
}
```

Request cập nhật availability:

```json
{
  "isAvailable": false
}
```

Kết nối form tạo/sửa, thao tác đổi trạng thái phòng và xóa mềm trong giao diện admin. Sau thao tác thành công, cập nhật hoặc tải lại dữ liệu phù hợp.

Không giả định phòng còn trống về mặt đặt phòng chỉ dựa vào cờ `available`; phải sử dụng API availability khi kiểm tra theo khoảng ngày.

## 8. Availability và Rate API

### Kiểm tra số phòng còn trống

`GET /hotels/{hotelId}/room-types/{roomTypeId}/availability`

Query:
- `from=YYYY-MM-DD`
- `to=YYYY-MM-DD`

Ví dụ:

`GET /hotels/1/room-types/DELUXE/availability?from=2026-11-01&to=2026-11-03`

Response:

```json
{
  "hotelId": 1,
  "roomTypeId": "DELUXE",
  "dailyAvailability": [
    {
      "date": "2026-11-01",
      "available": 4
    },
    {
      "date": "2026-11-02",
      "available": 4
    },
    {
      "date": "2026-11-03",
      "available": 4
    }
  ]
}
```

Kết nối với luồng đặt phòng:
- Người dùng chọn ngày nhận/trả phòng.
- Kiểm tra ngày hợp lệ và ngày trả phòng phải sau ngày nhận phòng.
- Gọi API availability khi đã có hotel, room type và khoảng ngày hợp lệ.
- Hiển thị số lượng phòng còn trống.
- Không cho tiếp tục đặt số phòng vượt quá khả năng đáp ứng đã biết.
- Vẫn xử lý trường hợp API tạo reservation trả `409` do hết phòng hoặc xung đột phát sinh sau khi kiểm tra.

**Quan trọng:** API availability hiện trả dữ liệu theo từng ngày và `to` được tính bao gồm trong truy vấn. Trong khi đó, ngày trả phòng khi đặt reservation không tính tiền. Không được lấy số ngày ở bằng cách đếm số phần tử `dailyAvailability`. Số đêm phải tính theo chênh lệch giữa checkout và checkin.

### Lấy giá theo ngày

`GET /hotels/{hotelId}/rates?from=YYYY-MM-DD&to=YYYY-MM-DD`

Sử dụng cho màn hình hiển thị giá theo ngày nếu UI cần. Kiểm tra response thực tế để xây dựng TypeScript types và ánh xạ dữ liệu.

### Tính tổng giá reservation

`GET /internal/hotels/{hotelId}/rates/quote?checkin=YYYY-MM-DD&checkout=YYYY-MM-DD`

Response mẫu:

```json
{
  "hotelId": 1,
  "checkin": "2026-11-01",
  "checkout": "2026-11-03",
  "nights": 2,
  "totalRate": 2400000,
  "dailyBreakdown": [
    {
      "hotelId": 1,
      "date": "2026-11-01",
      "rate": 1200000
    },
    {
      "hotelId": 1,
      "date": "2026-11-02",
      "rate": 1200000
    }
  ]
}
```

Tích hợp để hiển thị:
- Ngày nhận phòng.
- Ngày trả phòng.
- Số đêm.
- Giá từng ngày nếu phù hợp với UI.
- Tổng giá dự kiến.

Gọi lại quote khi hotel hoặc khoảng ngày thay đổi hợp lệ. Tránh request dư thừa và tránh hiển thị giá của lựa chọn cũ trong khi request mới đang chạy.

Không tự tính tổng giá từ mock data nếu quote API có thể cung cấp giá thật. Tổng giá cuối cùng từ backend mới là nguồn dữ liệu chính thức.

### Quản lý giá ADMIN

- `POST /hotels/{hotelId}/rates`
- `PUT /hotels/{hotelId}/rates/{date}`
- `POST /hotels/{hotelId}/rates/bulk`
- `DELETE /hotels/{hotelId}/rates/{date}`

Request tạo/cập nhật giá:

```json
{
  "date": "2026-11-01",
  "rate": 1200000
}
```

Request cập nhật hàng loạt:

```json
{
  "dates": ["2026-11-01", "2026-11-02"],
  "rate": 1200000
}
```

Kết nối các form quản lý giá hiện có. Validate ngày và giá trước khi gửi; hiển thị kết quả và tải lại dữ liệu sau khi thao tác thành công.

Nếu UI chưa có trang quản lý giá, kiểm tra thiết kế và cấu trúc hiện tại trước khi bổ sung. Không tự tạo một dashboard mới làm thay đổi phạm vi thiết kế đã thống nhất.

## 9. Reservation API

### Tạo reservation

`POST /reservations`

Quyền: `USER`.

Request:

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

Backend lấy `guestId` từ JWT và ghi đè giá trị frontend gửi. Không được xem `guestId` do client cung cấp là nguồn xác thực.

Nếu user hiện tại có `guestId` đáng tin cậy từ response backend thì có thể sử dụng theo contract. Nếu không có, kiểm tra luồng backend và không tự lấy `userId` rồi giả định nó bằng `guestId`.

Tích hợp vào form đặt phòng:
1. Chọn khách sạn.
2. Chọn loại phòng.
3. Chọn ngày nhận/trả phòng.
4. Nhập số phòng.
5. Kiểm tra availability.
6. Hiển thị quote và tổng giá.
7. Nếu chưa đăng nhập, chuyển đến login nhưng giữ lại thông tin đặt phòng khi có thể.
8. Khi đăng nhập xong, cho người dùng tiếp tục đặt phòng.
9. Gửi request tạo reservation.
10. Hiển thị kết quả thực tế từ backend và trạng thái reservation.
11. Điều hướng đến trang thành công hoặc chi tiết reservation theo thiết kế hiện có.

Response mẫu:

```json
{
  "reservationId": 100,
  "hotelId": 1,
  "guestId": 1,
  "roomTypeId": "DELUXE",
  "roomCount": 1,
  "startDate": "2026-11-01",
  "endDate": "2026-11-03",
  "status": "PENDING",
  "totalAmount": 2400000
}
```

Không tạo reservation giả trong frontend khi API thất bại.

### Danh sách reservation

- `GET /reservations`
- `GET /reservations?guestId=1`

Quyền:
- `USER`: backend chỉ trả reservation của chính user.
- `ADMIN`: có thể truyền `guestId` để lọc theo khách.

Tích hợp vào trang lịch sử đặt phòng của user và trang quản lý reservation của admin.

Không truyền `guestId` tùy ý từ giao diện user để truy vấn reservation của người khác. Không giả định response có phân trang nếu backend chưa xác nhận contract cụ thể.

### Chi tiết reservation

`GET /reservations/{reservationId}`

Tích hợp trang chi tiết reservation. Xử lý đúng quyền sở hữu, quyền admin và lỗi `403`/`404`.

### Hủy reservation

`PATCH /reservations/{reservationId}/cancel`

Kết nối nút hủy:
- Xác nhận thao tác trước khi gửi.
- Chỉ hiển thị hoặc kích hoạt khi phù hợp với trạng thái và quyền hiện tại.
- Backend vẫn là nơi quyết định trạng thái có được hủy hay không.
- Sau thành công, tải lại dữ liệu hoặc cập nhật trạng thái dựa trên response thực tế.

### Cập nhật trạng thái reservation ADMIN

`PATCH /reservations/{reservationId}/status`

Request:

```json
{
  "status": "CONFIRMED"
}
```

Các trạng thái:
- `PENDING`
- `CONFIRMED`
- `CHECKED_IN`
- `CHECKED_OUT`
- `CANCELLED`

Các chuyển trạng thái được mô tả:
- `PENDING -> CONFIRMED`
- `CONFIRMED -> CHECKED_IN`
- `CHECKED_IN -> CHECKED_OUT`
- `PENDING -> CANCELLED`
- `CONFIRMED -> CANCELLED`
- `CHECKED_IN -> CANCELLED`

Kết nối bộ chọn trạng thái trong trang admin. Không hiển thị những chuyển trạng thái không hợp lệ như thao tác bình thường. Backend vẫn là nguồn quyết định cuối cùng; hiển thị lỗi nếu server từ chối.

Sau khi cập nhật thành công, reload chi tiết reservation để đồng bộ trạng thái mới.

## 10. Review API

### Danh sách review của khách sạn

`GET /hotels/{hotelId}/reviews?page=0&size=10`

Có thể lọc bằng `roomTypeId`.

Tích hợp vào trang review của khách sạn:
- Hiển thị dữ liệu thật.
- Kết nối phân trang và bộ lọc nếu UI có.
- Hiển thị trạng thái loading, lỗi và không có review.

### Thống kê rating

`GET /hotels/{hotelId}/reviews/summary`

Response:

```json
{
  "hotelId": 1,
  "averageRating": 4.5,
  "totalReviews": 20
}
```

Kết nối điểm rating trung bình và tổng số review trên card hoặc trang chi tiết khách sạn. Không sử dụng số liệu mock khi API thật đã được tích hợp.

### Tạo review

`POST /hotels/{hotelId}/reviews`

Request:

```json
{
  "guestId": 1,
  "reservationId": 100,
  "roomTypeId": "DELUXE",
  "rating": 5,
  "comment": "Phòng sạch và nhân viên thân thiện."
}
```

Điều kiện:
- Chỉ reservation có trạng thái `CHECKED_OUT` mới được review.
- Mỗi reservation chỉ được review một lần.
- `guestId` được backend lấy từ JWT.
- `roomTypeId` phải khớp loại phòng trong reservation.

Tích hợp form đánh giá vào lịch sử hoặc chi tiết reservation:
- Chỉ hiện nút đánh giá cho reservation phù hợp.
- Validate rating và comment theo yêu cầu UI/BE.
- Không gửi `guestId` không đáng tin cậy.
- Không giả định `userId` bằng `guestId`.
- Sau khi tạo thành công, reload review list và rating summary của khách sạn.

### Review của guest

`GET /guests/{guestId}/reviews?page=0&size=10`

Chỉ sử dụng nếu giao diện hiện tại có màn hình review của guest và có nguồn `guestId` đúng theo contract backend.

### Chi tiết, sửa và xóa review

- `GET /reviews/{reviewId}`
- `PUT /reviews/{reviewId}`
- `DELETE /reviews/{reviewId}`

Request cập nhật:

```json
{
  "rating": 4,
  "comment": "Phòng tốt, sẽ quay lại lần sau."
}
```

Kết nối chức năng xem/sửa/xóa review trong UI hiện có. Chỉ cho phép thao tác phù hợp với quyền và dữ liệu thực tế; backend vẫn là nơi xác thực quyền sở hữu.

### Guest API

Các endpoint hiện có:
- `POST /guests`
- `GET /guests/{guestId}`
- `GET /guests?email=an@example.com`
- `PUT /guests/{guestId}`
- `DELETE /guests/{guestId}`

Không tích hợp trực tiếp toàn bộ Guest API vào frontend một cách máy móc. Chỉ dùng nếu có màn hình quản lý khách riêng hoặc cần giải quyết một luồng nghiệp vụ mà backend thực sự yêu cầu.

Ưu tiên xác minh việc tạo hoặc liên kết guest record sau đăng ký. Nếu đây là yêu cầu của reservation service, cần chỉ ra rõ trách nhiệm thuộc backend hay frontend và không tự tạo guest trùng lặp để né lỗi.

## 11. Phân quyền và bảo vệ route

Các role:
- `Public`: không yêu cầu đăng nhập.
- `USER`: đặt phòng, xem reservation của mình và review.
- `ADMIN`: quản lý khách sạn, phòng, giá và cập nhật trạng thái reservation.

Tái sử dụng hoặc cập nhật `ProtectedRoute`, `RoleRoute`, layout và middleware hiện có cho phù hợp với Next.js App Router.

Yêu cầu:
- Trang public vẫn truy cập được khi chưa đăng nhập.
- Trang user yêu cầu đăng nhập.
- Trang admin yêu cầu role `ADMIN`.
- Nếu đã đăng nhập nhưng không có quyền, hiển thị trang 403 hoặc thông báo phù hợp.
- Không chỉ dựa vào việc ẩn nút trên UI để bảo vệ quyền.
- Không giả định dữ liệu user từ localStorage là bằng chứng quyền hợp lệ; đồng bộ với backend theo thiết kế auth hiện có.
- Không để trang bị redirect vòng lặp khi auth đang khởi tạo hoặc token hết hạn.

Backend vẫn chịu trách nhiệm bảo vệ dữ liệu và kiểm tra quyền thực tế.

## 12. Quy tắc dữ liệu và TypeScript

Tạo hoặc cập nhật types dựa trên request/response đã được xác nhận.

Cần có types phù hợp cho:
- User, LoginRequest, RegisterRequest, TokenPair.
- Hotel và HotelRequest.
- Room và RoomRequest.
- Availability, DailyAvailability.
- Rate, RateQuote và DailyBreakdown.
- Reservation, ReservationStatus.
- Review, ReviewSummary.
- Spring Page response.
- API error response.

Không dùng `any` tràn lan để né lỗi TypeScript.

Không ép mọi endpoint vào một cấu trúc response chung nếu backend trả về các cấu trúc khác nhau.

Với dữ liệu phân trang Spring, đọc `content`, `totalElements`, `totalPages`, `size`, `number` đúng theo response thực tế.

Với ngày tháng:
- Gửi ngày theo định dạng `YYYY-MM-DD`.
- Không chuyển ngày đặt phòng thành ISO datetime hoặc UTC một cách không cần thiết.
- Tránh lỗi lệch ngày do timezone.
- Tính số đêm theo ngày checkout trừ ngày checkin.
- Không lấy số đêm từ số lượng phần tử của availability.

Với tiền:
- Không sử dụng phép tính floating-point tùy tiện để làm nguồn giá cuối cùng.
- Hiển thị tiền theo định dạng VND phù hợp.
- Ưu tiên giá do backend trả về.

## 13. Loading, error và trải nghiệm người dùng

Giữ nguyên UI hiện tại và bổ sung các trạng thái cần thiết:
- Loading/skeleton khi đang tải dữ liệu.
- Empty state khi danh sách rỗng.
- Error state có thông báo dễ hiểu.
- Disable nút submit trong lúc gửi request.
- Chống double-submit với thao tác tạo reservation, review và các thao tác quản trị.
- Thông báo thành công/thất bại phù hợp.
- Xác nhận trước các thao tác hủy, xóa hoặc thay đổi quan trọng.
- Không xóa dữ liệu form khi có lỗi validation nếu không cần thiết.
- Tránh cập nhật state sau khi component đã unmount.
- Không để request lỗi làm mất toàn bộ trang nếu có thể hiển thị lỗi tại khu vực tương ứng.

Không dùng `alert()` cho mọi trường hợp nếu project đã có toast, dialog hoặc component thông báo riêng.

## 14. Loại bỏ mock data đúng cách

Sau khi tích hợp một chức năng:
- Không để mock data tiếp tục được sử dụng làm dữ liệu chính của chức năng đó.
- Giữ lại mock data chỉ khi còn cần cho Storybook, test, development mode hoặc các chức năng chưa có API.
- Không trộn dữ liệu thật với mock data để che giấu lỗi API.
- Nếu API chưa hoạt động, hiển thị trạng thái lỗi phù hợp và ghi rõ endpoint đang lỗi.
- Không tạo fallback trả về danh sách mock như thể API đã thành công.

Tìm kiếm toàn bộ các vị trí sử dụng mock data và xử lý theo từng trang/chức năng.

## 15. Các điểm phải xác minh với backend

Tài liệu API chưa nêu đầy đủ một số contract. Hãy kiểm tra source code backend hoặc OpenAPI/Swagger nếu có trước khi kết luận:

1. Response chính xác của `/auth/refresh`.
2. Response chính xác của `/auth/me`.
3. Response của PUT/DELETE và các API cập nhật trạng thái.
4. Cấu trúc chi tiết của Room, Rate, Review và Reservation responses.
5. Quy tắc phân trang của `/reservations`.
6. Cách xác định `guestId` tương ứng với user đăng nhập.
7. Cơ chế tạo/liên kết guest record khi đăng ký.
8. Cấu trúc error response thực tế.
9. CORS và quyền truy cập thực tế của từng endpoint.
10. Các API có thể trả `204 No Content` hay không.

Nếu có Swagger/OpenAPI hoặc source backend trong workspace, hãy đọc để xác nhận. Nếu không có, triển khai theo thông tin đã biết, cô lập các điểm chưa xác định trong service/types và báo cáo rõ.

Không tự tạo endpoint, request field hoặc response field mới.

## 16. Thứ tự thực hiện

Thực hiện theo thứ tự:

### Giai đoạn 1: API infrastructure
- Cấu hình `.env.local`.
- Tạo/cập nhật Axios client.
- Thêm interceptor.
- Xử lý auth, refresh và error.
- Chuẩn hóa TypeScript types.

### Giai đoạn 2: Authentication
- Register.
- Login.
- Restore session và `/auth/me`.
- Logout.
- Protected routes và role-based access.

### Giai đoạn 3: Public hotel browsing
- Danh sách khách sạn.
- Tìm kiếm/lọc/phân trang.
- Chi tiết khách sạn.
- Danh sách phòng.
- Availability.
- Rates và quote.
- Reviews và review summary.

### Giai đoạn 4: User reservation
- Đặt phòng.
- Trang thành công.
- Lịch sử reservation.
- Chi tiết reservation.
- Hủy reservation.
- Tạo/sửa/xóa review theo quyền và điều kiện nghiệp vụ.

### Giai đoạn 5: Admin
- Quản lý khách sạn.
- Quản lý phòng.
- Quản lý giá.
- Quản lý reservation.
- Cập nhật trạng thái reservation.
- Các chức năng review/guest chỉ khi có màn hình tương ứng.

### Giai đoạn 6: Kiểm tra
- Chạy lint và TypeScript checks theo scripts hiện có.
- Chạy build production.
- Sửa các lỗi phát sinh do thay đổi.
- Kiểm tra import, route params, hydration và client/server boundary.
- Kiểm tra mọi endpoint được gọi đúng method, path, query và request body.
- Kiểm tra trạng thái loading, lỗi và dữ liệu rỗng.
- Tìm các mock data còn bị sử dụng ngoài dự kiến.

Nếu backend không chạy hoặc chưa có dữ liệu thử nghiệm, vẫn hoàn thiện phần code, chạy những kiểm tra có thể thực hiện và ghi rõ phần cần kiểm tra thủ công. Không báo rằng API đã chạy thành công nếu chưa thực sự kiểm tra được.

## 17. Tiêu chí hoàn thành

Chỉ kết thúc khi:
1. Các trang hiện tại vẫn giữ thiết kế ban đầu.
2. Các chức năng đã có API được chuyển sang dữ liệu thật.
3. Token và role được xử lý nhất quán.
4. Các luồng đặt phòng và review tuân thủ contract nghiệp vụ.
5. Các API lỗi được hiển thị rõ ràng.
6. Không còn mock data giả làm dữ liệu API thành công.
7. TypeScript/lint/build được kiểm tra và các lỗi do code mới gây ra được sửa.
8. Các điểm chưa xác định được liệt kê rõ ràng.

## 18. Báo cáo cuối cùng

Sau khi triển khai, hãy báo cáo:
- Những file đã tạo hoặc chỉnh sửa.
- Những trang/chức năng đã tích hợp.
- Các endpoint đã được kết nối.
- Những chức năng còn dùng mock data và lý do.
- Kết quả lint, typecheck và build.
- Những lỗi API thực tế đã gặp.
- Các điểm cần chỉnh sửa ở backend hoặc contract chưa xác định.
- Hướng dẫn chạy frontend và cách kiểm tra thủ công từng luồng.

Bắt đầu bằng việc đọc code hiện tại, sau đó trực tiếp triển khai. Không dừng lại ở việc chỉ đưa ra hướng dẫn hoặc ví dụ minh họa.