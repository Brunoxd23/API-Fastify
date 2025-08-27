// Rota para criação de usuário
import type { FastifyPluginAsync } from "fastify"; // Tipo do plugin Fastify
import { z } from "zod"; // Validação de dados
import { db } from "../database/client.ts"; // Instância do banco
import { users } from "../database/schema.ts"; // Schema da tabela users
import { hash } from "argon2"; // Função para hash de senha

export const createUserRoute: FastifyPluginAsync = async (server) => {
  // Define a rota POST /users
  server.post(
    "/users",
    {
      schema: {
        tags: ["users"], // Tag para docs
        summary: "Create a new user", // Resumo para docs
        // Validação do corpo da requisição
        body: z.object({
          name: z.string().min(3), // Nome do usuário
          email: z.string().email(), // Email do usuário
          password: z.string().min(6), // Senha do usuário
          role: z.enum(["student", "manager"]).default("student"), // Papel do usuário
        }),
        // Validação da resposta
        response: {
          201: z.object({ userId: z.string().uuid() }), // Retorna o id do usuário criado
        },
      },
    },
    // Handler da rota: cria usuário no banco
    async (request, reply) => {
      // Extrai dados do corpo da requisição
      const { name, email, password, role } = request.body as any;
      // Gera hash seguro da senha
      const hashedPassword = await hash(password);

      // Insere novo usuário na tabela 'users' e retorna o registro criado
      const [user] = await db
        .insert(users)
        .values({
          name,
          email,
          password: hashedPassword,
          role,
        })
        .returning();

      // Responde com o id do usuário criado
      return reply.status(201).send({ userId: user.id });
    }
  );
};
