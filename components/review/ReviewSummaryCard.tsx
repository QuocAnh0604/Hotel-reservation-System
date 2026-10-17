import type { ReviewSummary } from "@/types/review";
import { RatingStars } from "@/components/common/RatingStars";

export function ReviewSummaryCard({ summary }: { summary: ReviewSummary }) {
  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-line bg-white p-5 sm:flex-row sm:items-center sm:gap-10">
      <div className="shrink-0">
        <p className="font-display text-6xl font-semibold leading-none">
          {summary.average.toFixed(1)}
        </p>
        <div className="mt-2">
          <RatingStars value={summary.average} size={18} />
        </div>
        <p className="mt-1.5 text-sm text-muted">{summary.total} đánh giá</p>
      </div>
      <ul className="flex-1 space-y-1.5" aria-label="Phân bố điểm đánh giá">
        {([5, 4, 3, 2, 1] as const).map((star) => {
          const n = summary.distribution[star];
          const pct = summary.total ? (n / summary.total) * 100 : 0;
          return (
            <li key={star} className="flex items-center gap-3 text-sm">
              <span className="w-12 shrink-0 text-muted">{star} sao</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-line/70">
                <span
                  className="block h-full rounded-full bg-brass"
                  style={{ width: `${pct}%` }}
                />
              </span>
              <span className="w-6 shrink-0 text-right tabular-nums text-muted">
                {n}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
