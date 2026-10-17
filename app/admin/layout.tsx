import { Suspense, type ReactNode } from "react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
export const instant = false;
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center text-muted">
          Đang xác thực phiên đăng nhập…
        </div>
      }
    >
      <AuthGuard role="ADMIN">
        <AdminLayout>{children}</AdminLayout>
      </AuthGuard>
    </Suspense>
  );
}
