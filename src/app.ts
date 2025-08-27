// Importa o Fastify, framework web rápido para Node.js
import fastify from "fastify";
// Importa o plugin Swagger para documentação OpenAPI
import { fastifySwagger } from "@fastify/swagger";
// Importa utilitários para integração do Zod com Fastify
import {
  validatorCompiler,
  serializerCompiler,
  type ZodTypeProvider,
  jsonSchemaTransform,
} from "fastify-type-provider-zod";
// Importa plugin Scalar para docs interativas modernas
import scalarAPIReference from "@scalar/fastify-api-reference";
// Importa rotas da API
import { createCourseRoute } from "./routes/create-course.ts";
import { getCourseByIdRoute } from "./routes/get-course-by-id.ts";
import { getCoursesRoute } from "./routes/get-courses.ts";
import { getUserByIdRoute } from "./routes/get-users-by-id.ts";
import { createUserRoute } from "./routes/create-user.ts";
import { getUsersRoute } from "./routes/get-users.ts";
import { loginRoute } from "./routes/login.ts";

const server = fastify({
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
}).withTypeProvider<ZodTypeProvider>();

if (process.env.NODE_ENV === "development") {
  server.register(fastifySwagger, {
    openapi: {
      info: {
        title: "API Fastify Moderna",
        version: "1.0.0",
        description:
          "Documentação interativa e moderna da API com Fastify, Drizzle ORM e Neon.",
      },
      servers: [
        { url: "http://localhost:3333", description: "Local development" },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "apiKey",
            in: "header",
            name: "Authorization",
            description: "Informe apenas o token JWT, sem o prefixo Bearer.",
          },
        },
      },
    },
    transform: jsonSchemaTransform,
  });
  // Configura validação e serialização global usando Zod

  server.register(scalarAPIReference, {
    routePrefix: "/docs",
    // Registra todas as rotas da API
    configuration: {
      title: "API Fastify Moderna",
      theme: "deepSpace",
      layout: "modern",
      hideDownloadButton: false,
      showSidebar: true,
    },
  });
  // Exporta o servidor para uso externo
}

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

server.register(createCourseRoute);
server.register(getCourseByIdRoute);
server.register(getCoursesRoute);
server.register(getUserByIdRoute);
server.register(loginRoute);
server.register(createUserRoute);
server.register(getUsersRoute);

export { server };
