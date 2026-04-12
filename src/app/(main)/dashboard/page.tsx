import MovieDashboardClient from "./MovieDashboardClient";
import movieData from "@/data/movies.json";
import type { Movie } from "@/types/movie";

const PAGE_SIZE = 9;

function getPageValue(page: string | string[] | undefined, totalPages: number) {
  const rawValue = Array.isArray(page) ? page[0] : page;
  const parsedPage = Number.parseInt(rawValue ?? "1", 10);

  if (Number.isNaN(parsedPage) || parsedPage < 1) {
    return 1;
  }

  return Math.min(parsedPage, totalPages);
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const movies = movieData as Movie[];
  const totalPages = Math.max(1, Math.ceil(movies.length / PAGE_SIZE));
  const currentPage = getPageValue((await searchParams).page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentMovies = movies.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <MovieDashboardClient
      initialMovies={currentMovies}
      pagination={{
        basePath: "/dashboard",
        currentPage,
        pageSize: PAGE_SIZE,
        totalItems: movies.length,
        totalPages,
      }}
    />
  );
}
