import Link from "next/link";
import { buttonClass } from "@/components/common/Button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="font-display text-7xl font-semibold text-lagoon-600">
          404
        </p>
        <h1 className="mt-3 text-xl font-semibold">Không tìm thấy trang này</h1>
        <p className="mt-1 text-muted">
          Trang có thể đã bị xóa hoặc đường dẫn chưa đúng.
        </p>
        <Link href="/hotels" className={buttonClass("primary", "md", "mt-6")}>
          Về danh sách khách sạn
        </Link>
      </div>
    </main>
  );
}
