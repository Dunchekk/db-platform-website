type CleanupMode = "dry-run" | "apply";

// Prisma подключается только после проверки аргументов, поэтому disconnect может быть undefined
let disconnectPrisma: (() => Promise<void>) | undefined;

function printUsage() {
  // Usage показывает, как правильно запускать скрипт
  console.error(
    "Использование: node dist/src/scripts/retentionCleanup.js --dry-run"
  );
  console.error(
    "          или: node dist/src/scripts/retentionCleanup.js --apply"
  );
}

function parseCleanupMode(args: string[]): CleanupMode {
  const hasDryRun = args.includes("--dry-run");
  const hasApply = args.includes("--apply");
  const unknownArgs = args.filter(
    (arg) => arg !== "--dry-run" && arg !== "--apply"
  );

  // Требуем ровно один явный режим, чтобы cleanup нельзя было запустить случайно
  if (unknownArgs.length > 0) {
    throw new Error(`Неизвестный аргумент: ${unknownArgs.join(", ")}`);
  }

  if (hasDryRun === hasApply) {
    throw new Error("Передай ровно один режим: --dry-run или --apply");
  }

  return hasDryRun ? "dry-run" : "apply";
}

async function main() {
  // process.argv содержит путь до node, путь до скрипта и аргументы после них
  const mode = parseCleanupMode(process.argv.slice(2));
  const dryRun = mode === "dry-run";

  // Dynamic import возвращает module object; деструктуризация достает named exports
  const [{ prisma }, { runRetentionCleanup }] = await Promise.all([
    import("../db"),
    import("../services/retention.service"),
  ]);

  // Сохраняем disconnect, чтобы закрыть Prisma connection в finally
  disconnectPrisma = () => prisma.$disconnect();

  console.log(`Retention cleanup запущен в режиме ${mode}`);

  // Все правила очистки живут в сервисе; CLI только выбирает dry-run/apply
  const summary = await runRetentionCleanup({ dryRun });

  console.log("Итог retention cleanup:");
  console.log(JSON.stringify(summary, null, 2));

  if (dryRun) {
    console.log("Dry-run завершен: изменения в базе не применялись");
  }
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    printUsage();
    process.exitCode = 1;
  })
  .finally(async () => {
    // Закрываем Prisma только если скрипт дошел до инициализации базы
    await disconnectPrisma?.();
  });
