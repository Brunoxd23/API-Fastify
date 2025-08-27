// Importa o tipo do plugin Fastify com suporte ao Zod para validação de schemas
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
// Importa a instância do banco de dados
import { db } from "../database/client.ts";
// Importa o schema da tabela de cursos
import { courses } from "../database/schema.ts";
// Importa o Zod para validação dos dados
import z from "zod";
// Middleware para validar o JWT do usuário
import { checkRequestJWT } from "./hooks/check-request-jwt.ts";
// Middleware para validar se o usuário tem permissão de manager
import { checkUserRole } from "./hooks/check-user-role.ts";

// Função que registra a rota de criação de curso
export const createCourseRoute: FastifyPluginAsyncZod = async (server) => {
  // Define a rota POST /courses
  server.post(
    "/courses",
    {
      // Middlewares: exige autenticação JWT e permissão de manager
      preHandler: [checkRequestJWT, checkUserRole("manager")],
      schema: {
        tags: ["courses"], // Tag para documentação
        summary: "Create a course", // Resumo para docs
        // Validação do corpo da requisição
        body: z.object({
          title: z.string().min(5, "Título precisa ter 5 caracteres"), // Título do curso
          description: z
            .string()
            .min(10, "Descrição precisa ter 10 caracteres"), // Descrição do curso
        }),
        // Validação da resposta
        response: {
          201: z
            .object({ courseId: z.uuid() })
            .describe("Curso criado com sucesso!"), // Mensagem de sucesso
        },
      },
    },
    // Handler da rota: insere o curso no banco e retorna o id
    async (request, reply) => {
      // Extrai dados do corpo da requisição
      const courseTitle = request.body.title;
      const courseDescription = request.body.description;

      // Insere o novo curso na tabela 'courses' e retorna o registro criado
      const result = await db
        .insert(courses)
        .values({ title: courseTitle, description: courseDescription })
        .returning();

      // Responde com o id do curso criado
      return reply.status(201).send({ courseId: result[0].id });
    }
  );
};
