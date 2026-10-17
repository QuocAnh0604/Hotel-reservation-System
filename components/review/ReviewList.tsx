import type { Review } from "@/types/review";
import { formatDate } from "@/utils/format";
import { RatingStars } from "@/components/common/RatingStars";

export function ReviewItem({ review }: { review: Review }) {
  return (
    <li className="rounded-2xl border border-line bg-white p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span
          className="grid size-10 shrink-0 place-items-center rounded-full bg-lagoon-100 font-semibold text-lagoon-700"
          aria-hidden
        >
          {review.guestName.split(" ").pop()?.[0]}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <p className="font-semibold">{review.guestName}</p>
            <time className="text-sm text-muted" dateTime={review.createdAt}>
              {formatDate(review.createdAt)}
            </time>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
            <RatingStars value={review.rating} size={14} />
            <span>Phòng {review.roomTypeName}</span>
          </div>
        </div>
      </div>
      <p className="mt-3 text-[15px] leading-relaxed text-ink/90">
        {review.comment}
      </p>
    </li>
  );
}

export function ReviewList({ reviews }: { reviews: Review[] }) {
  return (
    <ul className="space-y-3">
      {reviews.map((r) => (
        <ReviewItem key={r.id} review={r} />
      ))}
    </ul>
  );
}
