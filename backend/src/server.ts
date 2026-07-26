import { checkDb, prisma } from "./db";
import { logEvents, logger } from "./lib/logger";
import { env } from "./config/env";
import { app } from "./app";

const PORT = env.PORT;

const start = async () => {
  try {
    await checkDb(prisma);
    app.listen(PORT, () =>
      logger.info(logEvents.serverStarted, {
        port: PORT,
      })
    );
  } catch (e) {
    logger.error(logEvents.serverStartFailed, {
      port: PORT,
      err: e,
    });
  }
};

start();
