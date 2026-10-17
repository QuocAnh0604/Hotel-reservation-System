import Link from "next/link";
import { buttonClass } from "@/components/common/Button";
export default function ForbiddenPage() {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="font-display text-7xl font-semibold text-coral">403</p>
        <h1 className="mt-3 text-xl font-semibold">
          Bạn không có quyền truy cập
        </h1>
        <p className="mt-1 text-muted">
          Vui lòng đăng nhập bằng tài khoản phù hợp.
        </p>
        <Link href="/hotels" className={buttonClass("primary", "md", "mt-6")}>
          Về trang khách sạn
        </Link>
      </div>
    </main>
  );
}
