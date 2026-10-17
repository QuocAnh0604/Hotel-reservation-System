import Link from "next/link";
import type { ReactNode } from "react";

interface Props {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: Props) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside
        className="relative hidden flex-col justify-between overflow-hidden bg-lagoon-900 p-10 text-white lg:flex"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,255,255,.06) 0 1px, transparent 1px 36px), repeating-linear-gradient(0deg, rgba(255,255,255,.06) 0 1px, transparent 1px 36px)",
        }}
      >
        <Link href="/hotels" className="font-display text-2xl font-semibold">
          Stayvn
        </Link>
        <div>
          <div className="inline-block rounded-md border-2 border-brass px-6 py-3 text-center">
            <p className="font-display text-6xl font-semibold leading-none text-brass">
              302
            </p>
            <p className="mt-1 text-sm text-white/70">Tầng 3</p>
          </div>
          <p className="mt-8 max-w-sm font-display text-3xl leading-snug">
            Chìa khóa phòng của bạn đang chờ ở đây.
          </p>
        </div>
        <p className="text-sm text-white/60">
          Hơn 8 khách sạn trên khắp Việt Nam.
        </p>
      </aside>

      <main className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <Link
            href="/hotels"
            className="mb-8 inline-block font-display text-2xl font-semibold text-lagoon-700 lg:hidden"
          >
            Stayvn
          </Link>
          <h1 className="font-display text-3xl font-semibold">{title}</h1>
          <p className="mt-2 text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-6 text-center text-sm text-muted">{footer}</p>
        </div>
      </main>
    </div>
  );
}
