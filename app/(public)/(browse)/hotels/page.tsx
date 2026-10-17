"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/common/Button";
import { Pagination } from "@/components/common/Pagination";
import {
  EmptyState,
  ErrorState,
  HotelCardSkeleton,
} from "@/components/common/states";
import { HotelCard } from "@/components/hotel/HotelCard";
import { listHotels } from "@/services/hotel.service";
import type { Hotel } from "@/types/hotel";
import { paginate } from "@/utils/paginate";

const PAGE_SIZE = 6;

export default function HotelsPage() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Hotel[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    listHotels({ page: 0, size: 50, location })
      .then((result) => {
        if (!active) return;
        setItems(result.content);
        setLocations([
          ...new Set(result.content.map((hotel) => hotel.location)),
        ]);
      })
      .catch((reason: unknown) => {
        if (active)
          setError(
            reason instanceof Error
              ? reason.message
              : "Không thể tải danh sách khách sạn.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [location]);

  const result = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = items.filter(
      (h) =>
        (!location || h.location === location) &&
        (!q ||
          h.name.toLowerCase().includes(q) ||
          h.location.toLowerCase().includes(q)),
    );
    return paginate(filtered, page, PAGE_SIZE);
  }, [query, location, page, items]);

  const reset = () => {
    setQuery("");
    setLocation("");
    setPage(1);
  };
  const chip = (active: boolean) =>
    `rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
      active
        ? "border-lagoon-600 bg-lagoon-600 text-white"
        : "border-line bg-white hover:border-lagoon-600"
    }`;

  return (
    <div>
      <section className="rounded-3xl bg-lagoon-900 px-5 py-10 text-white sm:px-10 sm:py-14">
        <h1 className="max-w-xl font-display text-3xl font-semibold leading-tight sm:text-5xl">
          Tìm nơi nghỉ cho chuyến đi tiếp theo
        </h1>
        <label className="relative mt-7 block max-w-xl">
          <span className="sr-only">Tìm theo địa điểm hoặc tên khách sạn</span>
          <Search
            className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Bạn muốn đến đâu? Ví dụ: Đà Nẵng"
            className="w-full rounded-xl bg-white py-3.5 pl-12 pr-4 text-[15px] text-ink placeholder:text-muted focus:outline-none focus:ring-4 focus:ring-lagoon-100/40"
          />
        </label>
      </section>

      <div
        className="mt-6 flex flex-wrap gap-2"
        role="group"
        aria-label="Lọc theo địa điểm"
      >
        <button
          className={chip(location === "")}
          onClick={() => {
            setLocation("");
            setPage(1);
          }}
        >
          Tất cả
        </button>
        {locations.map((l) => (
          <button
            key={l}
            className={chip(location === l)}
            aria-pressed={location === l}
            onClick={() => {
              setLocation(l);
              setPage(1);
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {error ? (
        <div className="mt-6">
          <ErrorState message={error} onRetry={() => setLocation(location)} />
        </div>
      ) : loading ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <HotelCardSkeleton key={item} />
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted" aria-live="polite">
          {result.total} khách sạn
        </p>
      )}

      <div className="mt-3">
        {!loading && !error && result.items.length === 0 ? (
          <EmptyState
            title="Không tìm thấy khách sạn phù hợp"
            description="Thử đổi từ khóa hoặc bỏ bộ lọc địa điểm."
            action={
              <Button variant="secondary" onClick={reset}>
                Xóa bộ lọc
              </Button>
            }
          />
        ) : !loading && !error ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {result.items.map((h) => (
                <HotelCard key={h.id} hotel={h} />
              ))}
            </div>
            <div className="mt-8">
              <Pagination
                page={result.page}
                totalPages={result.totalPages}
                onChange={setPage}
              />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
