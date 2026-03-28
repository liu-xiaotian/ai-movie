// src/lib/prisma.ts
// import { PrismaClient } from "../generated/prisma"; // 根据你 output 路径调整
import { PrismaClient } from "@prisma/client"; // 直接导入官方路径
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

export const prisma = new PrismaClient({ adapter });
