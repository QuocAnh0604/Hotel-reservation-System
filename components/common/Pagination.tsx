import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

function pageList(page: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, page - 1, page, page + 1]);
  const nums = [...set]
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push("…");
    out.push(n);
  });
  return out;
}

export function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;
  const item =
    "grid size-10 place-items-center rounded-lg border text-sm font-medium transition-colors";
  return (
    <nav
      aria-label="Phân trang"
      className="flex flex-wrap items-center justify-center gap-1.5"
    >
      <button
        className={`${item} border-line bg-white hover:border-lagoon-600 disabled:opacity-40`}
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="Trang trước"
      >
        <ChevronLeft className="size-4" />
      </button>
      {pageList(page, totalPages).map((n, i) =>
        n === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-muted">
            …
          </span>
        ) : (
          <button
            key={n}
            onClick={() => onChange(n)}
            aria-current={n === page ? "page" : undefined}
            className={`${item} ${
              n === page
                ? "border-lagoon-600 bg-lagoon-600 text-white"
                : "border-line bg-white hover:border-lagoon-600"
            }`}
          >
            {n}
          </button>
        ),
      )}
      <button
        className={`${item} border-line bg-white hover:border-lagoon-600 disabled:opacity-40`}
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        aria-label="Trang sau"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
