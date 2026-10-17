import { api } from "@/services/api";
import type { Reservation, ReservationStatus } from "@/types/reservation";
import type { SpringPage } from "@/types/common";
export interface ReservationApi {
  reservationId: number | string;
  hotelId: number | string;
  guestId?: number | string;
  roomTypeId: string;
  roomCount: number;
  startDate: string;
  endDate: string;
  status: ReservationStatus;
  totalAmount: number;
  guestName?: string;
  guestEmail?: string;
}
function mapReservation(value: ReservationApi): Reservation {
  const nights = Math.max(
    0,
    Math.ceil(
      (new Date(value.endDate).getTime() -
        new Date(value.startDate).getTime()) /
        86400000,
    ),
  );
  return {
    id: String(value.reservationId),
    userId: String(value.guestId ?? ""),
    hotelId: String(value.hotelId),
    roomId: value.roomTypeId,
    guestName: value.guestName ?? "",
    guestEmail: value.guestEmail ?? "",
    checkIn: value.startDate,
    checkOut: value.endDate,
    guests: value.roomCount,
    nights,
    total: value.totalAmount,
    status: value.status,
    createdAt: "",
  };
}
export async function listReservations(
  params: { guestId?: string; page?: number; size?: number } = {},
) {
  const { data } = await api.get<SpringPage<ReservationApi> | ReservationApi[]>(
    "/reservations",
    { params },
  );
  const content = Array.isArray(data) ? data : data.content;
  return Array.isArray(data)
    ? content.map(mapReservation)
    : { ...data, content: content.map(mapReservation) };
}
export async function getReservation(id: string) {
  return mapReservation(
    (await api.get<ReservationApi>(`/reservations/${id}`)).data,
  );
}
export async function createReservation(input: {
  hotelId: string;
  roomTypeId: string;
  roomCount: number;
  startDate: string;
  endDate: string;
}) {
  return mapReservation(
    (
      await api.post<ReservationApi>("/reservations", {
        ...input,
        hotelId: Number(input.hotelId) || input.hotelId,
      })
    ).data,
  );
}
export async function cancelReservation(id: string) {
  return mapReservation(
    (await api.patch<ReservationApi>(`/reservations/${id}/cancel`)).data,
  );
}
export async function updateReservationStatus(
  id: string,
  status: ReservationStatus,
) {
  return mapReservation(
    (await api.patch<ReservationApi>(`/reservations/${id}/status`, { status }))
      .data,
  );
}
