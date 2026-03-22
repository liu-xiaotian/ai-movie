import React from "react";
import {
  Search,
  Folder,
  LayoutGrid,
  Zap,
  HelpCircle,
  Settings,
  User,
} from "lucide-react";

const MovieDashboard = () => {
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
              <p className="text-sm font-medium mb-2 opacity-80">推荐项目</p>
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
            <div className="flex justify-between items-end mb-6">
              <h3 className="text-2xl font-bold text-slate-800">推荐项目</h3>
              <button className="text-indigo-600 text-sm font-bold flex items-center gap-1">
                查看全部 <span className="text-lg">›</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-8">
              <MovieCard
                title="星际穿越"
                year="2014"
                desc="一组探险家通过太空中的虫洞，试图确保人类的生存。"
                tags={["科幻", "剧情"]}
                img="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=400"
              />
              <MovieCard
                title="银翼杀手 2049"
                year="2017"
                desc="年轻的银翼杀手 K 发现了一个埋藏已久的秘密，这引导他去寻找前银翼杀手瑞克·戴克。"
                tags={["科幻", "动作"]}
                img="https://images.unsplash.com/photo-1533928298208-27ff66555d8d?q=80&w=400"
              />
              <MovieCard
                title="降临"
                year="2016"
                desc="在十二艘神秘飞船出现在世界各地后，一位语言学家与军方合作，尝试与外星生命形式进行交..."
                tags={["科幻", "剧情"]}
                img="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400"
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

// --- Sub-component: Movie Card ---
const MovieCard = ({ title, year, desc, tags, img }: any) => (
  <div className="group cursor-pointer">
    <div className="aspect-video rounded-2xl overflow-hidden mb-4 shadow-sm">
      <img
        src={img}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
    </div>
    <div className="flex justify-between items-start mb-1">
      <h4 className="font-bold text-lg text-slate-800">{title}</h4>
      <span className="text-xs text-slate-400 mt-1.5">{year}</span>
    </div>
    <p className="text-slate-500 text-sm line-clamp-2 mb-4 leading-relaxed">
      {desc}
    </p>
    <div className="flex gap-2">
      {tags.map((tag: string) => (
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
