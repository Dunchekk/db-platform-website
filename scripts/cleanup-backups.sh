#!/usr/bin/env bash

# Скрипт удаляет старые timestamp-папки backup из директории backups/

set -Eeuo pipefail

# ROOT_DIR — корень репозитория; по умолчанию вычисляется относительно этого файла
ROOT_DIR="${ROOT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"

# BACKUP_ROOT — папка, внутри которой лежат backup-директории
BACKUP_ROOT="${BACKUP_ROOT:-$ROOT_DIR/backups}"

# RETENTION_DAYS — сколько дней хранить backup; по умолчанию 14
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"

# Перед rm проверяем, что retention — число, а не случайная строка
if ! [[ "$RETENTION_DAYS" =~ ^[0-9]+$ ]]; then
  # Сообщение в stderr, потому что это ошибка конфигурации
  echo "BACKUP_RETENTION_DAYS must be a number" >&2
  exit 1
fi

# Если папки backups еще нет, удалять нечего — это не ошибка
if [[ ! -d "$BACKUP_ROOT" ]]; then
  # Пишем понятное сообщение и завершаем скрипт успешно
  echo "Backup root does not exist, nothing to clean: $BACKUP_ROOT"
  # Код 0 означает успешное завершение без действий
  exit 0
fi

# Логируем, какой каталог чистим и какой retention применяем
echo "Delete backups older than $RETENTION_DAYS days from $BACKUP_ROOT"

# Аргументы find вынесены в массив, чтобы каждое условие было отдельно подписано
find_args=(
  # Ищем только внутри backup root
  "$BACKUP_ROOT"
  # Не трогаем саму папку backups
  -mindepth 1
  # Не уходим глубже первого уровня вложенности
  -maxdepth 1
  # Удалять можно только директории, не файлы
  -type d
  # Берем только timestamp-папки, которые создает backup-prod.sh
  -name '????-??-??_??-??-??'
  # Берем только папки старше заданного количества дней
  -mtime +"$RETENTION_DAYS"
  # Печатаем путь перед удалением, чтобы в логах было видно, что удалили
  -print
  # Удаляем найденную timestamp-папку целиком
  -exec rm -rf {} +
)

# Запускаем find с подготовленными условиями
find "${find_args[@]}"
