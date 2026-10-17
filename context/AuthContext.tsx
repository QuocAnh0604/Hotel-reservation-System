"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  login as loginRequest,
  logout as logoutRequest,
  me as meRequest,
  register as registerRequest,
} from "@/services/auth.service";
import { clearSession, getAccessToken } from "@/services/api";
import type { AuthState } from "@/types/auth";
import type { RegisterRequest, LoginRequest } from "@/types/auth";
import type { User } from "@/types/user";

interface ContextValue extends AuthState {
  login(input: LoginRequest): Promise<User>;
  register(input: RegisterRequest): Promise<void>;
  logout(): Promise<void>;
}
const AuthContext = createContext<ContextValue | null>(null);
function mapUser(value: {
  userId: number | string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  role: User["role"];
  guestId?: number | string;
}): User & { guestId?: string } {
  return {
    id: String(value.userId),
    name:
      value.name ?? `${value.firstName ?? ""} ${value.lastName ?? ""}`.trim(),
    email: value.email,
    role: value.role,
    guestId: value.guestId == null ? undefined : String(value.guestId),
  };
}
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }
    meRequest()
      .then((value) => {
        const user = mapUser(value);
        setState({
          user,
          guestId: user.guestId,
          isAuthenticated: true,
          isLoading: false,
        });
      })
      .catch(() => {
        clearSession();
        setState({ user: null, isAuthenticated: false, isLoading: false });
      });
  }, []);
  const value = useMemo<ContextValue>(
    () => ({
      ...state,
      async login(input) {
        const response = await loginRequest(input);
        const user = mapUser(response.user);
        setState({
          user,
          guestId: user.guestId,
          isAuthenticated: true,
          isLoading: false,
        });
        return user;
      },
      async register(input) {
        await registerRequest(input);
      },
      async logout() {
        await logoutRequest();
        setState({ user: null, isAuthenticated: false, isLoading: false });
      },
    }),
    [state],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
