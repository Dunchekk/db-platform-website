import request from "supertest";
import { SignJWT } from "jose";
import { describe, expect, test } from "vitest";

const { app } = await import("../../src/app");
const { prisma } = await import("../../src/db");

describe("GET /api/orders", () => {
  test("отклоняет запрос без токена", async () => {
    const response = await request(app).get("/api/orders").expect(401);

    expect(response.body).toEqual({
      message: "User is not authorized",
    });
  });

  test("отклоняет пользователя без ADMIN роли", async () => {
    const token = await createToken("USER");

    const response = await request(app)
      .get("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .expect(403);

    expect(response.body).toEqual({
      message: "Forbidden",
    });
  });

  test("возвращает пагинацию и сортирует заказы по total", async () => {
    const token = await createToken("ADMIN");

    await createTestOrder({
      firstName: "Anna",
      total: 3000,
    });
    await createTestOrder({
      firstName: "Boris",
      total: 1000,
    });
    await createTestOrder({
      firstName: "Dunya",
      total: 2000,
    });

    const response = await request(app)
      .get("/api/orders?page=1&limit=2&sortBy=total&sortDir=asc")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body).toMatchObject({
      total: 3,
      page: 1,
      limit: 2,
      totalPages: 2,
      sortBy: "total",
      sortDir: "asc",
      search: null,
    });
    expect(response.body.items).toHaveLength(2);
    expect(
      response.body.items.map((order: { total: number }) => order.total)
    ).toEqual([1000, 2000]);
    expect(
      response.body.items.map((order: { firstName: string }) => order.firstName)
    ).toEqual(["Boris", "Dunya"]);
    expect(response.body.items[0]).toMatchObject({
      currentPayment: null,
      shipment: null,
    });
  });
});

describe("PATCH /api/orders/:id/status", () => {
  test("отклоняет запрос без ADMIN роли", async () => {
    const order = await createTestOrder({
      firstName: "Anna",
      total: 3000,
    });

    const response = await request(app)
      .patch(`/api/orders/${order.id}/status`)
      .send({
        status: "DELIVERED",
      })
      .expect(401);

    expect(response.body).toEqual({
      message: "User is not authorized",
    });
  });

  test("отклоняет статус вне ручного списка", async () => {
    const token = await createToken("ADMIN");
    const order = await createTestOrder({
      firstName: "Anna",
      total: 3000,
    });

    const response = await request(app)
      .patch(`/api/orders/${order.id}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        status: "PAID",
      })
      .expect(400);

    expect(response.body).toEqual({
      message: "status must be SHIPPED, DELIVERED or CANCELLED",
    });
  });

  test.each(["SHIPPED", "DELIVERED", "CANCELLED"])(
    "позволяет админу вручную поставить статус %s",
    async (status) => {
      const token = await createToken("ADMIN");
      const order = await createTestOrder({
        firstName: "Anna",
        total: 3000,
      });

      const response = await request(app)
        .patch(`/api/orders/${order.id}/status`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          status,
        })
        .expect(200);

      expect(response.body).toMatchObject({
        id: order.id,
        status,
      });
    }
  );

  test("при завершении очищает telegram и ставит completedAt", async () => {
    const token = await createToken("ADMIN");
    const order = await createTestOrder({
      firstName: "Anna",
      total: 3000,
    });

    await request(app)
      .patch(`/api/orders/${order.id}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        status: "DELIVERED",
      })
      .expect(200);

    const updatedOrder = await prisma.order.findUnique({
      where: {
        id: order.id,
      },
    });

    expect(updatedOrder).toMatchObject({
      status: "DELIVERED",
      telegram: null,
    });
    expect(updatedOrder?.completedAt).toBeInstanceOf(Date);
  });

  test("не перезаписывает completedAt, если он уже был", async () => {
    const token = await createToken("ADMIN");
    const completedAt = new Date("2026-01-01T00:00:00.000Z");
    const order = await createTestOrder({
      firstName: "Anna",
      total: 3000,
      completedAt,
    });

    await request(app)
      .patch(`/api/orders/${order.id}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        status: "CANCELLED",
      })
      .expect(200);

    const updatedOrder = await prisma.order.findUnique({
      where: {
        id: order.id,
      },
    });

    expect(updatedOrder).toMatchObject({
      status: "CANCELLED",
      telegram: null,
    });
    expect(updatedOrder?.completedAt?.toISOString()).toBe(
      completedAt.toISOString()
    );
  });
});

async function createToken(role: string) {
  return new SignJWT({ role })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setSubject("test-user")
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));
}

function createTestOrder({
  firstName,
  total,
  completedAt,
}: {
  firstName: string;
  total: number;
  completedAt?: Date;
}) {
  return prisma.order.create({
    data: {
      firstName,
      lastName: "Test",
      patronymic: "",
      email: `${firstName.toLowerCase()}@example.com`,
      phone: "+79991234567",
      telegram: "@test",
      deliveryMethod: "CDEK_PVZ",
      deliveryPrice: 300,
      deliveryCityCode: 44,
      deliveryCityLabel: "Москва",
      deliveryOfficeCode: "PVZ-1",
      deliveryOfficeUuid: "office-uuid",
      deliveryOfficeType: "PVZ",
      deliveryOfficeAddress: "Москва, тестовый адрес",
      comment: "Тестовый заказ",
      subtotal: total - 300,
      total,
      completedAt,
      items: {
        create: [
          {
            title: "Test item",
            price: total - 300,
            quantity: 1,
            total: total - 300,
            packageWeightGrams: 500,
            packageLengthCm: 20,
            packageWidthCm: 10,
            packageHeightCm: 5,
          },
        ],
      },
    },
  });
}
