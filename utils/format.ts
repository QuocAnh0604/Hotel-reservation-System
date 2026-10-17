export function formatVND(amount: number): string {
  return `${new Intl.NumberFormat("vi-VN").format(amount)} ₫`;
}

/** "2026-09-14T…" -> "14/09/2026" (không phụ thuộc timezone nên SSR/CSR khớp nhau) */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}
