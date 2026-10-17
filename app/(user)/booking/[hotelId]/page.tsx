"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/common/Button";
import { getHotelById } from "@/services/hotel.service";
import { listRooms } from "@/services/room.service";
import { getAvailability } from "@/services/availability.service";
import { quoteRate } from "@/services/rate.service";
import { createReservation } from "@/services/reservation.service";
import { getApiError } from "@/services/api";
import type { Hotel } from "@/types/hotel";
import type { Room } from "@/types/room";
import { formatVND } from "@/utils/format";

function BookingPage() {
  const { hotelId } = useParams<{ hotelId: string }>();
  const router = useRouter();
  const [hotel, setHotel] = useState<Hotel>();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [apiError, setApiError] = useState("");
  const [checkIn, setCheckIn] = useState("2026-10-21");
  const [checkOut, setCheckOut] = useState("2026-10-24");
  const [guests, setGuests] = useState(2);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [available, setAvailable] = useState<number | null>(null);
  const nights = useMemo(
    () =>
      Math.max(
        0,
        Math.ceil(
          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
            86400000,
        ),
      ),
    [checkIn, checkOut],
  );
  const room = rooms[0];
  useEffect(() => {
    let active = true;
    Promise.all([getHotelById(hotelId), listRooms(hotelId, { size: 50 })])
      .then(([loadedHotel, loadedRooms]) => {
        if (!active) return;
        setHotel(loadedHotel);
        setRooms(
          loadedRooms.content.filter((item) => item.status === "AVAILABLE"),
        );
      })
      .catch((reason) => {
        if (active)
          setApiError(
            getApiError(reason, "Không thể tải thông tin đặt phòng."),
          );
      });
    return () => {
      active = false;
    };
  }, [hotelId]);
  useEffect(() => {
    if (!room || nights < 1) return;
    let active = true;
    Promise.all([
      getAvailability(hotelId, room.roomTypeId, checkIn, checkOut),
      quoteRate(hotelId, checkIn, checkOut),
    ])
      .then(([availability, quote]) => {
        if (!active) return;
        setAvailable(
          Math.min(
            ...availability.dailyAvailability.map((day) => day.available),
          ),
        );
        setTotal(quote.totalRate);
      })
      .catch((reason) => {
        if (active)
          setApiError(
            getApiError(reason, "Không thể kiểm tra giá và tình trạng phòng."),
          );
      });
    return () => {
      active = false;
    };
  }, [hotelId, room, checkIn, checkOut, nights]);
  if (!hotel || !room) return <p>{apiError || "Đang tải thông tin phòng…"}</p>;
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (nights < 1) {
      setError("Ngày trả phòng phải sau ngày nhận phòng.");
      return;
    }
    if (available === 0) {
      setError("Khoảng ngày này không còn phòng phù hợp.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const item = await createReservation({
        hotelId,
        roomTypeId: room.roomTypeId,
        roomCount: 1,
        startDate: checkIn,
        endDate: checkOut,
      });
      sessionStorage.setItem("lastReservationId", item.id);
      router.push("/booking/success");
    } catch (reason) {
      setError(getApiError(reason, "Không thể tạo đặt phòng."));
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href={`/hotels/${hotelId}`}
        className="text-sm text-muted hover:text-lagoon-700"
      >
        ← Quay lại khách sạn
      </Link>
      <h1 className="mt-3 font-display text-3xl font-semibold">
        Hoàn tất đặt phòng
      </h1>
      <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_320px]">
        <form
          onSubmit={submit}
          className="space-y-5 rounded-2xl border border-line bg-white p-5 sm:p-7"
        >
          <div>
            <p className="font-semibold">{hotel.name}</p>
            <p className="mt-1 text-sm text-muted">{room.roomTypeName}</p>
            {available !== null && (
              <p className="mt-1 text-sm text-moss">
                Còn {available} phòng trong khoảng ngày đã chọn
              </p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">
              Nhận phòng
              <input
                required
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-line px-3 py-2.5"
              />
            </label>
            <label className="text-sm font-medium">
              Trả phòng
              <input
                required
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-line px-3 py-2.5"
              />
            </label>
          </div>
          <label className="block text-sm font-medium">
            Số khách
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="mt-1.5 w-full rounded-lg border border-line bg-white px-3 py-2.5"
            >
              <option value="1">1 khách</option>
              <option value="2">2 khách</option>
              <option value="3">3 khách</option>
              <option value="4">4 khách</option>
            </select>
          </label>
          {(error || apiError) && (
            <p
              role="alert"
              className="rounded-lg bg-coral-50 p-3 text-sm text-coral"
            >
              {error || apiError}
            </p>
          )}
          <Button type="submit" loading={loading} className="w-full">
            Xác nhận đặt phòng
          </Button>
        </form>
        <aside className="h-fit rounded-2xl border border-line bg-white p-5">
          <h2 className="font-semibold">Tóm tắt giá</h2>
          <div className="mt-4 space-y-3 text-sm">
            <p className="flex justify-between">
              <span>Giá API × {nights} đêm</span>
              <b>{formatVND(total)}</b>
            </p>
            <p className="flex justify-between border-t border-line pt-3 text-base">
              <span>Tổng cộng</span>
              <b className="text-lagoon-700">{formatVND(total)}</b>
            </p>
          </div>
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
      <BookingPage />
    </Suspense>
  );
}
