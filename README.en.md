# DB Platform Website

A full-featured e-commerce platform for an independent brand/small store: product catalog, cart, checkout, CDEK delivery calculation, YooKassa payments, admin area, webhook handling, email notifications, and VPS production deployment.

The project is built as a standalone fullstack solution: products, orders, payments, and shipments are stored in PostgreSQL, the backend owns business logic and integrations, the frontend syncs a complex layered UI with the URL, and production infrastructure includes Docker, CI/CD, and backup/restore workflows.

Production: [https://db-platform.ru](https://db-platform.ru)

## Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Core Flows](#core-flows)
- [Database](#database)
- [API](#api)
- [Quality And Reliability](#quality-and-reliability)
- [Local Setup](#local-setup)
- [Tests And Checks](#tests-and-checks)
- [Production And Backup](#production-and-backup)
- [Project Structure](#project-structure)

## Features

- Product catalog with cards, product card pages, image gallery, and product attributes.
- Persistent cart stored in `localStorage` via Zustand persist.
- Checkout page with customer fields, city selection, CDEK pickup point/postamat selection, and delivery price calculation.
- YooKassa payment creation and redirect to payment confirmation.
- Payment status polling after the user returns to the website.
- YooKassa webhook for server-side payment confirmation.
- Automatic CDEK shipment registration after a successful payment.

- Admin authentication with JWT.
- Admin product management: create, edit, delete, upload images, reorder product images, and reorder product cards in the catalog.
- Admin orders widget with search, sorting, pagination, payment/shipment statuses, and tracking numbers.

- Production deployment to a VPS through GitHub Actions.
- Backup/restore for PostgreSQL and uploaded files.
- Email notification queue with a separate notification worker.

## Tech Stack

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
- Nginx for serving the frontend SPA
- GitHub Actions
- Production backup scripts

## Architecture

The repository contains two applications:

- `frontend` - React SPA for the customer and admin interface of the store.
- `backend` - Express API for orders, payments, delivery, file uploads, and notifications.

The online store has an original experimental design. The frontend is built around a layered UI. Instead of classic separate pages, the interface opens layers:

- `about`
- `objects`
- `details`
- `info`
- `checkout`

Layer state is stored in `features/layer-switching/layers.store.ts`, while the URL is derived from the current state and can hydrate the state back. For example, `/object/:id/checkout` restores the selected object and the semi-transparent checkout layer above it. This keeps the interface interactive and aligned with the intended design while preserving deep links, browser history, and predictable navigation.

The backend is split by responsibility:

- `routes` receive HTTP requests;
- `controllers` validate request input and manage request/response;
- `services` contain business logic for orders, payments, shipments, and notifications;
- `helpers` encapsulate reusable validation and transformations;
- `middleware` handles auth, roles, uploads, rate limiting, and error handling.

## Core Flows

### Purchase

1. The user adds a product to the cart.
2. The frontend calculates cart composition and package dimensions.
3. The user selects a city and a CDEK pickup point/postamat.
4. The frontend requests a delivery quote.
5. On checkout submit, the backend reloads product prices and package dimensions from the database and recalculates subtotal and delivery server-side.
6. The backend creates the order and order items inside a transaction.
7. The backend creates or reuses the current YooKassa payment.
8. The frontend redirects the user to `confirmationUrl`.
9. After payment return, the frontend polls the payment status several times.
10. The YooKassa webhook confirms payment on the server.
11. The backend marks the order as `PAID`, creates a CDEK shipment, and enqueues an email job.
12. The worker sends the email and marks the job as `SENT`.

##### Checkout Idempotency

The frontend creates a `checkoutAttemptKey` for the current checkout attempt. The backend stores it as a unique order key. If the user submits the same checkout again, the backend returns the existing order and payment instead of creating duplicate orders, order items, or payments.

##### Payments

Payments are stored separately from orders. An order has `currentPaymentId`, while payment history remains in the `Payment` table. This allows the app to:

- reuse an active pending payment;
- avoid recreating a successful payment;
- distinguish explicit `FAILED` from uncertain `PROVIDER_UNKNOWN`;
- restore payment state through YooKassa idempotence keys;
- ignore stale webhooks for non-current payments.

### Delivery

CDEK is used in four places:

- city suggestions;
- pickup point/postamat listing based on package dimensions;
- delivery price calculation;
- shipment registration after payment.

Package dimensions are stored on the product and copied into `OrderItem` when an order is created. This keeps already placed orders stable even if an admin later edits the product card.

The project uses the [official CDEK API](https://apidoc.cdek.ru/).

### Admin

The admin logs in at `/admin`. The backend verifies the password with Argon2 and issues a JWT containing the `ADMIN` role. Protected operations use role middleware.

The admin can:

- create and edit products;
- set price, position, attributes, and package dimensions;
- upload images;
- delete images;
- reorder images;
- inspect orders in a table;
- search orders by customer, contacts, city, address, product title, payment id, and tracking number;
- sort orders by date and total.

## Database

The database is defined in [backend/prisma/schema.prisma](backend/prisma/schema.prisma).

Main entities:

- `Admin` - admin user.
- `Item` - storefront product/object.
- `ItemPoint` - product feature list.
- `ItemInfo` - structured product attributes.
- `ItemImage` - product images with ordering.
- `Order` - order, customer, delivery data, subtotal/total, and current payment.
- `OrderItem` - snapshot of the product inside an order: title, price, quantity, dimensions.
- `Payment` - YooKassa payment, idempotence key, provider id, status, confirmation URL.
- `Shipment` - CDEK shipment, status, tracking number, provider shipment id.
- `NotificationJob` - background email delivery job.

The schema uses enum statuses for orders, payments, shipments, and notification jobs. Frequently queried relations have indexes. Unique constraints protect critical invariants: one `checkoutAttemptKey`, one current payment per order, one shipment per order, and one email job of a given type per order.

## API

Main backend routes:

| Method   | Route                                                   | Purpose                         |
| -------- | ------------------------------------------------------- | ------------------------------- |
| `POST`   | `/api/auth/login`                                       | Admin login                     |
| `GET`    | `/api/auth/session`                                     | JWT session check               |
| `GET`    | `/api/items`                                            | Get products                    |
| `POST`   | `/api/items`                                            | Create product, `ADMIN`         |
| `PUT`    | `/api/items/:id`                                        | Update product, `ADMIN`         |
| `DELETE` | `/api/items/:id`                                        | Delete product, `ADMIN`         |
| `POST`   | `/api/images/:id`                                       | Upload product image, `ADMIN`   |
| `DELETE` | `/api/images/:id/:imageId`                              | Delete product image, `ADMIN`   |
| `PATCH`  | `/api/images/:id`                                       | Reorder product images, `ADMIN` |
| `GET`    | `/api/cdek/cities`                                      | CDEK city suggestions           |
| `GET`    | `/api/cdek/delivery-points`                             | CDEK pickup points/postamats    |
| `POST`   | `/api/cdek/delivery-price`                              | Delivery price calculation      |
| `POST`   | `/api/checkout`                                         | Create order and payment        |
| `GET`    | `/api/payment/order/:orderId/payment/:paymentId/status` | Check payment status            |
| `POST`   | `/api/payment/webhook/youkassa/:secret`                 | YooKassa webhook                |
| `GET`    | `/api/orders`                                           | Admin orders table, `ADMIN`     |

## Quality And Reliability

The project includes several production-oriented e-commerce practices:

- Server-side order price recalculation: the frontend sends cart data, but the backend loads prices and package dimensions from the database.
- Prisma transactions for creating orders and updating related entities.
- Idempotent checkout through `checkoutAttemptKey`.
- Idempotent successful payment webhook handling: repeated webhooks do not create duplicate shipments or email jobs.
- YooKassa status verification before applying webhook data.
- Separate `PROVIDER_UNKNOWN` status for network/uncertain payment provider failures.
- Local CDEK shipment creation lock through unique `orderId` and race-condition handling.
- Notification job queue with `PROCESSING`, `lockedAt`, stale lock requeue, and retry limit.
- Rate limiting for login, checkout, CDEK, payment status, and webhook routes.
- JWT role-based access for admin operations.
- Uploaded filename sanitization.
- Structured JSON logs with event names and payloads.
- CI checks types, lint, unit, integration, and e2e tests before production deploy.
- Production backup runs before migrations.

## Local Setup

Requires Node.js 22 and PostgreSQL.

### Backend

```bash
cd backend
npm ci
npm run generate
npx prisma migrate deploy
npm run start
```

The backend expects environment variables in `backend/.env`:

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

Run the notification worker separately:

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

By default, the frontend dev server runs at `http://127.0.0.1:8080`, and the API URL is read from the build-time `BACK_API_URL` variable. If it is not set, the app uses `http://localhost:5000`.

Full local checkout requires valid YooKassa, CDEK, and SMTP credentials. Tests mock external integrations, so they can be run without real providers.

## Tests And Checks

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

Covered areas:

- layered UI and URL synchronization utilities;
- checkout store;
- positive integer parsing;
- backend validation helpers;
- YooKassa status mapping;
- checkout order creation;
- payment webhook handling;
- repeated webhook idempotency;
- admin orders API;
- notification job worker logic;
- e2e smoke flow from product selection to payment redirect.

## Production And Backup

Production is assembled through `docker-compose.prod.yml`:

- `postgres` - PostgreSQL 17;
- `backend` - Express API;
- `notification-worker` - separate email job processing service;
- `frontend` - static React SPA served by Nginx.

Deployment is handled by the GitHub Actions workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) on every push to `main`:

1. Installs frontend/backend dependencies.
2. Runs type-check, lint, unit, integration, and e2e tests.
3. Connects to the VPS.
4. Pulls the latest `main`.
5. Backs up production data.
6. Builds Docker images sequentially.
7. Applies Prisma migrations.
8. Starts containers.
9. Runs a production health check.

Backup is documented in [docs/backup-restore.md](docs/backup-restore.md). The [scripts/backup-prod.sh](scripts/backup-prod.sh) script:

- saves a custom-format PostgreSQL dump;
- archives uploaded images;
- writes a manifest with commit and compose service state;
- can leave app services stopped for safer deployment;
- removes old backup folders according to retention.

## Project Structure

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
