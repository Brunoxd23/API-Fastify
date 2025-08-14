import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../database/client.ts";
import { courses } from "../database/schema.ts";
import z from "zod";

export const createCourseRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    "/courses",
    {
      schema: {
        tags: ["courses"],
        summary: "Create a course",
        body: z.object({
          title: z.string().min(5, "Título precisa ter 5 caracteres"),
          description: z
            .string()
            .min(10, "Descrição precisa ter 10 caracteres"),
        }),
        response: {
          201: z
            .object({ courseId: z.uuid() })
            .describe("Curso criado com sucesso!"),
        },
      },
    },
    async (request, reply) => {
      const { title, description } = request.body;

      const result = await db
        .insert(courses)
        .values({
          title,
          description,
        })
        .returning();

      return reply.status(201).send({ courseId: result[0].id });
    }
  );
};
