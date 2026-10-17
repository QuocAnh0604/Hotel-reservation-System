import { api } from "@/services/api";
import type { SpringPage } from "@/types/common";
import type { Review, ReviewSummary } from "@/types/review";
interface ReviewApi {
  reviewId: number | string;
  hotelId: number | string;
  roomTypeId: string;
  guestId: number | string;
  reservationId: number | string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
}
function mapReview(value: ReviewApi): Review {
  return {
    id: String(value.reviewId),
    hotelId: String(value.hotelId),
    guestName: `Khách #${value.guestId}`,
    roomTypeId: value.roomTypeId,
    roomTypeName: value.roomTypeId,
    rating: value.rating,
    comment: value.comment,
    createdAt: value.createdAt,
  };
}
export async function listReviews(
  hotelId: string,
  params: { page?: number; size?: number; roomTypeId?: string } = {},
) {
  const { data } = await api.get<SpringPage<ReviewApi>>(
    `/hotels/${hotelId}/reviews`,
    { params: { ...params, page: params.page ?? 0, size: params.size ?? 10 } },
  );
  return { ...data, content: data.content.map(mapReview) };
}
export async function reviewSummary(hotelId: string) {
  const { data } = await api.get<
    ReviewSummary & { averageRating?: number; totalReviews?: number }
  >(`/hotels/${hotelId}/reviews/summary`);
  return {
    average: data.averageRating ?? data.average,
    total: data.totalReviews ?? data.total,
    distribution: data.distribution ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };
}
export async function createReview(
  hotelId: string,
  input: {
    reservationId: number | string;
    roomTypeId: string;
    rating: number;
    comment: string;
  },
) {
  return mapReview(
    (await api.post<ReviewApi>(`/hotels/${hotelId}/reviews`, input)).data,
  );
}
export async function updateReview(
  id: string,
  input: { rating: number; comment: string },
) {
  return mapReview((await api.put<ReviewApi>(`/reviews/${id}`, input)).data);
}
export async function deleteReview(id: string) {
  return api.delete(`/reviews/${id}`);
}
