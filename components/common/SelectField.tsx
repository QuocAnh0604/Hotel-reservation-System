import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
}

export function SelectField({
  label,
  children,
  className = "",
  ...rest
}: Props) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <span className="relative block">
        <select
          className="w-full appearance-none rounded-lg border border-line bg-white py-2.5 pl-3.5 pr-9 text-[15px] focus:border-lagoon-600 focus:outline-none focus:ring-2 focus:ring-lagoon-600/20"
          {...rest}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
      </span>
    </label>
  );
}
