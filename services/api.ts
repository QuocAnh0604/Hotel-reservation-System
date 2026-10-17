import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import type { ApiErrorResponse } from "@/types/common";
import type { TokenPair } from "@/types/auth";

const ACCESS_KEY = "stayvn.accessToken";
const REFRESH_KEY = "stayvn.refreshToken";
const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});
let refreshPromise: Promise<string | null> | null = null;

export function getAccessToken() {
  return typeof window === "undefined"
    ? null
    : localStorage.getItem(ACCESS_KEY);
}
export function getRefreshToken() {
  return typeof window === "undefined"
    ? null
    : localStorage.getItem(REFRESH_KEY);
}
export function saveTokens(tokens: TokenPair) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_KEY, tokens.accessToken);
  if (tokens.refreshToken)
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
}
export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem("stayvn.user");
}
export function getApiError(
  error: unknown,
  fallback = "Đã xảy ra lỗi. Vui lòng thử lại.",
) {
  const response = (error as AxiosError<ApiErrorResponse>).response;
  const data = response?.data;
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  if (response?.status === 400) return "Dữ liệu chưa hợp lệ.";
  if (response?.status === 401) return "Phiên đăng nhập đã hết hạn.";
  if (response?.status === 403)
    return "Bạn không có quyền thực hiện thao tác này.";
  if (response?.status === 404) return "Không tìm thấy dữ liệu.";
  if (response?.status === 409)
    return "Dữ liệu đang có xung đột hoặc phòng đã hết.";
  if (response?.status === 503) return "Dịch vụ backend hiện không khả dụng.";
  if (!response) return "Không thể kết nối đến máy chủ.";
  return fallback;
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined;
    if (
      error.response?.status !== 401 ||
      !original ||
      original._retry ||
      original.url?.includes("/auth/refresh")
    )
      return Promise.reject(error);
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearSession();
      return Promise.reject(error);
    }
    original._retry = true;
    refreshPromise ??= api
      .post<TokenPair>("/auth/refresh", { refreshToken })
      .then(({ data }) => {
        saveTokens(data);
        return data.accessToken;
      })
      .catch(() => {
        clearSession();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
    const accessToken = await refreshPromise;
    if (!accessToken) return Promise.reject(error);
    original.headers = original.headers ?? {};
    original.headers.Authorization = `Bearer ${accessToken}`;
    return api.request(original);
  },
);
