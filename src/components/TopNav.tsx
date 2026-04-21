"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Search, User } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import type { Movie } from "@/types/movie";

const DEBOUNCE_MS = 300;
const INITIAL_VISIBLE_COUNT = 8;
const LOAD_MORE_COUNT = 8;
const LOAD_MORE_THROTTLE_MS = 150;

export default function TopNav() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const resultsViewportRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const hasFetchedRef = useRef(false);
  const lastLoadMoreAtRef = useRef(0);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  useEffect(() => {
    if (!isOpen || hasFetchedRef.current) {
      return;
    }

    const controller = new AbortController();
    let ignore = false;

    const loadMovies = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch("/api/movies", {
          signal: controller.signal,
          cache: "force-cache",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch movies");
        }

        const data = (await response.json()) as Movie[];

        if (ignore) {
          return;
        }

        setAllMovies(data);
        hasFetchedRef.current = true;
      } catch (fetchError) {
        if (controller.signal.aborted || ignore) {
          return;
        }

        console.error("Failed to load movies for search", fetchError);
        setError("加载电影列表失败，请稍后重试。");
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadMovies().catch(() => {});

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [isOpen]);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [debouncedQuery]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen]);

  const normalizedQuery = debouncedQuery.toLowerCase();
  const matchedMovies = normalizedQuery
    ? allMovies.filter((movie) => {
        const title = movie.title.toLowerCase();
        const year = String(movie.year);

        return (
          title.includes(normalizedQuery) || year.includes(normalizedQuery)
        );
      })
    : [];
  const visibleMovies = matchedMovies.slice(0, visibleCount);
  const hasMore = visibleMovies.length < matchedMovies.length;

  useEffect(() => {
    if (!isOpen || !hasMore) {
      return;
    }

    const root = resultsViewportRef.current;
    const sentinel = sentinelRef.current;

    if (!root || !sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (!entry?.isIntersecting) {
          return;
        }

        const now = Date.now();

        if (now - lastLoadMoreAtRef.current < LOAD_MORE_THROTTLE_MS) {
          return;
        }

        lastLoadMoreAtRef.current = now;

        setVisibleCount((current) =>
          Math.min(current + LOAD_MORE_COUNT, matchedMovies.length),
        );
      },
      {
        root,
        rootMargin: "0px 0px 24px 0px",
        threshold: 0.1,
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isOpen, matchedMovies.length]);

  const shouldShowDropdown =
    isOpen && (query.trim().length > 0 || isLoading || error.length > 0);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextQuery = event.target.value;

    setQuery(nextQuery);
    setError("");

    if (nextQuery.trim()) {
      setIsOpen(true);
      return;
    }

    setIsOpen(false);
  };

  const handleInputFocus = () => {
    if (query.trim()) {
      setIsOpen(true);
    }
  };

  const handleResultClick = () => {
    setIsOpen(false);
    setQuery("");
    setDebouncedQuery("");
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-[color:var(--border-strong)] bg-[var(--surface-soft)] px-10 py-4 backdrop-blur-md transition-colors">
      <div className="relative flex items-center justify-between">
        <div className="w-40 flex-shrink-0" />

        <div ref={containerRef} className="relative mx-auto max-w-md flex-1">
          <div className="group relative">
            <Search
              className="absolute top-1/2 left-4 -translate-y-1/2 text-[var(--text-muted)] transition-colors group-focus-within:text-brand"
              size={18}
            />
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              placeholder="搜索电影"
              className={clsx(
                "w-full rounded-2xl border border-[color:var(--border-strong)] bg-[var(--surface-strong)] py-2.5 pr-4 pl-12",
                "text-sm text-[var(--text-strong)] shadow-sm outline-none transition-all placeholder:text-[var(--text-muted)]",
                "focus:border-brand focus:ring-4 focus:ring-brand/10",
              )}
            />
          </div>

          {shouldShowDropdown ? (
            <div className="absolute top-full right-0 left-0 z-40 mt-3 overflow-hidden rounded-2xl border border-[color:var(--border-strong)] bg-[var(--surface-strong)] shadow-2xl shadow-slate-900/10">
              {isLoading ? (
                <div className="px-4 py-5 text-sm text-[var(--text-medium)]">
                  正在搜索电影...
                </div>
              ) : error ? (
                <div className="px-4 py-5 text-sm text-red-500">{error}</div>
              ) : visibleMovies.length > 0 ? (
                <div
                  ref={resultsViewportRef}
                  className="max-h-80 overflow-y-auto py-2"
                >
                  {visibleMovies.map((movie) => (
                    <Link
                      key={movie.id}
                      href={{
                        pathname: "/projects/new",
                        query: {
                          autoStart: "1",
                          projectName: `${movie.title} 字幕翻译`,
                        },
                      }}
                      onClick={handleResultClick}
                      className="block px-4 py-3 transition-colors hover:bg-[var(--surface-soft)]"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="truncate text-sm font-semibold text-[var(--text-strong)]">
                          {movie.title}
                        </span>
                        <span className="shrink-0 text-xs font-medium text-[var(--text-muted)]">
                          {movie.year}
                        </span>
                      </div>
                    </Link>
                  ))}

                  {hasMore ? (
                    <div
                      ref={sentinelRef}
                      className="px-4 py-3 text-center text-xs text-[var(--text-muted)]"
                    >
                      加载更多...
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="px-4 py-5 text-sm text-[var(--text-medium)]">
                  未找到相关电影。
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="flex w-40 flex-shrink-0 items-center justify-end gap-6 text-[var(--text-medium)]">
          {/* <Link href="/account">
            <div className="group flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1 transition-all hover:bg-[var(--surface-strong)]">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <User size={18} />
              </div>
              <span className="text-sm font-bold text-[var(--text-strong)] transition-colors group-hover:text-brand">
                账户
              </span>
            </div>
          </Link> */}
        </div>
      </div>
    </header>
  );
}
