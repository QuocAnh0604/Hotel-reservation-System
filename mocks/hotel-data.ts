/**
 * DỮ LIỆU TẠM THỜI CHO GIAI ĐOẠN LÀM GIAO DIỆN.
 * Khi gán API: xoá file này và thay các lời gọi bằng hooks
 * (useHotels, useHotel, useRooms, useReviews) trong src/hooks.
 */
import type { Hotel } from "@/types/hotel";
import type { Room, RoomType } from "@/types/room";
import type { Review } from "@/types/review";
import { summarize } from "@/utils/reviews";

export const roomTypes: RoomType[] = [
  { id: "rt-standard", name: "Standard" },
  { id: "rt-deluxe", name: "Deluxe" },
  { id: "rt-family", name: "Family" },
  { id: "rt-suite", name: "Suite" },
];
const BASE_PRICE = [850_000, 1_250_000, 1_650_000, 2_400_000];

const raw = [
  ["Hanoi Old Quarter House", "Hà Nội", "18 Hàng Bạc, Hoàn Kiếm, Hà Nội", 200],
  ["Hồ Tây Lakeview", "Hà Nội", "52 Quảng An, Tây Hồ, Hà Nội", 190],
  [
    "Mỹ Khê Beach Hotel",
    "Đà Nẵng",
    "120 Võ Nguyên Giáp, Sơn Trà, Đà Nẵng",
    195,
  ],
  ["Hội An Lantern Stay", "Hội An", "9 Nguyễn Thái Học, Hội An, Quảng Nam", 28],
  ["Sài Gòn Central", "Hồ Chí Minh", "75 Lê Lợi, Quận 1, TP. Hồ Chí Minh", 210],
  ["Đà Lạt Pine Hill", "Đà Lạt", "34 Trần Hưng Đạo, Đà Lạt, Lâm Đồng", 150],
  [
    "Nha Trang Bay Resort",
    "Nha Trang",
    "88 Trần Phú, Nha Trang, Khánh Hòa",
    185,
  ],
  ["Huế Imperial Garden", "Huế", "6 Lê Lợi, Phú Hội, Huế", 40],
] as const;

const AMENITIES = [
  "Wi-Fi miễn phí",
  "Bữa sáng",
  "Hồ bơi",
  "Đưa đón sân bay",
  "Phòng gym",
  "Lễ tân 24/7",
];
const NAMES = [
  "Lan",
  "Minh",
  "Hà",
  "Quang",
  "Thu",
  "Đức",
  "Mai",
  "Hùng",
  "Linh",
  "Nam",
];
const COMMENTS = [
  "Phòng sạch sẽ, nhân viên nhiệt tình, vị trí rất thuận tiện đi lại.",
  "Giường êm, cách âm tốt. Bữa sáng khá đa dạng, sẽ quay lại.",
  "Check-in nhanh gọn. Phòng đúng như hình, view đẹp vào buổi sáng.",
  "Tạm ổn so với giá. Điều hòa hơi ồn nhưng nhân viên hỗ trợ đổi phòng ngay.",
  "Gia đình mình ở 3 đêm, các bé rất thích hồ bơi. Rất đáng tiền.",
  "Phòng hơi nhỏ hơn mong đợi, bù lại dịch vụ rất chu đáo.",
];
const RATINGS = [5, 4, 5, 3, 4, 5, 4, 2, 5, 4];

export const rooms: Room[] = [];
export const reviews: Review[] = [];

raw.forEach((_, hi) => {
  const hotelId = String(hi + 1);
  for (let floor = 1; floor <= 5; floor++) {
    for (let j = 0; j < 4; j++) {
      const t = (floor + j) % 4;
      rooms.push({
        id: `${hotelId}-${floor}0${j + 1}`,
        hotelId,
        number: `${floor}0${j + 1}`,
        floor,
        roomTypeId: roomTypes[t].id,
        roomTypeName: roomTypes[t].name,
        status: (floor * j + hi) % 5 === 0 ? "UNAVAILABLE" : "AVAILABLE",
        pricePerNight:
          Math.round((BASE_PRICE[t] * (1 + (hi % 4) * 0.08)) / 10_000) * 10_000,
      });
    }
  }
  for (let j = 0; j < 14; j++) {
    const t = (j + hi) % 4;
    const month = String(9 - (j % 8)).padStart(2, "0");
    const day = String(1 + ((j * 3) % 27)).padStart(2, "0");
    reviews.push({
      id: `${hotelId}-r${j + 1}`,
      hotelId,
      guestName: `${["Nguyễn", "Trần", "Lê", "Phạm"][j % 4]} ${NAMES[(j + hi) % NAMES.length]}`,
      roomTypeId: roomTypes[t].id,
      roomTypeName: roomTypes[t].name,
      rating: RATINGS[(j + hi) % RATINGS.length],
      comment: COMMENTS[(j + hi) % COMMENTS.length],
      createdAt: `2026-${month}-${day}T08:00:00Z`,
    });
  }
});

export const hotels: Hotel[] = raw.map(
  ([name, location, address, coverHue], hi) => {
    const id = String(hi + 1);
    const s = summarize(reviews.filter((r) => r.hotelId === id));
    const hotelRooms = rooms.filter((r) => r.hotelId === id);
    return {
      id,
      name,
      location,
      address,
      coverHue,
      description: `${name} nằm tại ${location}, cách các điểm tham quan chính vài phút di chuyển. Phòng thiết kế gọn gàng, đầy đủ tiện nghi cho cả chuyến công tác lẫn nghỉ dưỡng gia đình.`,
      amenities: AMENITIES.filter((_, i) => (i + hi) % 3 !== 0 || i < 2),
      avgRating: Math.round(s.average * 10) / 10,
      reviewCount: s.total,
      priceFrom: Math.min(...hotelRooms.map((r) => r.pricePerNight)),
    };
  },
);

export const locations = Array.from(new Set(hotels.map((h) => h.location)));
export const getHotel = (id: string) => hotels.find((h) => h.id === id);
export const getRooms = (hotelId: string) =>
  rooms.filter((r) => r.hotelId === hotelId);
export const getReviews = (hotelId: string) =>
  reviews
    .filter((r) => r.hotelId === hotelId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
