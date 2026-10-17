"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/common/Button";
import { Pagination } from "@/components/common/Pagination";
import { SelectField } from "@/components/common/SelectField";
import { EmptyState, ErrorState, Skeleton } from "@/components/common/states";
import { ReviewList } from "@/components/review/ReviewList";
import { ReviewSummaryCard } from "@/components/review/ReviewSummaryCard";
import { getHotelById } from "@/services/hotel.service";
import { listReviews, reviewSummary } from "@/services/review.service";
import type { Hotel } from "@/types/hotel";
import type { Review } from "@/types/review";
import { paginate } from "@/utils/paginate";
import { summarize } from "@/utils/reviews";

const PAGE_SIZE = 5;

function HotelReviewsPage() {
  const { hotelId } = useParams<{ hotelId: string }>();
  const [hotel, setHotel] = useState<Hotel>();
  const [all, setAll] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReturnType<typeof summarize>>({
    average: 0,
    total: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roomTypeId, setRoomTypeId] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    Promise.all([
      getHotelById(hotelId),
      listReviews(hotelId, { page: 0, size: 100 }),
      reviewSummary(hotelId),
    ])
      .then(([loadedHotel, loadedReviews, loadedSummary]) => {
        if (!active) return;
        setHotel(loadedHotel);
        setAll(loadedReviews.content);
        setSummary(loadedSummary);
      })
      .catch(() => {
        if (active) setError("Không thể tải đánh giá từ máy chủ.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [hotelId]);
  const filtered = useMemo(
    () => all.filter((r) => !roomTypeId || r.roomTypeId === roomTypeId),
    [all, roomTypeId],
  );
  const filteredSummary = useMemo(
    () => (roomTypeId ? summarize(filtered) : summary),
    [filtered, roomTypeId, summary],
  );
  const result = useMemo(
    () => paginate(filtered, page, PAGE_SIZE),
    [filtered, page],
  );

  if (loading) return <Skeleton className="h-96 rounded-3xl" />;
  if (error || !hotel)
    return error ? <ErrorState message={error} /> : notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/hotels/${hotel.id}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-lagoon-700"
      >
        <ArrowLeft className="size-4" aria-hidden /> {hotel.name}
      </Link>
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">
        Đánh giá của khách
      </h1>

      <div className="mt-6">
        <ReviewSummaryCard summary={filteredSummary} />
      </div>

      <div className="mt-6 sm:max-w-xs">
        <SelectField
          label="Loại phòng"
          value={roomTypeId}
          onChange={(e) => {
            setRoomTypeId(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Tất cả loại phòng</option>
          {[
            ...new Map(
              all.map((review) => [review.roomTypeId, review.roomTypeName]),
            ).entries(),
          ].map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </SelectField>
      </div>

      <div className="mt-6">
        {result.items.length === 0 ? (
          <EmptyState
            title="Chưa có đánh giá cho loại phòng này"
            description="Thử xem đánh giá của loại phòng khác."
            action={
              <Button variant="secondary" onClick={() => setRoomTypeId("")}>
                Xem tất cả
              </Button>
            }
          />
        ) : (
          <>
            <ReviewList reviews={result.items} />
            <div className="mt-8">
              <Pagination
                page={result.page}
                totalPages={result.totalPages}
                onChange={setPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={<div className="h-96 animate-pulse rounded-3xl bg-line/50" />}
    >
      <HotelReviewsPage />
    </Suspense>
  );
}
