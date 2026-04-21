import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import AccountPageClient, { type AccountPageData } from "./AccountPageClient";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function formatRelativeTime(date: Date) {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} 个月前`;

  const years = Math.floor(months / 12);
  return `${years} 年前`;
}

function getActiveDays(createdAt: Date) {
  const diff = Date.now() - createdAt.getTime();
  return Math.max(1, Math.ceil(diff / 86400000));
}

function getInitials(name: string, email: string) {
  const source = name.trim() || email.trim();
  const segments = source.split(/\s+/).filter(Boolean);

  if (segments.length >= 2) {
    return `${segments[0][0]}${segments[1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

async function getAccountPageData(): Promise<AccountPageData | null> {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const recentThreshold = new Date();
  recentThreshold.setDate(recentThreshold.getDate() - 30);

  const [
    user,
    totalProjects,
    inProgressProjects,
    recentProjectsCount,
    subtitleEntriesCount,
    recentProjects,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    }),
    prisma.project.count({
      where: { userId: payload.userId },
    }),
    prisma.project.count({
      where: {
        userId: payload.userId,
        status: "IN_PROGRESS",
      },
    }),
    prisma.project.count({
      where: {
        userId: payload.userId,
        createdAt: { gte: recentThreshold },
      },
    }),
    prisma.subtitleEntry.count({
      where: {
        project: {
          userId: payload.userId,
        },
      },
    }),
    prisma.project.findMany({
      where: { userId: payload.userId },
      orderBy: { updatedAt: "desc" },
      take: 3,
      select: {
        id: true,
        title: true,
        status: true,
        progress: true,
        updatedAt: true,
        createdAt: true,
      },
    }),
  ]);

  if (!user) return null;

  return {
    profile: {
      id: user.id,
      name: user.name,
      email: user.email,
      initials: getInitials(user.name, user.email),
      joinedAt: formatDate(user.createdAt),
    },
    stats: {
      totalProjects,
      inProgressProjects,
      recentProjectsCount,
      subtitleEntriesCount,
      activeDays: getActiveDays(user.createdAt),
    },
    overview: {
      latestActivity:
        recentProjects[0] != null
          ? formatRelativeTime(recentProjects[0].updatedAt)
          : "暂无项目活动",
      accountStatus: "已登录",
      workspaceState: totalProjects > 0 ? "正在使用中" : "等待创建第一个项目",
    },
    recentProjects: recentProjects.map((project) => ({
      id: project.id,
      title: project.title,
      status: project.status,
      progress: project.progress,
      updatedLabel: formatRelativeTime(project.updatedAt),
      createdLabel: formatDate(project.createdAt),
    })),
  };
}

export default async function AccountPage() {
  const data = await getAccountPageData();

  if (!data) {
    redirect("/login");
  }

  return <AccountPageClient data={data} />;
}
