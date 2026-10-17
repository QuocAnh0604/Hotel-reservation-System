export type ReservationStatus =
  | "CONFIRMED"
  | "PENDING"
  | "CANCELLED"
  | "COMPLETED"
  | "CHECKED_IN"
  | "CHECKED_OUT";

export interface Reservation {
  id: string;
  userId: string;
  hotelId: string;
  roomId: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  total: number;
  status: ReservationStatus;
  createdAt: string;
}
