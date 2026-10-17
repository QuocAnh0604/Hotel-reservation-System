"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  createHotel,
  deleteHotel,
  listHotels,
  updateHotel,
} from "@/services/hotel.service";
import { getApiError } from "@/services/api";
import type { Hotel } from "@/types/hotel";
import { formatVND } from "@/utils/format";
export default function AdminHotelsPage() {
  const [items, setItems] = useState<Hotel[]>([]);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({ name: "", address: "", location: "" });
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = () => {
    setLoading(true);
    listHotels({ page: 0, size: 50 })
      .then((result) => setItems(result.content))
      .catch((reason) =>
        setError(getApiError(reason, "Không thể tải khách sạn.")),
      )
      .finally(() => setLoading(false));
  };
  useEffect(load, []);
  const filtered = useMemo(
    () =>
      items.filter(
        (h) =>
          h.name.toLowerCase().includes(query.toLowerCase()) ||
          h.location.toLowerCase().includes(query.toLowerCase()),
      ),
    [items, query],
  );
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      if (editing) await updateHotel(editing, form);
      else await createHotel(form);
      setForm({ name: "", address: "", location: "" });
      setEditing(null);
      load();
    } catch (reason) {
      setError(getApiError(reason, "Không thể lưu khách sạn."));
    }
  }
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-lagoon-700">Quản trị</p>
          <h1 className="mt-1 font-display text-3xl font-semibold">
            Khách sạn
          </h1>
        </div>
      </div>
      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-coral-50 p-3 text-sm text-coral"
        >
          {error}
        </p>
      )}
      <form
        onSubmit={save}
        className="mt-6 grid gap-3 rounded-2xl border border-line bg-white p-5 sm:grid-cols-4"
      >
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Tên khách sạn"
          className="rounded-lg border border-line px-3 py-2.5"
        />
        <input
          required
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          placeholder="Địa chỉ"
          className="rounded-lg border border-line px-3 py-2.5"
        />
        <input
          required
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          placeholder="Địa điểm"
          className="rounded-lg border border-line px-3 py-2.5"
        />
        <button className="rounded-lg bg-lagoon-600 px-4 py-2.5 text-sm font-semibold text-white">
          {editing ? "Lưu thay đổi" : "+ Thêm khách sạn"}
        </button>
      </form>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Tìm theo tên hoặc địa điểm"
        className="mt-6 w-full rounded-lg border border-line bg-white px-4 py-3"
      />
      <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-lagoon-50 text-muted">
            <tr>
              <th className="p-4">Khách sạn</th>
              <th className="p-4">Địa điểm</th>
              <th className="p-4">Giá từ</th>
              <th className="p-4">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {!loading &&
              filtered.map((h) => (
                <tr key={h.id}>
                  <td className="p-4 font-semibold">{h.name}</td>
                  <td className="p-4">{h.location}</td>
                  <td className="p-4">{formatVND(h.priceFrom)}</td>
                  <td className="p-4">
                    <div className="flex gap-3">
                      <Link
                        className="font-semibold text-lagoon-700"
                        href={`/admin/hotels/${h.id}/rooms`}
                      >
                        Phòng
                      </Link>
                      <button
                        onClick={() => {
                          setEditing(h.id);
                          setForm({
                            name: h.name,
                            address: h.address,
                            location: h.location,
                          });
                        }}
                        className="font-semibold text-lagoon-700"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm("Xóa khách sạn này?")) return;
                          try {
                            await deleteHotel(h.id);
                            load();
                          } catch (reason) {
                            setError(
                              getApiError(reason, "Không thể xóa khách sạn."),
                            );
                          }
                        }}
                        className="font-semibold text-coral"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
