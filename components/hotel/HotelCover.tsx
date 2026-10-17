interface Props {
  hue: number;
  label: string;
  className?: string;
}

/** Ảnh bìa tạm: nền gradient + lưới cửa sổ. Thay bằng <Image> khi backend có ảnh. */
export function HotelCover({ hue, label, className = "" }: Props) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        backgroundImage: [
          "repeating-linear-gradient(90deg, rgba(255,255,255,.09) 0 1px, transparent 1px 30px)",
          "repeating-linear-gradient(0deg, rgba(255,255,255,.09) 0 1px, transparent 1px 30px)",
          `linear-gradient(140deg, hsl(${hue} 48% 26%), hsl(${(hue + 28) % 360} 52% 46%))`,
        ].join(","),
      }}
      aria-hidden
    >
      <span className="absolute bottom-3 left-4 font-display text-3xl font-semibold text-white/80">
        {label}
      </span>
    </div>
  );
}
