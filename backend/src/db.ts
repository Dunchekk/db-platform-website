// database
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { logEvents, logger } from "./lib/logger";

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
export const prisma = new PrismaClient({ adapter });

export async function checkDb(dbClient: PrismaClient) {
  try {
    await dbClient.$queryRaw`SELECT 1`;
    logger.info(logEvents.dbCheckSucceeded, {});
  } catch (e) {
    logger.error(logEvents.dbCheckFailed, {
      err: e,
    });
    throw e;
  }
}
