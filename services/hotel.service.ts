import { api } from "@/services/api";
import type { SpringPage } from "@/types/common";
import type { Hotel } from "@/types/hotel";
export interface HotelRequest {
  name: string;
  address: string;
  location: string;
}
export interface HotelApi {
  hotelId: number | string;
  name: string;
  address: string;
  location: string;
  description?: string;
  amenities?: string[];
  avgRating?: number;
  reviewCount?: number;
  priceFrom?: number;
}
export function mapHotel(value: HotelApi): Hotel {
  return {
    id: String(value.hotelId),
    name: value.name,
    address: value.address,
    location: value.location,
    description:
      value.description ?? `${value.name} nằm tại ${value.location}.`,
    amenities: value.amenities ?? [],
    avgRating: value.avgRating ?? 0,
    reviewCount: value.reviewCount ?? 0,
    priceFrom: value.priceFrom ?? 0,
    coverHue: 180,
  };
}
export async function listHotels(
  params: {
    page?: number;
    size?: number;
    sort?: string;
    location?: string;
  } = {},
) {
  const { data } = await api.get<SpringPage<HotelApi>>("/hotels", {
    params: {
      page: params.page ?? 0,
      size: params.size ?? 10,
      sort: params.sort,
      location: params.location || undefined,
    },
  });
  return { ...data, content: data.content.map(mapHotel) };
}
export async function getHotelById(id: string) {
  return mapHotel((await api.get<HotelApi>(`/hotels/${id}`)).data);
}
export async function createHotel(input: HotelRequest) {
  return mapHotel((await api.post<HotelApi>("/hotels", input)).data);
}
export async function updateHotel(id: string, input: HotelRequest) {
  return mapHotel((await api.put<HotelApi>(`/hotels/${id}`, input)).data);
}
export async function deleteHotel(id: string) {
  return api.delete(`/hotels/${id}`);
}
