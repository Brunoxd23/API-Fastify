import fastify from "fastify";
import { fastifySwagger } from "@fastify/swagger";
import {
  validatorCompiler,
  serializerCompiler,
  type ZodTypeProvider,
  jsonSchemaTransform,
} from "fastify-type-provider-zod";
import { createCourseRoute } from "./routes/create-course.ts";
import { getCourseByIdRoute } from "./routes/get-course-by-id.ts";
import { getCoursesRoute } from "./routes/get-courses.ts";
import { getUserByIdRoute } from "./routes/get-users-by-id.ts";
import scalarAPIReference from "@scalar/fastify-api-reference";
import { loginRoute } from "./routes/login.ts";
import { createUserRoute } from "./routes/create-user.ts";
import { getUsersRoute } from "./routes/get-users.ts";

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
    },
    transform: jsonSchemaTransform,
  });

  server.register(scalarAPIReference, {
    routePrefix: "/docs",
    configuration: {
      title: "API Fastify Moderna",
      theme: "fastify",
      layout: "modern",
      hideDownloadButton: false,
      showSidebar: true,
      showLicense: false,
      showExternalDocs: false,
      externalDocs: {
        url: "https://github.com/Brunoxd23/API-Fastify",
        description: "Repositório no GitHub",
      },
    },
  });
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
