import dotenv from "dotenv";
import express from "express";
import { checkDb, prisma } from "./db";
import cors from "cors";
import apiRouter from "./routes";
import errorHandler from "./middleware/ErrorHandlingMiddleware";
import path from "path";
dotenv.config();
const PORT = process.env.PORT || 6000;

const app = express();
app.use(cors()); // миддлвер для корс
app.use(express.json()); // миддлвер для жсонов
app.use(express.static(path.resolve(__dirname, "static")));
app.use("/api", apiRouter);

// мидлвер для ошибко должен быть замыкающим -- поэтому внутри него мы не вызвали next()
app.use(errorHandler);

const start = async () => {
  try {
    checkDb(prisma);
    console.log(process.env.DATABASE_URL);
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  } catch (e) {
    console.log(e);
  }
};

start();
