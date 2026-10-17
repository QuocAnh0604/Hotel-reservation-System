import { api } from "@/services/api";
import type { Rate, RateQuote } from "@/types/rate";
export async function getRates(hotelId: string, from: string, to: string) {
  return (
    await api.get<Rate[]>(`/hotels/${hotelId}/rates`, { params: { from, to } })
  ).data;
}
export async function quoteRate(
  hotelId: string,
  checkin: string,
  checkout: string,
) {
  return (
    await api.get<RateQuote>(`/internal/hotels/${hotelId}/rates/quote`, {
      params: { checkin, checkout },
    })
  ).data;
}
export async function createRate(
  hotelId: string,
  input: { date: string; rate: number },
) {
  return (await api.post<Rate>(`/hotels/${hotelId}/rates`, input)).data;
}
export async function updateRate(hotelId: string, date: string, rate: number) {
  return (
    await api.put<Rate>(`/hotels/${hotelId}/rates/${date}`, { date, rate })
  ).data;
}
export async function bulkRate(hotelId: string, dates: string[], rate: number) {
  return (await api.post(`/hotels/${hotelId}/rates/bulk`, { dates, rate }))
    .data;
}
export async function deleteRate(hotelId: string, date: string) {
  return api.delete(`/hotels/${hotelId}/rates/${date}`);
}
