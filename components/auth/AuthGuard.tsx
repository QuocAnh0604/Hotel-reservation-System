"use client";
import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
export function AuthGuard({
  children,
  role,
}: {
  children: ReactNode;
  role?: "USER" | "ADMIN";
}) {
  const { isLoading, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (role && user?.role !== role)))
      router.replace(
        !isAuthenticated
          ? `/login?redirect=${encodeURIComponent(pathname)}`
          : "/403",
      );
  }, [isLoading, isAuthenticated, user, role, router, pathname]);
  if (isLoading || !isAuthenticated || (role && user?.role !== role))
    return (
      <div className="grid min-h-[40vh] place-items-center text-muted">
        Đang xác thực phiên đăng nhập…
      </div>
    );
  return children;
}
