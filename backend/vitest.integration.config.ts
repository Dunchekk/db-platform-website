import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/integration/**/*.test.ts"],
    setupFiles: ["test/setup/integrationEnv.ts"], // выполняются перед каждым тестовым файлом
    pool: "forks", // для workers используются отдельные дочерние процессы Node.js
    fileParallelism: false, // тестовые файлы запускаются по очереди, а не одновременно
  },
});
