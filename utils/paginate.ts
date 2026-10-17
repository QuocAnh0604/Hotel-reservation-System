import type { Paged } from "@/types/api";

export function paginate<T>(all: T[], page: number, size: number): Paged<T> {
  const totalPages = Math.max(1, Math.ceil(all.length / size));
  const current = Math.min(Math.max(1, page), totalPages);
  return {
    items: all.slice((current - 1) * size, current * size),
    page: current,
    size,
    total: all.length,
    totalPages,
  };
}
