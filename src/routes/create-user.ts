// src/routes/create-user.ts
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { db } from "../database/client.ts";
import { users } from "../database/schema.ts";
import { hash } from "argon2";

export const createUserRoute: FastifyPluginAsync = async (server) => {
  server.post(
    "/users",
    {
      schema: {
        tags: ["users"],
        summary: "Create a new user",
        body: z.object({
          name: z.string().min(3),
          email: z.string().email(),
          password: z.string().min(6),
          role: z.enum(["student", "manager"]).default("student"),
        }),
        response: {
          201: z.object({ userId: z.string().uuid() }),
        },
      },
    },
    async (request, reply) => {
      const { name, email, password, role } = request.body as any;
      const hashedPassword = await hash(password);

      const [user] = await db
        .insert(users)
        .values({
          name,
          email,
          password: hashedPassword,
          role,
        })
        .returning();

      return reply.status(201).send({ userId: user.id });
    }
  );
};
