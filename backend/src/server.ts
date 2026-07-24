import express from "express";
import { checkDb, prisma } from "./db";
import cors from "cors";
import apiRouter from "./routes";
import errorHandler from "./middleware/ErrorHandlingMiddleware";
import path from "path";
import { logEvents, logger } from "./lib/logger";
import { env } from "./config/env";

const PORT = env.PORT;
const allowedCorsOrigins = env.CORS_ORIGINS
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const app = express();
app.set("trust proxy", 1); // иначе Express может видеть IP nginx/localhost, а не реального клиента. Тогда rate-limit будет считать всех одним человеком.
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, !origin || allowedCorsOrigins.includes(origin));
    },
  })
); // миддлвер для корс
app.use(express.json()); // миддлвер для жсонов
app.use(express.static(path.resolve(__dirname, "static")));
app.use("/api", apiRouter);

// мидлвер для ошибко должен быть замыкающим -- поэтому внутри него мы не вызвали next()
app.use(errorHandler);

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
