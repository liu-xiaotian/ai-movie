import MovieDashboardClient from "./MovieDashboardClient";

export default function DashboardPage() {
  // token 验证通过 → 渲染客户端组件
  return <MovieDashboardClient />;
}
