import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../database/client.ts";
import { courses } from "../database/schema.ts";
import z from "zod";
import { checkRequestJWT } from "./hooks/check-request-jwt.ts";
import { checkUserRole } from "./hooks/check-user-role.ts";

export const createCourseRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    "/courses",
    {
      preHandler: [checkRequestJWT, checkUserRole("manager")],
      schema: {
        tags: ["courses"],
        summary: "Create a course",
        body: z.object({
          title: z.string().min(5, "Título precisa ter 5 caracteres"),
          desc: z.string().min(10, "Descrição precisa ter 10 caracteres"),
        }),
        response: {
          201: z
            .object({ courseId: z.uuid() })
            .describe("Curso criado com sucesso!"),
        },
      },
    },
    async (request, reply) => {
      const courseTitle = request.body.title;
      const courseDesc = request.body.desc;

      const result = await db
        .insert(courses)
        .values({ title: courseTitle, desc: courseDesc })
        .returning();

      return reply.status(201).send({ courseId: result[0].id });
    }
  );
};
