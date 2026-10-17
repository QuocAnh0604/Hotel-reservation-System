"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { getReservation } from "@/services/reservation.service";
import { getApiError } from "@/services/api";
import { formatDate, formatVND } from "@/utils/format";
import type { Reservation } from "@/types/reservation";
function Detail() {
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
      <Link href="/admin/reservations" className="text-sm text-muted">
        ← Tất cả đặt phòng
      </Link>
      <h1 className="mt-3 font-display text-3xl font-semibold">{item.id}</h1>
      <div className="mt-6 rounded-2xl border border-line bg-white p-6">
        <h2 className="text-xl font-semibold">Khách sạn #{item.hotelId}</h2>
        <p className="mt-1 text-muted">
          {item.guestName || "Khách hàng"} · {item.guestEmail || ""}
        </p>
        <dl className="mt-6 grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted">Loại phòng</dt>
            <dd>{item.roomId}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Trạng thái</dt>
            <dd className="font-semibold text-lagoon-700">{item.status}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Lưu trú</dt>
            <dd>
              {formatDate(item.checkIn)} – {formatDate(item.checkOut)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Tổng tiền</dt>
            <dd className="font-semibold">{formatVND(item.total)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
export default function Page() {
  return (
    <Suspense
      fallback={<div className="h-64 animate-pulse rounded-3xl bg-line/50" />}
    >
      <Detail />
    </Suspense>
  );
}
