import { api } from "@/services/api";
import type { Availability } from "@/types/availability";
export async function getAvailability(
  hotelId: string,
  roomTypeId: string,
  from: string,
  to: string,
) {
  return (
    await api.get<Availability>(
      `/hotels/${hotelId}/room-types/${roomTypeId}/availability`,
      { params: { from, to } },
    )
  ).data;
}
