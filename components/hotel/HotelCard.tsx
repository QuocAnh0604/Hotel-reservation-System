import { MapPin } from "lucide-react";
import Link from "next/link";
import type { Hotel } from "@/types/hotel";
import { formatVND } from "@/utils/format";
import { RatingStars } from "@/components/common/RatingStars";
import { HotelCover } from "./HotelCover";

export function HotelCard({ hotel }: { hotel: Hotel }) {
  return (
    <Link
      href={`/hotels/${hotel.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition-colors hover:border-lagoon-600"
    >
      <HotelCover
        hue={hotel.coverHue}
        label={hotel.location}
        className="h-44"
      />
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-semibold leading-snug group-hover:text-lagoon-700">
          {hotel.name}
        </h3>
        <p className="mt-1.5 flex items-start gap-1.5 text-sm text-muted">
          <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
          {hotel.address}
        </p>
        <div className="mt-3 flex items-center gap-2 text-sm">
          <RatingStars value={hotel.avgRating} />
          <span className="font-semibold">{hotel.avgRating.toFixed(1)}</span>
          <span className="text-muted">({hotel.reviewCount} đánh giá)</span>
        </div>
        <p className="mt-auto pt-4 text-sm text-muted">
          Từ{" "}
          <span className="text-lg font-semibold text-ink">
            {formatVND(hotel.priceFrom)}
          </span>{" "}
          / đêm
        </p>
      </div>
    </Link>
  );
}
