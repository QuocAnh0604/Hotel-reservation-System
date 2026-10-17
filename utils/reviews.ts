import type { Review, ReviewSummary } from "@/types/review";

export function summarize(reviews: Review[]): ReviewSummary {
  const distribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  } as ReviewSummary["distribution"];
  let sum = 0;
  for (const r of reviews) {
    distribution[r.rating as 1 | 2 | 3 | 4 | 5] += 1;
    sum += r.rating;
  }
  return {
    average: reviews.length ? sum / reviews.length : 0,
    total: reviews.length,
    distribution,
  };
}
