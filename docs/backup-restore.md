# Production Backup And Restore

Production-данные живут в двух местах:

- Postgres volume `postgres_data`: товары, заказы, оплаты, доставки, URL картинок.
- Backend uploads volume `backend_uploads`: загруженные файлы картинок товаров.

Docker volumes сохраняют данные при пересборке контейнеров, но это не backup. Backup по умолчанию складывается на VPS в `/opt/db-platform/backups` и игнорируется Git.

## Ручной Backup

Запускать на VPS:

```bash
cd /opt/db-platform
./scripts/backup-prod.sh
```

Скрипт создаёт папку с timestamp:

```text
backups/YYYY-MM-DD_HH-MM-SS/
  manifest.txt
  postgres.dump
  uploads.tar.gz
```

Скрипт ненадолго останавливает `backend` и `notification-worker`, оставляет `postgres` запущенным, создаёт дамп БД и архив uploads, потом запускает app-сервисы обратно. По умолчанию удаляются backup-папки старше 14 дней.

Retention можно поменять для одного запуска:

```bash
cd /opt/db-platform
BACKUP_RETENTION_DAYS=30 ./scripts/backup-prod.sh
```

Для deploy используется отдельный режим: app-сервисы после backup остаются остановленными до миграций и общего `docker compose up -d`.

```bash
cd /opt/db-platform
BACKUP_LEAVE_APP_STOPPED=1 ./scripts/backup-prod.sh
```

## Restore

Restore перезаписывает текущие production-данные. Сначала выбрать backup-папку:

```bash
cd /opt/db-platform
BACKUP_DIR=/opt/db-platform/backups/YYYY-MM-DD_HH-MM-SS
```

Остановить сервисы, которые могут писать в БД или uploads:

```bash
docker compose --env-file .env -f docker-compose.prod.yml stop backend notification-worker
```

Пересоздать production-БД из выбранного dump:

```bash
docker compose --env-file .env -f docker-compose.prod.yml exec -T postgres sh -c \
  'dropdb --if-exists -U "$POSTGRES_USER" "$POSTGRES_DB" && createdb -U "$POSTGRES_USER" "$POSTGRES_DB"'

docker compose --env-file .env -f docker-compose.prod.yml exec -T postgres sh -c \
  'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
  < "$BACKUP_DIR/postgres.dump"
```

Восстановить загруженные файлы в uploads volume:

```bash
docker compose --env-file .env -f docker-compose.prod.yml run --rm --no-deps --entrypoint sh backend -c \
  'find /app/dist/src/static/uploads -mindepth 1 -delete && tar -xzf - -C /app/dist/src/static/uploads' \
  < "$BACKUP_DIR/uploads.tar.gz"
```

Запустить приложение обратно:

```bash
docker compose --env-file .env -f docker-compose.prod.yml up -d backend notification-worker frontend
```

> Если перед запуском требуется пересборка образов, не использовать общий `up -d --build`:
> на этом VPS параллельная сборка может завершиться ошибкой `signal: killed`.
>
> Собирать backend, notification-worker и frontend последовательно:

```bash
DOCKER_BUILDKIT=0 COMPOSE_DOCKER_CLI_BUILD=0 docker compose --env-file .env -f docker-compose.prod.yml build backend
DOCKER_BUILDKIT=0 COMPOSE_DOCKER_CLI_BUILD=0 docker compose --env-file .env -f docker-compose.prod.yml build notification-worker
DOCKER_BUILDKIT=0 COMPOSE_DOCKER_CLI_BUILD=0 docker compose --env-file .env -f docker-compose.prod.yml build frontend
```

> После успешной раздельной сборки запускать сервисы обычной командой `up -d` выше, без `--build`.

Проверить сайт:

```bash
curl -f https://db-platform.ru
```

Потом в браузере проверить, что страницы товаров показывают загруженные картинки, а admin orders view открывается.
