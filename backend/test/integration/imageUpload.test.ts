import fs from "fs/promises";
import path from "path";
import request from "supertest";
import { SignJWT } from "jose";
import { afterEach, beforeAll, describe, expect, test } from "vitest";
import { MAX_IMAGE_SIZE_BYTES } from "../../src/middleware/UploadMiddleware";

const { app } = await import("../../src/app");
const { prisma } = await import("../../src/db");

const uploadsPath = path.resolve(__dirname, "../../src/static/uploads");
const createdUploadPaths: string[] = [];

describe("POST /api/images/:id", () => {
  beforeAll(async () => {
    await fs.mkdir(uploadsPath, { recursive: true });
  });

  afterEach(async () => {
    await Promise.all(
      createdUploadPaths.splice(0).map((filePath) =>
        fs.unlink(filePath).catch((e: unknown) => {
          if (!(e instanceof Error) || !("code" in e) || e.code !== "ENOENT") {
            throw e;
          }
        })
      )
    );
  });

  test("загружает картинку с уникальным безопасным именем", async () => {
    const token = await createToken("ADMIN");
    const item = await createTestItem();

    const response = await request(app)
      .post(`/api/images/${item.id}`)
      .set("Authorization", `Bearer ${token}`)
      .attach("image", Buffer.from(buildSvg()), {
        filename: "тест картинка.svg",
        contentType: "image/svg+xml",
      })
      .expect(201);

    expect(response.body).toMatchObject({
      id: expect.any(Number),
      itemId: item.id,
      position: 1,
    });
    expect(response.body.url).toMatch(
      new RegExp(`^/uploads/${item.id}_\\d+_[^/]+_test-kartinka\\.svg$`)
    );

    const uploadedPath = path.join(
      uploadsPath,
      path.basename(response.body.url)
    );
    createdUploadPaths.push(uploadedPath);

    await expect(fs.access(uploadedPath)).resolves.toBeUndefined();
  });

  test("отклоняет файл неподдерживаемого типа", async () => {
    const token = await createToken("ADMIN");
    const item = await createTestItem();

    const response = await request(app)
      .post(`/api/images/${item.id}`)
      .set("Authorization", `Bearer ${token}`)
      .attach("image", Buffer.from("not an image"), {
        filename: "notes.txt",
        contentType: "text/plain",
      })
      .expect(400);

    expect(response.body).toEqual({
      message: "Only image files are allowed",
    });
  });

  test("отклоняет слишком большой файл", async () => {
    const token = await createToken("ADMIN");
    const item = await createTestItem();
    const tooLargeImage = Buffer.alloc(MAX_IMAGE_SIZE_BYTES, "a");

    const response = await request(app)
      .post(`/api/images/${item.id}`)
      .set("Authorization", `Bearer ${token}`)
      .attach("image", tooLargeImage, {
        filename: "large.png",
        contentType: "image/png",
      })
      .expect(400);

    expect(response.body).toEqual({
      message: "Image file is too large",
    });
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

function createTestItem() {
  return prisma.item.create({
    data: {
      name: "Test item",
      price: 1000,
      position: 1,
      packageWeightGrams: 500,
      packageLengthCm: 20,
      packageWidthCm: 10,
      packageHeightCm: 5,
    },
  });
}

function buildSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10"/></svg>`;
}
