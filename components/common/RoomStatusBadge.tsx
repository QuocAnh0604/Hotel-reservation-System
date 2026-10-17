import type { RoomStatus } from "@/types/room";

const map: Record<RoomStatus, { label: string; cls: string }> = {
  AVAILABLE: { label: "Còn trống", cls: "bg-moss-50 text-moss" },
  UNAVAILABLE: { label: "Không khả dụng", cls: "bg-line/60 text-muted" },
};

export function RoomStatusBadge({ status }: { status: RoomStatus }) {
  const { label, cls } = map[status];
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}
    >
      {label}
    </span>
  );
}
