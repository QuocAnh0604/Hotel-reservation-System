import Link from "next/link";
import type { ReactNode } from "react";
import { buttonClass } from "@/components/common/Button";

/** Header hiện luôn hiển thị nút Đăng nhập/Đăng ký; sau này đổi theo useAuth(). */
export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/hotels"
            className="font-display text-2xl font-semibold text-lagoon-700"
          >
            Stayvn
          </Link>
          <nav
            className="flex items-center gap-1.5 sm:gap-2"
            aria-label="Điều hướng chính"
          >
            <Link
              href="/hotels"
              className={buttonClass("ghost", "sm", "hidden sm:inline-flex")}
            >
              Khách sạn
            </Link>
            <Link href="/login" className={buttonClass("ghost", "sm")}>
              Đăng nhập
            </Link>
            <Link href="/register" className={buttonClass("primary", "sm")}>
              Đăng ký
            </Link>
          </nav>
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </div>
      <footer className="border-t border-line py-6 text-center text-sm text-muted">
        © 2026 Stayvn. Đặt phòng khách sạn trên khắp Việt Nam.
      </footer>
    </div>
  );
}
