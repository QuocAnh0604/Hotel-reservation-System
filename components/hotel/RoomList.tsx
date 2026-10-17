import { BedDouble } from "lucide-react";
import type { Room } from "@/types/room";
import { formatVND } from "@/utils/format";
import { RoomStatusBadge } from "@/components/common/RoomStatusBadge";

export function RoomList({ rooms }: { rooms: Room[] }) {
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
      {rooms.map((r) => (
        <li
          key={r.id}
          className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3.5"
        >
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-lagoon-50 text-lagoon-700">
              <BedDouble className="size-5" aria-hidden />
            </span>
            <div>
              <p className="font-semibold">Phòng {r.number}</p>
              <p className="text-sm text-muted">
                {r.roomTypeName} · Tầng {r.floor}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted">
              <span className="font-semibold text-ink">
                {formatVND(r.pricePerNight)}
              </span>{" "}
              / đêm
            </p>
            <RoomStatusBadge status={r.status} />
          </div>
        </li>
      ))}
    </ul>
  );
}
