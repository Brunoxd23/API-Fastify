import { faker } from "@faker-js/faker";
import { db } from "../../database/client.ts";
import { courses, users } from "../../database/schema.ts";

export async function makeCourse({ title }: { title?: string } = {}) {
  const result = await db
    .insert(courses)
    .values({
      title: title ?? faker.lorem.words(4),
      description: faker.lorem.paragraph(),
    })
    .returning();

  return result[0];
}

export async function makeUser(name?: string, email?: string) {
  const result = await db
    .insert(users)
    .values({
      name: name ?? faker.person.fullName(),
      email: email ?? faker.internet.email(),
    })
    .returning();

  return result[0];
}
