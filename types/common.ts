export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
export interface ApiErrorResponse {
  message?: string;
  error?: string;
  errors?: Record<string, string | string[]>;
  status?: number;
}
