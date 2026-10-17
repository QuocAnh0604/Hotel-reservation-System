"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { buttonClass } from "@/components/common/Button";
import { useAuth } from "@/context/AuthContext";

export function UserLayout({ children }: { children: ReactNode }) {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link
            href="/hotels"
            className="font-display text-2xl font-semibold text-lagoon-700"
          >
            Stayvn
          </Link>
          <nav className="flex items-center gap-1">
            <Link href="/hotels" className={buttonClass("ghost", "sm")}>
              Khách sạn
            </Link>
            <Link
              href="/my-reservations"
              className={buttonClass("ghost", "sm")}
            >
              Đặt phòng của tôi
            </Link>
            <button
              onClick={() => {
                void logout();
              }}
              className={buttonClass("secondary", "sm")}
            >
              Đăng xuất
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
