export interface Hotel {
  id: string;
  name: string;
  address: string;
  location: string;
  description: string;
  amenities: string[];
  avgRating: number;
  reviewCount: number;
  priceFrom: number;
  /** Màu nền cho ảnh bìa tạm (chưa có ảnh thật từ backend) */
  coverHue: number;
}
