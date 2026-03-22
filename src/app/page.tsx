"use client";

import { useEffect, useState } from "react";
import { HelpCircle } from "lucide-react";
import { Movie } from "@/types/movie";

const MovieDashboard = () => {
  const [movies, setMovies] = useState<Movie[]>();
  // 使用 fetch 获取
  useEffect(() => {
    fetch("/api/movies")
      .then((res) => res.json())
      .then((data) => setMovies(data));
  }, []);
  return (
    <div className="flex h-screen bg-[#F8F9FD] text-slate-800 font-sans">
      {/* --- Main Area --- */}
      <main className="flex-1 overflow-y-auto p-12">
        {/* Content */}
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

            <div className="grid grid-cols-3 gap-8">
              {movies?.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

// --- Sub-component: Movie Card ---
interface MovieCardProps {
  movie: Movie;
}
const MovieCard = ({ movie }: MovieCardProps) => (
  <div className="group cursor-pointer">
    <div className="aspect-[2/3] rounded-[24px] overflow-hidden mb-4 shadow-sm border border-slate-100">
      <img
        src={movie.image}
        alt={movie.title}
        referrerPolicy="no-referrer" // 解决防盗链
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
    </div>
    <div className="flex justify-between items-start mb-1">
      <h4 className="font-bold text-lg text-slate-800">{movie.title}</h4>
      <span className="text-xs text-slate-400 mt-1.5">{movie.year}</span>
    </div>
    <p className="text-slate-500 text-sm line-clamp-2 mb-4 leading-relaxed">
      {movie.description}
    </p>
    <div className="flex gap-2">
      {movie.genre.map((tag: string) => (
        <span
          key={tag}
          className="px-3 py-1 bg-slate-100 text-slate-500 text-xs rounded-full"
        >
          {tag}
        </span>
      ))}
    </div>
  </div>
);

export default MovieDashboard;
