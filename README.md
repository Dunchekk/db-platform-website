# DB Platform Website

Полноценная e-commerce платформа для авторского бренда/малого магазина: витрина товаров, корзина, оформление заказа, расчет доставки через CDEK, оплата через YooKassa, админская часть, обработка webhook-ов, email-уведомления и production-деплой на VPS.

Проект сделан как самостоятельное fullstack-решение: данные товаров, заказов, оплат и доставок хранятся в PostgreSQL, backend отвечает за бизнес-логику и интеграции, frontend синхронизирует сложный layered UI с URL, production-инфраструктура включает Docker, CI/CD и backup/restore сценарии.

Production: [https://db-platform.ru](https://db-platform.ru)

Проект развёрнут и доступен в тестовом режиме: создаёт заказы, рассчитывает доставку и проводит тестовые платежи. Подключение боевого эквайринга ожидает оформления документов заказчиком.

## Содержание

- [Возможности](#возможности)
- [Стек](#стек)
- [Архитектура](#архитектура)
- [Основные сценарии](#основные-сценарии)
- [База данных](#база-данных)
- [API](#api)
- [Качество и надежность](#качество-и-надежность)
- [Локальный запуск](#локальный-запуск)
- [Тесты и проверки](#тесты-и-проверки)
- [Production и backup](#production-и-backup)
- [Структура проекта](#структура-проекта)

## Возможности

- Каталог объектов с карточками, страницами карточек, галереей изображений и характеристиками.
- Корзина с сохранением в `localStorage` через Zustand persist.
- Страница оформления заказа с контактными данными, выбором города, выбором ПВЗ/постамата CDEK и расчетом стоимости доставки.
- Создание платежа YooKassa и редирект пользователя на страницу оплаты.
- Проверка статуса платежа после возврата пользователя на сайт.
- Webhook YooKassa для серверного подтверждения оплаты.
- Автоматическая регистрация отправления в CDEK после успешной оплаты.

- Админская авторизация по JWT.
- Админское управление товарами: создание, редактирование, удаление, загрузка изображений, изменение порядка изображений товара и порядка карточки в каталоге.
- Админский виджет заказов с поиском, сортировкой, пагинацией, статусами оплаты/доставки и трек-номерами.

- Production-деплой через GitHub Actions на VPS.
- Backup/restore для PostgreSQL и загруженных файлов.
- Очередь email-уведомлений о заказе и отдельный notification worker.

## Стек

Frontend:

- React 19
- TypeScript
- React Router 7
- Zustand
- CSS Modules
- Webpack 5
- Vitest
- Playwright
- ESLint, Prettier

Backend:

- Node.js 22
- Express 5
- TypeScript
- Prisma 7
- PostgreSQL 17
- YooKassa SDK
- CDEK API
- Nodemailer
- Argon2
- JOSE/JWT
- Multer
- express-rate-limit
- Vitest, Supertest
- ESLint, Prettier

Infrastructure:

- Docker, Docker Compose
- Nginx для раздачи frontend SPA
- GitHub Actions
- Production backup scripts

## Архитектура

Проект разделен на два приложения:

- `frontend` - React SPA, пользовательский и админский интерфейс магазина.
- `backend` - Express API, бизнес-логика заказов, платежей, доставок, файлов и уведомлений.

У интернет магазина авторский эксперементальный дизайн. Frontend построен вокруг layered UI. Вместо классических отдельных страниц интерфейс открывает слои:

- `about`
- `objects`
- `details`
- `info`
- `checkout`

Состояние слоев хранится в `features/layer-switching/layers.store.ts`, а URL рассчитывается из текущего состояния и обратно. Например, `/object/:id/checkout` восстанавливает открытый объект и полу-прозрачный checkout-слой сверху. Это делает интерфейс интерактивным и соотсветсвует задуманному дизайну, но сохраняет нормальную навигацию, deep links и поведение браузерной истории.

Backend организован по слоям:

- `routes` принимают HTTP-запросы;
- `controllers` валидируют вход и управляют request/response;
- `services` содержат бизнес-логику заказов, платежей, доставок и уведомлений;
- `helpers` инкапсулируют повторяемую валидацию и преобразования;
- `middleware` отвечает за авторизацию, роли, upload, rate limiting и обработку ошибок.

## Основные сценарии

### Покупка

1. Пользователь добавляет товар в корзину.
2. Frontend считает состав корзины и параметры упаковки.
3. Пользователь выбирает город и ПВЗ/постамат CDEK.
4. Frontend запрашивает расчет доставки.
5. При отправке checkout backend заново берет цены и параметры товаров из БД, пересчитывает subtotal и доставку на сервере.
6. Backend создает заказ и позиции заказа в транзакции.
7. Backend создает или переиспользует текущий платеж YooKassa.
8. Frontend перенаправляет пользователя на `confirmationUrl`.
9. После возврата с оплаты frontend несколько раз опрашивает статус платежа.
10. YooKassa webhook подтверждает оплату на сервере.
11. Backend переводит заказ в `PAID`, создает отправление CDEK и ставит email-задачу в очередь.
12. Worker отправляет письмо и помечает задачу как `SENT`.

##### Идемпотентность checkout

Frontend создает `checkoutAttemptKey` на основании актуальной попытки оформления. Backend хранит его как уникальный ключ заказа. Если пользователь повторно отправляет тот же checkout, backend возвращает уже созданный заказ и платеж, не создавая дубли заказов, позиций и оплат.

##### Обработка платежей

Платежи хранятся отдельно от заказов. У заказа есть `currentPaymentId`, а история платежей остается в таблице `Payment`. Это позволяет:

- переиспользовать активный pending-платеж;
- не пересоздавать успешный платеж;
- отличать явный `FAILED` от неопределенного `PROVIDER_UNKNOWN`;
- восстанавливать состояние платежа через idempotence key YooKassa;
- игнорировать устаревшие webhook-и не текущих платежей.

### Доставка

CDEK используется в четырех местах:

- подсказки городов;
- список доступных ПВЗ/постаматов под габариты корзины;
- расчет цены доставки;
- регистрация отправления после оплаты.

Параметры упаковки хранятся у товара и копируются в `OrderItem` при создании заказа. Поэтому уже оформленный заказ не ломается, если администратор позже изменит карточку товара.

Использовался [Официальный API CDEK](https://apidoc.cdek.ru/).

### Админка

Администратор авторизуется через `/admin`. Backend проверяет пароль через Argon2 и выдает JWT с ролью `ADMIN`. Защищенные операции используют role middleware.

Админ может:

- создавать и редактировать товары;
- задавать цену, позицию, характеристики и параметры упаковки;
- загружать изображения;
- удалять изображения;
- менять порядок изображений;
- смотреть заказы в таблице;
- искать заказы по клиенту, контактам, городу, адресу, товарам, id платежа, трек-номеру;
- сортировать заказы по дате и сумме.

## База данных

База описана в [backend/prisma/schema.prisma](backend/prisma/schema.prisma).

Ключевые сущности:

- `Admin` - административный пользователь.
- `Item` - товар/объект витрины.
- `ItemPoint` - список особенностей товара.
- `ItemInfo` - структурированные характеристики товара.
- `ItemImage` - изображения товара с сортировкой.
- `Order` - заказ, покупатель, доставка, subtotal/total и текущий платеж.
- `OrderItem` - снимок товара внутри заказа: название, цена, количество, габариты.
- `Payment` - платеж YooKassa, idempotence key, provider id, статус, confirmation URL.
- `Shipment` - отправление CDEK, статус, tracking number, provider shipment id.
- `NotificationJob` - задача фоновой отправки email.

В модели используются enum-статусы для заказов, платежей, доставок и notification jobs. Для связей, которые часто запрашиваются, добавлены индексы. Уникальные ограничения защищают критичные инварианты: один `checkoutAttemptKey`, один текущий платеж у заказа, один shipment на заказ, одна email-задача нужного типа на заказ.

## API

Основные backend routes:

| Method   | Route                                                   | Назначение                            |
| -------- | ------------------------------------------------------- | ------------------------------------- |
| `POST`   | `/api/auth/login`                                       | Админская авторизация                 |
| `GET`    | `/api/auth/session`                                     | Проверка JWT-сессии                   |
| `GET`    | `/api/items`                                            | Получить товары                       |
| `POST`   | `/api/items`                                            | Создать товар, `ADMIN`                |
| `PUT`    | `/api/items/:id`                                        | Обновить товар, `ADMIN`               |
| `DELETE` | `/api/items/:id`                                        | Удалить товар, `ADMIN`                |
| `POST`   | `/api/images/:id`                                       | Загрузить изображение товара, `ADMIN` |
| `DELETE` | `/api/images/:id/:imageId`                              | Удалить изображение, `ADMIN`          |
| `PATCH`  | `/api/images/:id`                                       | Поменять порядок изображений, `ADMIN` |
| `GET`    | `/api/cdek/cities`                                      | Подсказки городов CDEK                |
| `GET`    | `/api/cdek/delivery-points`                             | ПВЗ/постаматы CDEK                    |
| `POST`   | `/api/cdek/delivery-price`                              | Расчет доставки                       |
| `POST`   | `/api/checkout`                                         | Создание заказа и платежа             |
| `GET`    | `/api/payment/order/:orderId/payment/:paymentId/status` | Проверка статуса оплаты               |
| `POST`   | `/api/payment/webhook/youkassa/:secret`                 | YooKassa webhook                      |
| `GET`    | `/api/orders`                                           | Таблица заказов, `ADMIN`              |

## Качество и надежность

В проекте есть несколько практик, которые важны для production-like e-commerce:

- Серверный пересчет цены заказа: frontend отправляет данные корзины, но backend берет цену и параметры упаковки из БД.
- Транзакции Prisma при создании заказов и изменении связанных сущностей.
- Идемпотентный checkout через `checkoutAttemptKey`.
- Идемпотентная обработка успешных payment webhook-ов: повторный webhook не создает дубли отправлений и email-задач.
- Проверка актуального статуса платежа у YooKassa перед применением webhook.
- Отдельный статус `PROVIDER_UNKNOWN` для сетевых/неопределенных ошибок платежного провайдера.
- Локальная блокировка создания CDEK shipment через уникальный `orderId` и обработку race condition.
- Очередь notification jobs с `PROCESSING`, `lockedAt`, requeue stale locks и лимитом попыток.
- Rate limiting для login, checkout, CDEK, payment status и webhook routes.
- JWT role-based доступ к админским операциям.
- Санитизация имен загружаемых файлов.
- Структурированные JSON-логи с event name и payload.
- CI проверяет типы, lint, unit, integration и e2e tests перед production deploy.
- Перед production-миграциями запускается backup БД и uploads.

## Локальный запуск

Нужен Node.js 22 и PostgreSQL.

### Backend

```bash
cd backend
npm ci
npm run generate
npx prisma migrate deploy
npm run start
```

Backend ожидает переменные окружения в `backend/.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/db_platform
PORT=5000
CORS_ORIGINS=http://localhost:8080

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD_HASH=<argon2-hash>
JWT_SECRET=<long-random-secret>

YOUKASSA_WEBHOOK_SECRET=<webhook-secret>
SHOP_ID=<yookassa-shop-id>
YOUKASSA_SECRET_KEY=<yookassa-secret-key>
FRONTEND_RETURN_URL=http://localhost:8080/checkout

CDEK_BASE_URL=<cdek-api-url>
CDEK_CLIENT_ID=<cdek-client-id>
CDEK_CLIENT_SECRET=<cdek-client-secret>
CDEK_COUNTRY_CODE=RU

MAIL_USER=<email-user>
MAIL_APP_PASSWORD=<email-app-password>
```

Notification worker запускается отдельно:

```bash
cd backend
npm run worker:notifications
```

### Frontend

```bash
cd frontend
npm ci
npm run start
```

По умолчанию frontend dev server запускается на `http://127.0.0.1:8080`, а API URL берется из build-time переменной `BACK_API_URL`. Если переменная не задана, используется `http://localhost:5000`.

Полный checkout локально требует валидные доступы YooKassa, CDEK и SMTP. Тесты мокают внешние интеграции, поэтому их можно запускать без реальных провайдеров.

## Тесты и проверки

Frontend:

```bash
cd frontend
npm run type-check
npm run lint
npm run test:unit
npm run test:integration
npm run test:e2e
```

Backend:

```bash
cd backend
npm run type-check
npm run lint
npm run test:unit
npm run test:integration
```

Что покрыто:

- утилиты синхронизации layered UI и URL;
- checkout store;
- positive integer parsing;
- backend validation helpers;
- маппинг статусов YooKassa;
- создание checkout-заказа;
- webhook-обработка оплаты;
- идемпотентность повторных webhook-ов;
- admin orders API;
- notification job worker logic;
- e2e smoke-сценарий оформления заказа до редиректа на оплату.

## Production и backup

Production собирается через `docker-compose.prod.yml`:

- `postgres` - PostgreSQL 17;
- `backend` - Express API;
- `notification-worker` - отдельный процесс обработки email jobs;
- `frontend` - статическая сборка React SPA под Nginx.

Деплой запускается GitHub Actions workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) при push в `main`:

1. Устанавливает зависимости frontend/backend.
2. Запускает type-check, lint, unit, integration и e2e tests.
3. Подключается к VPS.
4. Забирает последнюю версию `main`.
5. Делает backup production-данных.
6. Последовательно собирает Docker images.
7. Применяет Prisma migrations.
8. Поднимает контейнеры.
9. Выполняет health check production URL.

Backup описан в [docs/backup-restore.md](docs/backup-restore.md). Скрипт [scripts/backup-prod.sh](scripts/backup-prod.sh):

- сохраняет custom-format dump PostgreSQL;
- архивирует загруженные изображения;
- пишет manifest с commit и состоянием compose-сервисов;
- умеет оставлять app-сервисы остановленными для безопасного deploy;
- удаляет старые backup-папки по retention.

## Структура проекта

```text
.
├── backend
│   ├── prisma
│   │   ├── migrations
│   │   └── schema.prisma
│   ├── src
│   │   ├── controllers
│   │   ├── helpers
│   │   ├── middleware
│   │   ├── routes
│   │   ├── services
│   │   └── workers
│   └── test
│       ├── integration
│       └── unit
├── frontend
│   ├── config
│   ├── public
│   ├── src
│   │   ├── admin
│   │   ├── app
│   │   ├── components
│   │   ├── features
│   │   ├── layers
│   │   └── shared
│   └── tests
│       ├── e2e
│       ├── integration
│       └── unit
├── docs
├── scripts
└── docker-compose.prod.yml
```
