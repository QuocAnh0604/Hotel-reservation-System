"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { listHotels } from "@/services/hotel.service";
import { listReservations } from "@/services/reservation.service";
import { getApiError } from "@/services/api";
import { formatVND } from "@/utils/format";
import type { Reservation } from "@/types/reservation";
export default function DashboardPage() {
  const [hotelCount, setHotelCount] = useState(0);
  const [items, setItems] = useState<Reservation[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([
      listHotels({ page: 0, size: 1 }),
      listReservations({ page: 0, size: 5 }),
    ])
      .then(([hotels, reservations]) => {
        setHotelCount(hotels.totalElements);
        setItems(
          Array.isArray(reservations) ? reservations : reservations.content,
        );
      })
      .catch((reason) =>
        setError(getApiError(reason, "Không thể tải thống kê.")),
      );
  }, []);
  const revenue = items.reduce((sum, item) => sum + item.total, 0);
  const stats = [
    ["Khách sạn", hotelCount, "/admin/hotels"],
    ["Đặt phòng gần đây", items.length, "/admin/reservations"],
    ["Doanh thu mẫu", formatVND(revenue), "/admin/reservations"],
    ["Trạng thái hệ thống", "API", "/admin/dashboard"],
  ] as const;
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wider text-lagoon-700">
        Bảng điều khiển
      </p>
      <h1 className="mt-1 font-display text-3xl font-semibold">
        Tổng quan vận hành
      </h1>
      {error && (
        <p role="alert" className="mt-4 text-sm text-coral">
          {error}
        </p>
      )}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value, href]) => (
          <Link
            key={label}
            href={href}
            className="rounded-2xl border border-line bg-white p-5 hover:border-lagoon-600"
          >
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </Link>
        ))}
      </div>
      <section className="mt-8 rounded-2xl border border-line bg-white p-5">
        <div className="flex justify-between">
          <h2 className="font-semibold">Đặt phòng gần đây</h2>
          <Link
            href="/admin/reservations"
            className="text-sm font-semibold text-lagoon-700"
          >
            Xem tất cả
          </Link>
        </div>
        <div className="mt-4 divide-y divide-line">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap justify-between gap-2 py-3 text-sm"
            >
              <span>
                <b>{item.id}</b> · {item.guestName || "Khách hàng"}
              </span>
              <span className="text-muted">{formatVND(item.total)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
