"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { buttonClass } from "@/components/common/Button";
import { useAuth } from "@/context/AuthContext";

export function AdminLayout({ children }: { children: ReactNode }) {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-lagoon-900 text-white">
        <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6">
          <Link
            href="/admin/dashboard"
            className="font-display text-2xl font-semibold"
          >
            Stayvn{" "}
            <span className="font-sans text-xs font-normal text-white/60">
              ADMIN
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-1">
            <Link
              href="/admin/dashboard"
              className={buttonClass(
                "ghost",
                "sm",
                "text-white hover:bg-white/10",
              )}
            >
              Tổng quan
            </Link>
            <Link
              href="/admin/hotels"
              className={buttonClass(
                "ghost",
                "sm",
                "text-white hover:bg-white/10",
              )}
            >
              Khách sạn
            </Link>
            <Link
              href="/admin/reservations"
              className={buttonClass(
                "ghost",
                "sm",
                "text-white hover:bg-white/10",
              )}
            >
              Đặt phòng
            </Link>
            <Link
              href="/admin/reviews"
              className={buttonClass(
                "ghost",
                "sm",
                "text-white hover:bg-white/10",
              )}
            >
              Đánh giá
            </Link>
            <button
              onClick={() => {
                void logout();
              }}
              className={buttonClass(
                "ghost",
                "sm",
                "text-white hover:bg-white/10",
              )}
            >
              Đăng xuất
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
