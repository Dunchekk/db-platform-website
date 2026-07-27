#!/usr/bin/env bash

# Скрипт production backup:
# 1. создаёт timestamp-папку в backups/
# 2. временно останавливает сервисы, которые пишут в БД/uploads
# 3. делает dump Postgres и архив загруженных картинок
# 4. запускает app-сервисы обратно, если не включён deploy-режим
# 5. удаляет старые backup-папки по retention
#
# Важно: скрипт не пересобирает Docker images и не вызывает up --build.
# Особенности сборки на VPS остаются в deploy workflow/runbook.

# Строгий режим Bash: падать на ошибках, неинициализированных переменных
# и ошибках внутри pipeline.
set -Eeuo pipefail

# Пути можно переопределять через env-переменные, но по умолчанию всё
# считается относительно корня репозитория.
ROOT_DIR="${ROOT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
COMPOSE_FILE="${COMPOSE_FILE:-$ROOT_DIR/docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-$ROOT_DIR/.env}"
BACKUP_ROOT="${BACKUP_ROOT:-$ROOT_DIR/backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
LEAVE_APP_STOPPED="${BACKUP_LEAVE_APP_STOPPED:-0}"
# Обычный режим: после backup сервисы запускаются обратно.
# Deploy-режим: оставить backend и notification-worker остановленными до миграций.

# Имена папки backup и сервисов, которые надо остановить на время снимка.
TIMESTAMP="$(date +%Y-%m-%d_%H-%M-%S)"
BACKUP_DIR="$BACKUP_ROOT/$TIMESTAMP"
APP_SERVICES=(backend notification-worker)
COMPOSE=(docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE")
SERVICES_STOPPED=0

# Safety net: если скрипт упадёт после остановки app-сервисов,
# он попробует поднять их обратно.
restart_app_services() {
  if [[ "$SERVICES_STOPPED" == "1" ]]; then
    echo "Restart app services"
    "${COMPOSE[@]}" up -d "${APP_SERVICES[@]}"
  fi
}

trap restart_app_services EXIT

# Ранние проверки, чтобы не получить полусозданный backup из-за неверного пути.
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing env file: $ENV_FILE" >&2
  exit 1
fi

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "Missing compose file: $COMPOSE_FILE" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"

echo "Backup directory: $BACKUP_DIR"

# Manifest нужен для диагностики: когда создан backup, из какого commit
# и в каком состоянии были compose-сервисы.
{
  echo "created_at=$(date -Iseconds)"
  echo "root_dir=$ROOT_DIR"
  echo "compose_file=$COMPOSE_FILE"
  echo "env_file=$ENV_FILE"
  echo "git_commit=$(git -C "$ROOT_DIR" rev-parse HEAD 2>/dev/null || true)"
  echo
  echo "compose_services:"
  "${COMPOSE[@]}" ps
} > "$BACKUP_DIR/manifest.txt"

# Postgres должен быть запущен, иначе pg_dump не сможет подключиться.
echo "Ensure Postgres is running"
"${COMPOSE[@]}" up -d postgres

# Останавливаем только backend и worker: они могут писать заказы, оплаты,
# jobs и uploads. Postgres остаётся запущенным, чтобы снять dump.
echo "Stop app services for a consistent DB/uploads snapshot"
"${COMPOSE[@]}" stop "${APP_SERVICES[@]}"
SERVICES_STOPPED=1

# Делаем custom-format dump Postgres. Такой формат удобнее для pg_restore,
# чем plain SQL, и лучше подходит для production restore.
echo "Dump Postgres"
"${COMPOSE[@]}" exec -T postgres sh -c \
  'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' \
  > "$BACKUP_DIR/postgres.dump"

# Архивируем содержимое uploads volume через backend-контейнер,
# потому что именно туда volume примонтирован в docker-compose.prod.yml.
echo "Archive uploads"
"${COMPOSE[@]}" run --rm --no-deps --entrypoint tar backend \
  -czf - -C /app/dist/src/static/uploads . \
  > "$BACKUP_DIR/uploads.tar.gz"

# При ручном запуске сервисы возвращаются сразу. При deploy они остаются
# остановленными до миграций, а потом workflow делает общий docker compose up -d.
if [[ "$LEAVE_APP_STOPPED" == "1" ]]; then
  echo "Leave app services stopped after backup cleanup"
else
  echo "Restart app services"
  "${COMPOSE[@]}" up -d "${APP_SERVICES[@]}"
  SERVICES_STOPPED=0
  trap - EXIT
fi

# Удаляем только timestamp-папки backup старше RETENTION_DAYS.
# Шаблон имени ограничивает rm только нашими backup-директориями.
if [[ "$RETENTION_DAYS" =~ ^[0-9]+$ ]]; then
  echo "Delete backups older than $RETENTION_DAYS days"
  find "$BACKUP_ROOT" \
    -mindepth 1 \
    -maxdepth 1 \
    -type d \
    -name '????-??-??_??-??-??' \
    -mtime +"$RETENTION_DAYS" \
    -exec rm -rf {} +
else
  echo "Skip retention cleanup: BACKUP_RETENTION_DAYS is not a number"
fi

echo "Backup completed: $BACKUP_DIR"

# В deploy-режиме это успешное завершение: сервисы специально оставлены
# остановленными, поэтому отключаем safety trap.
if [[ "$LEAVE_APP_STOPPED" == "1" ]]; then
  SERVICES_STOPPED=0
  trap - EXIT
fi
