// eslint-disable-next-line import/no-relative-packages
import { Prisma, PrismaClient } from "../prisma/client";

export const db = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});
