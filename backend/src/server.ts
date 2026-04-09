import dotenv from "dotenv";
import express from "express";
import { checkDb, prisma } from "./db";
import cors from "cors";
dotenv.config();
const PORT = process.env.PORT || 6000;

const app = express();
app.use(cors()); // миддлвер для корс
app.use(express.json()); // миддлвер для жсонов

app.get("/", (req, res) => {
  res.status(200).json({ message: "WORKING!" });
});

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
