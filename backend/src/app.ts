import express from "express";
import cors from "cors";
import path from "path";
import apiRouter from "./routes";
import errorHandler from "./middleware/ErrorHandlingMiddleware";
import { env } from "./config/env";

const allowedCorsOrigins = env.CORS_ORIGINS.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const app = express();

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

// мидлвер для ошибок должен быть замыкающим -- поэтому внутри него мы не вызвали next()
app.use(errorHandler);
