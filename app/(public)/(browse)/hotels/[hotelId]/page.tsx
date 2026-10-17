"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { ArrowLeft, Check, MapPin } from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { buttonClass, Button } from "@/components/common/Button";
import { RatingStars } from "@/components/common/RatingStars";
import { EmptyState, ErrorState, Skeleton } from "@/components/common/states";
import { HotelCover } from "@/components/hotel/HotelCover";
import {
  RoomFilter,
  type RoomFilterValue,
} from "@/components/hotel/RoomFilter";
import { RoomList } from "@/components/hotel/RoomList";
import { ReviewList } from "@/components/review/ReviewList";
import { getHotelById } from "@/services/hotel.service";
import { listRooms } from "@/services/room.service";
import { listReviews, reviewSummary } from "@/services/review.service";
import type { Hotel } from "@/types/hotel";
import type { Room } from "@/types/room";
import type { Review } from "@/types/review";
import { formatVND } from "@/utils/format";

const ROOMS_PER_STEP = 8;
const EMPTY_FILTER: RoomFilterValue = { roomTypeId: "", floor: "", status: "" };

function HotelDetailPage() {
  const { hotelId } = useParams<{ hotelId: string }>();
  const [hotel, setHotel] = useState<Hotel>();
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RoomFilterValue>(EMPTY_FILTER);
  const [visible, setVisible] = useState(ROOMS_PER_STEP);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      getHotelById(hotelId),
      listRooms(hotelId),
      listReviews(hotelId, { page: 0, size: 3 }),
      reviewSummary(hotelId),
    ])
      .then(([loadedHotel, loadedRooms, loadedReviews, summary]) => {
        if (!active) return;
        setHotel({
          ...loadedHotel,
          avgRating: summary.average,
          reviewCount: summary.total,
        });
        setAllRooms(loadedRooms.content);
        setReviews(loadedReviews.content);
      })
      .catch(() => {
        if (active)
          setLoadError("Không thể tải thông tin khách sạn từ máy chủ.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [hotelId]);
  const roomTypes = useMemo(
    () => [
      ...new Map(
        allRooms.map((room) => [
          room.roomTypeId,
          { id: room.roomTypeId, name: room.roomTypeName },
        ]),
      ).values(),
    ],
    [allRooms],
  );
  const floors = useMemo(
    () => [...new Set(allRooms.map((r) => r.floor))].sort((a, b) => a - b),
    [allRooms],
  );
  const rooms = useMemo(
    () =>
      allRooms.filter(
        (r) =>
          (!filter.roomTypeId || r.roomTypeId === filter.roomTypeId) &&
          (!filter.floor || r.floor === Number(filter.floor)) &&
          (!filter.status || r.status === filter.status),
      ),
    [allRooms, filter],
  );
  if (loading) return <Skeleton className="h-96 rounded-3xl" />;
  if (loadError || !hotel)
    return loadError ? <ErrorState message={loadError} /> : notFound();

  return (
    <div>
      <Link
        href="/hotels"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-lagoon-700"
      >
        <ArrowLeft className="size-4" aria-hidden /> Tất cả khách sạn
      </Link>
      <HotelCover
        hue={hotel.coverHue}
        label={hotel.location}
        className="h-52 rounded-3xl sm:h-72"
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-12">
          <header>
            <h1 className="font-display text-3xl font-semibold sm:text-4xl">
              {hotel.name}
            </h1>
            <p className="mt-2 flex items-start gap-1.5 text-muted">
              <MapPin className="mt-1 size-4 shrink-0" aria-hidden />{" "}
              {hotel.address}
            </p>
            <Link
              href={`/hotels/${hotel.id}/reviews`}
              className="mt-3 inline-flex flex-wrap items-center gap-2 text-sm hover:underline"
            >
              <RatingStars value={hotel.avgRating} />
              <span className="font-semibold">
                {hotel.avgRating.toFixed(1)}
              </span>
              <span className="text-muted">({hotel.reviewCount} đánh giá)</span>
            </Link>
            <p className="mt-5 max-w-prose leading-relaxed text-ink/90">
              {hotel.description}
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {hotel.amenities.map((a) => (
                <li
                  key={a}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-sm"
                >
                  <Check className="size-3.5 text-moss" aria-hidden /> {a}
                </li>
              ))}
            </ul>
          </header>

          <section
            id="rooms"
            aria-labelledby="rooms-title"
            className="scroll-mt-24"
          >
            <h2
              id="rooms-title"
              className="font-display text-2xl font-semibold"
            >
              Danh sách phòng
            </h2>
            <div className="mt-4">
              <RoomFilter
                value={filter}
                roomTypes={roomTypes}
                floors={floors}
                onChange={(v) => {
                  setFilter(v);
                  setVisible(ROOMS_PER_STEP);
                }}
              />
            </div>
            <div className="mt-4">
              {rooms.length === 0 ? (
                <EmptyState
                  title="Không có phòng phù hợp"
                  description="Thử chọn loại phòng, tầng hoặc trạng thái khác."
                  action={
                    <Button
                      variant="secondary"
                      onClick={() => setFilter(EMPTY_FILTER)}
                    >
                      Xóa bộ lọc
                    </Button>
                  }
                />
              ) : (
                <>
                  <RoomList rooms={rooms.slice(0, visible)} />
                  {visible < rooms.length && (
                    <div className="mt-4 text-center">
                      <Button
                        variant="secondary"
                        onClick={() => setVisible((v) => v + ROOMS_PER_STEP)}
                      >
                        Xem thêm ({rooms.length - visible} phòng)
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          <section aria-labelledby="reviews-title">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2
                id="reviews-title"
                className="font-display text-2xl font-semibold"
              >
                Đánh giá từ khách
              </h2>
              <Link
                href={`/hotels/${hotel.id}/reviews`}
                className="text-sm font-semibold text-lagoon-700 hover:underline"
              >
                Xem tất cả {reviews.length} đánh giá
              </Link>
            </div>
            <div className="mt-4">
              {reviews.length === 0 ? (
                <EmptyState
                  title="Chưa có đánh giá"
                  description="Hãy là người đầu tiên chia sẻ trải nghiệm sau kỳ nghỉ."
                />
              ) : (
                <ReviewList reviews={reviews.slice(0, 3)} />
              )}
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-line bg-white p-5 lg:sticky lg:top-24">
          <p className="text-sm text-muted">Giá từ</p>
          <p className="text-3xl font-semibold">
            {formatVND(hotel.priceFrom)}
            <span className="text-base font-normal text-muted"> / đêm</span>
          </p>
          <Link
            href={`/booking/${hotel.id}`}
            className={buttonClass("primary", "lg", "mt-5 w-full")}
          >
            Đặt phòng
          </Link>
          <p className="mt-3 text-center text-sm text-muted">
            Bạn cần đăng nhập để hoàn tất đặt phòng.
          </p>
        </aside>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={<div className="h-96 animate-pulse rounded-3xl bg-line/50" />}
    >
      <HotelDetailPage />
    </Suspense>
  );
}
