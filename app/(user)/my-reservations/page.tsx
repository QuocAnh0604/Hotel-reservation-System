"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  listReservations,
  cancelReservation,
} from "@/services/reservation.service";
import { formatDate, formatVND } from "@/utils/format";
import { getApiError } from "@/services/api";
import type { Reservation } from "@/types/reservation";
const labels = {
  CONFIRMED: "Đã xác nhận",
  PENDING: "Chờ xác nhận",
  CANCELLED: "Đã hủy",
  COMPLETED: "Đã hoàn tất",
  CHECKED_IN: "Đã nhận phòng",
  CHECKED_OUT: "Đã trả phòng",
};
export default function ReservationsPage() {
  const [items, setItems] = useState<Reservation[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = () => {
    setLoading(true);
    listReservations()
      .then((result) =>
        setItems(Array.isArray(result) ? result : result.content),
      )
      .catch((reason) =>
        setError(getApiError(reason, "Không thể tải lịch sử đặt phòng.")),
      )
      .finally(() => setLoading(false));
  };
  useEffect(load, []);
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-lagoon-700">
            Tài khoản của bạn
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold">
            Đặt phòng của tôi
          </h1>
        </div>
        <Link href="/hotels" className="text-sm font-semibold text-lagoon-700">
          + Đặt phòng mới
        </Link>
      </div>
      <div className="mt-7 space-y-4">
        {loading ? (
          <p className="text-muted">Đang tải…</p>
        ) : error ? (
          <p role="alert" className="text-coral">
            {error}
          </p>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center text-muted">
            Bạn chưa có lượt đặt phòng nào.
          </div>
        ) : (
          items.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-line bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">Khách sạn #{item.hotelId}</h2>
                  <p className="mt-1 text-sm text-muted">
                    {formatDate(item.checkIn)} – {formatDate(item.checkOut)} ·{" "}
                    {item.guests} phòng
                  </p>
                </div>
                <span className="rounded-full bg-lagoon-50 px-3 py-1 text-sm font-medium text-lagoon-700">
                  {labels[item.status] ?? item.status}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-sm">
                <span>
                  Mã {item.id} · <b>{formatVND(item.total)}</b>
                </span>
                <div className="flex gap-4">
                  <Link
                    href={`/my-reservations/${item.id}`}
                    className="font-semibold text-lagoon-700"
                  >
                    Chi tiết
                  </Link>
                  {["PENDING", "CONFIRMED", "CHECKED_IN"].includes(
                    item.status,
                  ) && (
                    <button
                      onClick={async () => {
                        if (!confirm("Bạn có chắc muốn hủy đặt phòng này?"))
                          return;
                        try {
                          await cancelReservation(item.id);
                          load();
                        } catch (reason) {
                          setError(
                            getApiError(reason, "Không thể hủy đặt phòng."),
                          );
                        }
                      }}
                      className="font-semibold text-coral"
                    >
                      Hủy phòng
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
