"use client";

import { useEffect, useState } from "react";
import { HelpCircle, Star } from "lucide-react";
import { Movie } from "@/types/movie";

export default function MovieDashboardClient() {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    fetch("/api/movies")
      .then((res) => res.json())
      .then((data) => setMovies(data));
  }, []);

  return (
    <div className="flex bg-[#F8F9FD] text-slate-800 font-sans">
      <main className="flex-1 overflow-y-auto p-12">
        <div className="pb-10">
          {/* Hero Banner */}
          <section className="relative h-[320px] rounded-3xl overflow-hidden mb-12 group">
            <img
              src="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=2000"
              className="absolute inset-0 w-full h-full object-cover brightness-50"
              alt="Interstellar"
            />
            <div className="relative z-10 p-12 h-full flex flex-col justify-center text-white">
              <h2 className="text-5xl font-bold mb-4">星际穿越</h2>
              <p className="max-w-md text-slate-200 mb-8 leading-relaxed">
                一组探险家通过太空中的虫洞，试图确保人类的生存。
              </p>
              <button className="flex items-center gap-2 bg-indigo-600 w-fit px-6 py-3 rounded-xl font-medium hover:bg-indigo-500 transition-colors">
                <HelpCircle size={18} className="rotate-180" /> 查看详情
              </button>
            </div>
          </section>

          {/* Cards Grid */}
          <section>
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-800">推荐项目</h3>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

// --- MovieCard 子组件 ---
interface MovieCardProps {
  movie: Movie;
}
const MovieCard = ({ movie }: MovieCardProps) => {
  const score = Number(movie.rating || 0);
  const starCount = Math.round(score / 2);
  return (
    <div className="flex gap-4 p-4 bg-white">
      <img
        src={movie.big_image}
        className="w-[100px] h-[140px]  rounded-lg object-cover shrink-0"
      />
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <h2 className="text-lg font-semibold truncate">
          {movie.title + " " + movie.year}
        </h2>

        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < starCount
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
          <span className="text-orange-500">{movie.rating}</span>
        </div>

        <div className="text-sm text-gray-600 line-clamp-2">
          {movie.description}
        </div>
      </div>
    </div>
  );
};
