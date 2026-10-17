import { api } from "@/services/api";
import type { SpringPage } from "@/types/common";
import type { Room } from "@/types/room";
export interface RoomApi {
  roomId: number | string;
  roomTypeId: string;
  floor: number;
  number: string;
  hotelId: number | string;
  name?: string;
  roomTypeName?: string;
  available: boolean;
  pricePerNight?: number;
}
export interface RoomRequest {
  roomTypeId: string;
  floor: number;
  number: string;
  name: string;
  isAvailable: boolean;
}
export function mapRoom(value: RoomApi): Room {
  return {
    id: String(value.roomId),
    hotelId: String(value.hotelId),
    number: value.number,
    floor: value.floor,
    roomTypeId: value.roomTypeId,
    roomTypeName: value.roomTypeName ?? value.name ?? value.roomTypeId,
    status: value.available ? "AVAILABLE" : "UNAVAILABLE",
    pricePerNight: value.pricePerNight ?? 0,
  };
}
export async function listRooms(
  hotelId: string,
  params: {
    roomTypeId?: string;
    floor?: string;
    isAvailable?: string;
    page?: number;
    size?: number;
  } = {},
) {
  const { data } = await api.get<SpringPage<RoomApi>>(
    `/hotels/${hotelId}/rooms`,
    { params: { ...params, page: params.page ?? 0, size: params.size ?? 50 } },
  );
  return { ...data, content: data.content.map(mapRoom) };
}
export async function getRoom(hotelId: string, roomId: string) {
  return mapRoom(
    (await api.get<RoomApi>(`/hotels/${hotelId}/rooms/${roomId}`)).data,
  );
}
export async function createRoom(hotelId: string, input: RoomRequest) {
  return mapRoom(
    (await api.post<RoomApi>(`/hotels/${hotelId}/rooms`, input)).data,
  );
}
export async function updateRoom(
  hotelId: string,
  roomId: string,
  input: RoomRequest,
) {
  return mapRoom(
    (await api.put<RoomApi>(`/hotels/${hotelId}/rooms/${roomId}`, input)).data,
  );
}
export async function setRoomAvailability(
  hotelId: string,
  roomId: string,
  isAvailable: boolean,
) {
  return mapRoom(
    (
      await api.patch<RoomApi>(
        `/hotels/${hotelId}/rooms/${roomId}/availability`,
        { isAvailable },
      )
    ).data,
  );
}
export async function deleteRoom(hotelId: string, roomId: string) {
  return api.delete(`/hotels/${hotelId}/rooms/${roomId}`);
}
