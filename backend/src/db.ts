// database
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
export const prisma = new PrismaClient({ adapter });

export async function checkDb(dbClient: PrismaClient) {
  try {
    await dbClient.$queryRaw`SELECT 1`;
    console.log("DB OK");
  } catch (e) {
    console.error("DB ERROR", e);
  }
}
