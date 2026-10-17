"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  listReservations,
  updateReservationStatus,
} from "@/services/reservation.service";
import { getApiError } from "@/services/api";
import { formatDate, formatVND } from "@/utils/format";
import type { Reservation, ReservationStatus } from "@/types/reservation";
export default function AdminReservationsPage() {
  const [items, setItems] = useState<Reservation[]>([]);
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const load = () => {
    void listReservations({ page: 0, size: 100 })
      .then((result) =>
        setItems(Array.isArray(result) ? result : result.content),
      )
      .catch((reason) =>
        setError(getApiError(reason, "Không thể tải đặt phòng.")),
      );
  };
  useEffect(() => {
    load();
  }, []);
  const filtered = useMemo(
    () =>
      items.filter(
        (r) =>
          (!status || r.status === status) &&
          (!query ||
            r.id.toLowerCase().includes(query.toLowerCase()) ||
            r.guestName.toLowerCase().includes(query.toLowerCase())),
      ),
    [items, status, query],
  );
  const options: ReservationStatus[] = [
    "PENDING",
    "CONFIRMED",
    "CHECKED_IN",
    "CHECKED_OUT",
    "CANCELLED",
  ];
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Quản lý đặt phòng</h1>
      {error && (
        <p role="alert" className="mt-4 text-sm text-coral">
          {error}
        </p>
      )}
      <div className="mt-6 flex flex-wrap gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm mã hoặc tên khách"
          className="rounded-lg border border-line bg-white px-4 py-2.5"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-line bg-white px-4 py-2.5"
        >
          <option value="">Tất cả trạng thái</option>
          {options.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </div>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-lagoon-50 text-muted">
            <tr>
              <th className="p-4">Mã</th>
              <th className="p-4">Khách</th>
              <th className="p-4">Khách sạn</th>
              <th className="p-4">Thời gian</th>
              <th className="p-4">Tổng</th>
              <th className="p-4">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.map((r) => (
              <tr key={r.id}>
                <td className="p-4">
                  <Link
                    href={`/admin/reservations/${r.id}`}
                    className="font-semibold text-lagoon-700"
                  >
                    {r.id}
                  </Link>
                </td>
                <td className="p-4">{r.guestName || "—"}</td>
                <td className="p-4">#{r.hotelId}</td>
                <td className="p-4">
                  {formatDate(r.checkIn)} – {formatDate(r.checkOut)}
                </td>
                <td className="p-4">{formatVND(r.total)}</td>
                <td className="p-4">
                  <select
                    value={r.status}
                    onChange={async (e) => {
                      try {
                        await updateReservationStatus(
                          r.id,
                          e.target.value as ReservationStatus,
                        );
                        load();
                      } catch (reason) {
                        setError(
                          getApiError(reason, "Không thể cập nhật trạng thái."),
                        );
                      }
                    }}
                    className="rounded border border-line px-2 py-1"
                  >
                    <option>{r.status}</option>
                    {options
                      .filter((value) => value !== r.status)
                      .map((value) => (
                        <option key={value}>{value}</option>
                      ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
