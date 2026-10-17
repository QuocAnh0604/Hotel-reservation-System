export interface DailyBreakdown {
  hotelId: number | string;
  date: string;
  rate: number;
}
export interface Rate {
  hotelId: number | string;
  date: string;
  rate: number;
}
export interface RateQuote {
  hotelId: number | string;
  checkin: string;
  checkout: string;
  nights: number;
  totalRate: number;
  dailyBreakdown?: DailyBreakdown[];
}
