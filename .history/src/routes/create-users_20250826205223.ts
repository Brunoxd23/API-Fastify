import { test, expect } from "vitest";
import request from "supertest";
import { server } from "../app.ts";
import { faker } from "@faker-js/faker";
import { makeAuthenticatedUser } from "../tests/factories/make-user.ts";

test("create a user", async () => {
  await server.ready();

  const { token } = await makeAuthenticatedUser("manager");

  const response = await request(server.server)
    .post("/users")
    .set("Content-Type", "application/json")
    .set("Authorization", token)
    .send({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: "student",
    });

  expect(response.status).toEqual(201);
  expect(response.body).toEqual({
    userId: expect.any(String),
  });
});
