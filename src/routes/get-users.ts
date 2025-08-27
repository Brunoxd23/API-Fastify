import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../database/client.ts";
import { courses, enrollments, users } from "../database/schema.ts";
import { ilike, asc, type SQL, and, eq, count } from "drizzle-orm";
import z from "zod";
import { checkUserRole } from "./hooks/check-user-role.ts";
import { checkRequestJWT } from "./hooks/check-request-jwt.ts";

export const getUsersRoute: FastifyPluginAsyncZod = async (server) => {
  server.get(
    "/users",
    {
      schema: {
        security: [{ bearerAuth: [] }],
        preHandler: [checkRequestJWT, checkUserRole("manager")],
        tags: ["users"],
        summary: "Get all users",
        querystring: z.object({
          search: z.string().optional(),
          orderBy: z.enum(["id", "name"]).optional().default("id"),
          page: z.coerce.number().optional().default(1),
        }),
        response: {
          200: z.object({
            users: z.array(
              z.object({
                id: z.uuid(),
                name: z.string(),
                email: z.string().email(),
                role: z.enum(["student", "manager"]),
              })
            ),
            total: z.number(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { search, orderBy, page } = request.query;

      const conditions: SQL[] = [];

      if (search) {
        conditions.push(ilike(users.name, `%${search}%`));
      }

      const [result, total] = await Promise.all([
        db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
          })
          .from(users)
          .orderBy(asc(users[orderBy]))
          .offset((page - 1) * 2)
          .limit(10)
          .where(and(...conditions))
          .groupBy(users.id),
        db.$count(users, and(...conditions)),
      ]);

      return reply.send({ users: result, total });
    }
  );
};
