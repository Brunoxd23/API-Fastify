import { test, expect } from "vitest";
import request from "supertest";
import { server } from "../app.ts";
import { faker } from "@faker-js/faker";
import { makeAuthenticatedUser } from "../tests/factories/make-user.ts";

test("create a course", async () => {
  await server.ready();

  const { token } = await makeAuthenticatedUser("manager");

  const { token } = await makeAuthenticatedUser("manager");

  const response = await request(server.server)
    .post("/courses")
    .set("Content-Type", "application/json")
    .set("Authorization", token)
    .send({
      title: faker.lorem.words(4),
      description: faker.lorem.sentence(12), // garante mínimo de 10 caracteres
    });

  expect(response.status).toEqual(201);
  expect(response.body).toEqual({
    courseId: expect.any(String),
  });
});
