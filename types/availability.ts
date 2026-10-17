export interface DailyAvailability {
  date: string;
  available: number;
}
export interface Availability {
  hotelId: number | string;
  roomTypeId: string;
  dailyAvailability: DailyAvailability[];
}
