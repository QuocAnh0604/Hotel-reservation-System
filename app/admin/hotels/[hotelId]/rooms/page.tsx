"use client";
/* eslint-disable react-hooks/exhaustive-deps */
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  listRooms,
  createRoom,
  setRoomAvailability,
  deleteRoom,
} from "@/services/room.service";
import { getHotelById } from "@/services/hotel.service";
import { getApiError } from "@/services/api";
import { formatVND } from "@/utils/format";
import type { Room } from "@/types/room";
function AdminRoomsPage() {
  const { hotelId } = useParams<{ hotelId: string }>();
  const [hotelName, setHotelName] = useState("");
  const [items, setItems] = useState<Room[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    roomTypeId: "DELUXE",
    floor: 1,
    number: "",
    name: "Deluxe Room",
    isAvailable: true,
  });
  const load = () =>
    listRooms(hotelId, { size: 50 })
      .then((result) => setItems(result.content))
      .catch((reason) =>
        setError(getApiError(reason, "Không thể tải danh sách phòng.")),
      );
  useEffect(() => {
    getHotelById(hotelId)
      .then((hotel) => setHotelName(hotel.name))
      .catch(() => undefined);
    load();
  }, [hotelId]);
  async function add(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createRoom(hotelId, form);
      setForm({ ...form, number: "" });
      load();
    } catch (reason) {
      setError(getApiError(reason, "Không thể thêm phòng."));
    }
  }
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">
        Phòng · {hotelName || `Khách sạn #${hotelId}`}
      </h1>
      {error && (
        <p role="alert" className="mt-4 text-sm text-coral">
          {error}
        </p>
      )}
      <form
        onSubmit={add}
        className="mt-5 grid gap-3 rounded-2xl border border-line bg-white p-5 sm:grid-cols-5"
      >
        <input
          required
          value={form.number}
          onChange={(e) => setForm({ ...form, number: e.target.value })}
          placeholder="Số phòng"
          className="rounded-lg border border-line px-3 py-2.5"
        />
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Tên phòng"
          className="rounded-lg border border-line px-3 py-2.5"
        />
        <input
          required
          type="number"
          value={form.floor}
          onChange={(e) => setForm({ ...form, floor: Number(e.target.value) })}
          placeholder="Tầng"
          className="rounded-lg border border-line px-3 py-2.5"
        />
        <input
          required
          value={form.roomTypeId}
          onChange={(e) => setForm({ ...form, roomTypeId: e.target.value })}
          placeholder="Room type ID"
          className="rounded-lg border border-line px-3 py-2.5"
        />
        <button className="rounded-lg bg-lagoon-600 px-4 py-2.5 text-sm font-semibold text-white">
          + Thêm phòng
        </button>
      </form>
      <div className="mt-5 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[650px] text-left text-sm">
          <thead className="bg-lagoon-50 text-muted">
            <tr>
              <th className="p-4">Số phòng</th>
              <th className="p-4">Loại</th>
              <th className="p-4">Giá</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((room) => (
              <tr key={room.id}>
                <td className="p-4 font-semibold">{room.number}</td>
                <td className="p-4">{room.roomTypeName}</td>
                <td className="p-4">{formatVND(room.pricePerNight)}</td>
                <td className="p-4">
                  <button
                    onClick={async () => {
                      try {
                        await setRoomAvailability(
                          hotelId,
                          room.id,
                          room.status !== "AVAILABLE",
                        );
                        load();
                      } catch (reason) {
                        setError(
                          getApiError(
                            reason,
                            "Không thể cập nhật trạng thái phòng.",
                          ),
                        );
                      }
                    }}
                    className={
                      room.status === "AVAILABLE" ? "text-moss" : "text-muted"
                    }
                  >
                    {room.status === "AVAILABLE" ? "Đang mở bán" : "Tạm đóng"}
                  </button>
                </td>
                <td className="p-4">
                  <button
                    onClick={async () => {
                      if (!confirm("Xóa phòng này?")) return;
                      try {
                        await deleteRoom(hotelId, room.id);
                        load();
                      } catch (reason) {
                        setError(getApiError(reason, "Không thể xóa phòng."));
                      }
                    }}
                    className="font-semibold text-coral"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default function Page() {
  return (
    <Suspense
      fallback={<div className="h-64 animate-pulse rounded-3xl bg-line/50" />}
    >
      <AdminRoomsPage />
    </Suspense>
  );
}
