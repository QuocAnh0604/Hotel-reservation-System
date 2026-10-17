import type { User, UserRole } from "@/types/user";

export interface LoginRequest {
  email: string;
  password: string;
}
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
export interface TokenPair {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
}
export interface ApiUser {
  userId: number | string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  role: UserRole;
  guestId?: number | string;
}
export interface AuthResponse extends TokenPair {
  user: ApiUser;
}
export interface AuthState {
  user: User | null;
  guestId?: string;
  isAuthenticated: boolean;
  isLoading: boolean;
}
