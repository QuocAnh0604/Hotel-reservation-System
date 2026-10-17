export type RoomStatus = "AVAILABLE" | "UNAVAILABLE";

export interface RoomType {
  id: string;
  name: string;
}

export interface Room {
  id: string;
  hotelId: string;
  number: string;
  floor: number;
  roomTypeId: string;
  roomTypeName: string;
  status: RoomStatus;
  pricePerNight: number;
}
