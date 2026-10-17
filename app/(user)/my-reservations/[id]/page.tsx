"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { getReservation } from "@/services/reservation.service";
import { getApiError } from "@/services/api";
import { formatDate, formatVND } from "@/utils/format";
import type { Reservation } from "@/types/reservation";
function ReservationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Reservation>();
  const [error, setError] = useState("");
  useEffect(() => {
    getReservation(id)
      .then(setItem)
      .catch((reason) =>
        setError(getApiError(reason, "Không thể tải đặt phòng.")),
      );
  }, [id]);
  if (error)
    return (
      <p role="alert" className="text-coral">
        {error}
      </p>
    );
  if (!item) return <p className="text-muted">Đang tải…</p>;
  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/my-reservations" className="text-sm text-muted">
        ← Lịch sử đặt phòng
      </Link>
      <h1 className="mt-3 font-display text-3xl font-semibold">
        Chi tiết đặt phòng
      </h1>
      <div className="mt-6 rounded-2xl border border-line bg-white p-6">
        <div className="flex justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Khách sạn #{item.hotelId}</h2>
            <p className="mt-1 text-muted">Mã đặt phòng: {item.id}</p>
          </div>
          <span className="rounded-full bg-lagoon-50 px-3 py-1 text-sm text-lagoon-700">
            {item.status}
          </span>
        </div>
        <dl className="mt-6 grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted">Loại phòng</dt>
            <dd className="font-medium">{item.roomId}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Số phòng</dt>
            <dd className="font-medium">{item.guests}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Nhận phòng</dt>
            <dd className="font-medium">{formatDate(item.checkIn)}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Trả phòng</dt>
            <dd className="font-medium">{formatDate(item.checkOut)}</dd>
          </div>
        </dl>
        <p className="mt-6 flex justify-between border-t border-line pt-5 text-lg">
          <span>Tổng thanh toán</span>
          <b className="text-lagoon-700">{formatVND(item.total)}</b>
        </p>
      </div>
    </div>
  );
}
export default function Page() {
  return (
    <Suspense
      fallback={<div className="h-64 animate-pulse rounded-3xl bg-line/50" />}
    >
      <ReservationDetailPage />
    </Suspense>
  );
}
