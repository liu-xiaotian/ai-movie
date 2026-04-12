"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HelpCircle, Star } from "lucide-react";
import type { Movie } from "@/types/movie";

interface PaginationProps {
  basePath: string;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

interface MovieDashboardClientProps {
  initialMovies?: Movie[];
  pagination?: PaginationProps;
}

const MAX_VISIBLE_PAGES = 5;

export default function MovieDashboardClient({
  initialMovies,
  pagination,
}: MovieDashboardClientProps) {
  const [movies, setMovies] = useState<Movie[]>(initialMovies ?? []);

  useEffect(() => {
    if (initialMovies) {
      return;
    }

    let ignore = false;

    fetch("/api/movies")
      .then((res) => res.json())
      .then((data: Movie[]) => {
        if (!ignore) {
          setMovies(data);
        }
      });

    return () => {
      ignore = true;
    };
  }, [initialMovies]);

  const displayedMovies = initialMovies ?? movies;
  const pageNumbers = (() => {
    if (!pagination) {
      return [];
    }

    const halfWindow = Math.floor(MAX_VISIBLE_PAGES / 2);
    let startPage = Math.max(1, pagination.currentPage - halfWindow);
    let endPage = Math.min(
      pagination.totalPages,
      startPage + MAX_VISIBLE_PAGES - 1,
    );

    startPage = Math.max(1, endPage - MAX_VISIBLE_PAGES + 1);

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, index) => startPage + index,
    );
  })();
  const rangeStart = pagination
    ? (pagination.currentPage - 1) * pagination.pageSize + 1
    : 0;
  const rangeEnd = pagination
    ? Math.min(rangeStart + displayedMovies.length - 1, pagination.totalItems)
    : 0;

  const createPageHref = (page: number) => {
    if (!pagination) {
      return "#";
    }

    return page <= 1
      ? pagination.basePath
      : `${pagination.basePath}?page=${page}`;
  };

  return (
    <div className="flex bg-[#F8F9FD] text-slate-800 font-sans">
      <main className="flex-1 overflow-y-auto p-12">
        <div className="pb-10">
          <section className="relative mb-12 h-[320px] overflow-hidden rounded-3xl group">
            <img
              src="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=2000"
              className="absolute inset-0 h-full w-full object-cover brightness-50"
              alt="Interstellar"
            />
            <div className="relative z-10 flex h-full flex-col justify-center p-12 text-white">
              <h2 className="mb-4 text-5xl font-bold">星际穿越</h2>
              <p className="mb-8 max-w-md leading-relaxed text-slate-200">
                一组探险家穿越虫洞深入未知宇宙，在有限时间里为人类寻找新的生存希望。
              </p>
              <button className="flex w-fit items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-medium transition-colors hover:bg-indigo-500">
                <HelpCircle size={18} className="rotate-180" /> 查看详情
              </button>
            </div>
          </section>

          <section>
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <h3 className="text-2xl font-bold text-slate-800">推荐项目</h3>
              {pagination ? (
                <p className="text-sm text-slate-500">
                  显示第 {rangeStart}-{rangeEnd} 项，共 {pagination.totalItems}{" "}
                  项
                </p>
              ) : null}
            </div>

            {displayedMovies.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                {displayedMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 px-8 py-16 text-center text-slate-500">
                暂无电影数据
              </div>
            )}

            {pagination && pageNumbers.length > 1 ? (
              <nav
                aria-label="Dashboard pagination"
                className="mt-10 flex flex-wrap items-center justify-center gap-2"
              >
                {pagination.currentPage > 1 ? (
                  <Link
                    href={createPageHref(pagination.currentPage - 1)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-indigo-200 hover:text-indigo-600"
                  >
                    上一页
                  </Link>
                ) : (
                  <span className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-400">
                    上一页
                  </span>
                )}

                {pageNumbers.map((pageNumber) =>
                  pageNumber === pagination.currentPage ? (
                    <span
                      key={pageNumber}
                      className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm"
                    >
                      {pageNumber}
                    </span>
                  ) : (
                    <Link
                      key={pageNumber}
                      href={createPageHref(pageNumber)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-indigo-200 hover:text-indigo-600"
                    >
                      {pageNumber}
                    </Link>
                  ),
                )}

                {pagination.currentPage < pagination.totalPages ? (
                  <Link
                    href={createPageHref(pagination.currentPage + 1)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-indigo-200 hover:text-indigo-600"
                  >
                    下一页
                  </Link>
                ) : (
                  <span className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-400">
                    下一页
                  </span>
                )}
              </nav>
            ) : null}
          </section>
        </div>
      </main>
    </div>
  );
}

interface MovieCardProps {
  movie: Movie;
}

function MovieCard({ movie }: MovieCardProps) {
  const score = Number(movie.rating || 0);
  const starCount = Math.round(score / 2);
  const projectName = `${movie.title} 字幕翻译`;

  return (
    <Link
      href={{
        pathname: "/projects/new",
        query: {
          autoStart: "1",
          projectName,
        },
      }}
      aria-label={`为 ${movie.title} 创建字幕项目`}
      className="block rounded-2xl transition-transform duration-200 hover:-translate-y-1"
    >
      <article className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm transition-shadow hover:shadow-lg hover:shadow-slate-200/70">
        <img
          src={movie.big_image}
          alt={movie.title}
          className="h-[140px] w-[100px] shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0 flex-1 flex flex-col gap-2">
          <h2 className="truncate text-lg font-semibold">
            {movie.title + " " + movie.year}
          </h2>

          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < starCount
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="text-orange-500">{movie.rating}</span>
          </div>

          <div className="line-clamp-2 text-sm text-gray-600">
            {movie.description}
          </div>
        </div>
      </article>
    </Link>
  );
}
