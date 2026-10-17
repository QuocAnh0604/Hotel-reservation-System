export interface Paged<T> {
  items: T[];
  page: number; // bắt đầu từ 1
  size: number;
  total: number;
  totalPages: number;
}
