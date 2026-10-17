export interface Review {
  id: string;
  hotelId: string;
  guestName: string;
  roomTypeId: string;
  roomTypeName: string;
  rating: number; // 1..5
  comment: string;
  createdAt: string; // ISO
}

export interface ReviewSummary {
  average: number;
  total: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}
