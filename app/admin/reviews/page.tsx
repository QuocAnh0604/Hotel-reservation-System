"use client";
import { useEffect, useState } from "react";
import { listHotels } from "@/services/hotel.service";
import { listReviews } from "@/services/review.service";
import { getApiError } from "@/services/api";
import type { Review } from "@/types/review";
export default function AdminReviewsPage() {
  const [items, setItems] = useState<(Review & { hotelName: string })[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    listHotels({ page: 0, size: 100 })
      .then(async (hotels) => {
        const grouped = await Promise.all(
          hotels.content.map(async (hotel) =>
            (await listReviews(hotel.id, { page: 0, size: 20 })).content.map(
              (review) => ({ ...review, hotelName: hotel.name }),
            ),
          ),
        );
        setItems(grouped.flat());
      })
      .catch((reason) =>
        setError(getApiError(reason, "Không thể tải đánh giá.")),
      );
  }, []);
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Quản lý đánh giá</h1>
      {error && (
        <p role="alert" className="mt-4 text-sm text-coral">
          {error}
        </p>
      )}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-lagoon-50 text-muted">
            <tr>
              <th className="p-4">Người đánh giá</th>
              <th className="p-4">Khách sạn</th>
              <th className="p-4">Điểm</th>
              <th className="p-4">Nội dung</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((review) => (
              <tr key={review.id}>
                <td className="p-4 font-semibold">{review.guestName}</td>
                <td className="p-4">{review.hotelName}</td>
                <td className="p-4 text-brass">{review.rating}/5</td>
                <td className="max-w-md p-4">{review.comment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
