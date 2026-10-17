"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { buttonClass } from "@/components/common/Button";
import { getReservation } from "@/services/reservation.service";
import { formatVND, formatDate } from "@/utils/format";
import type { Reservation } from "@/types/reservation";
export default function SuccessPage() {
  const [item, setItem] = useState<Reservation>();
  useEffect(() => {
    const id = sessionStorage.getItem("lastReservationId");
    if (id) getReservation(id).then(setItem);
  }, []);
  if (!item)
    return (
      <div className="mx-auto max-w-xl py-14 text-center">
        <h1 className="font-display text-3xl font-semibold">
          Đặt phòng thành công
        </h1>
        <Link
          href="/my-reservations"
          className={buttonClass("primary", "md", "mt-6")}
        >
          Xem đặt phòng của tôi
        </Link>
      </div>
    );
  return (
    <div className="mx-auto max-w-xl text-center">
      <div className="rounded-3xl border border-moss/30 bg-moss-50 p-8">
        <p className="text-4xl">✓</p>
        <h1 className="mt-3 font-display text-3xl font-semibold">
          Đặt phòng thành công!
        </h1>
        <p className="mt-2 text-muted">
          Mã đặt phòng: <b className="text-ink">{item.id}</b>
        </p>
        <div className="mt-6 space-y-2 rounded-xl bg-white p-4 text-left text-sm">
          <p className="font-semibold">Khách sạn #{item.hotelId}</p>
          <p>
            Loại phòng {item.roomId} · {formatDate(item.checkIn)} –{" "}
            {formatDate(item.checkOut)}
          </p>
          <p>
            Trạng thái: <b className="text-moss">{item.status}</b>
          </p>
          <p>
            Tổng tiền: <b>{formatVND(item.total)}</b>
          </p>
        </div>
      </div>
      <Link
        href="/my-reservations"
        className={buttonClass("primary", "md", "mt-6")}
      >
        Xem lịch sử đặt phòng
      </Link>
    </div>
  );
}
