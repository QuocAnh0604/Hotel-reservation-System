import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ApiUser,
} from "@/types/auth";
import { api, clearSession, saveTokens } from "@/services/api";
export async function login(input: LoginRequest) {
  const { data } = await api.post<AuthResponse>("/auth/login", input);
  saveTokens(data);
  localStorage.setItem("stayvn.user", JSON.stringify(data.user));
  return data;
}
export async function register(input: RegisterRequest) {
  return (await api.post("/auth/register", input)).data;
}
export async function me() {
  return (await api.get<ApiUser>("/auth/me")).data;
}
export async function logout() {
  try {
    await api.post("/auth/logout");
  } finally {
    clearSession();
  }
}
