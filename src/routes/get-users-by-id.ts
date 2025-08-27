import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../database/client.ts";
import { users } from "../database/schema.ts";
import z from "zod";
import { eq } from "drizzle-orm";
import { checkRequestJWT } from "./hooks/check-request-jwt.ts";
import { getAuthenticatedUserFromRequest } from "../utils/get-authenticated-user-from-request.ts";

export const getUserByIdRoute: FastifyPluginAsyncZod = async (server) => {
  server.get(
    "/users/:id",
    {
      preHandler: [checkRequestJWT],
      schema: {
        tags: ["users"],
        summary: "Get user by ID",
        params: z.object({
          id: z.uuid(),
        }),
        response: {
          200: z.object({
            users: z.object({
              id: z.uuid(),
              name: z.string(),
              email: z.string().email(),
              role: z.enum(["student", "manager"]),
            }),
          }),
          404: z.null().describe("User not found"),
        },
      },
    },
    async (request, reply) => {
      const userId = request.params.id;

      const result = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
        })
        .from(users)
        .where(eq(users.id, userId));

      if (result.length > 0) {
        const user = result[0];
        return { users: user };
      }

      return reply.status(404).send();
    }
  );
};
