# Desafio Node.js – Primeira API (aulas)

API simples em Node.js + TypeScript usando Fastify, Drizzle ORM (PostgreSQL), Zod para validação e Vitest para testes. Inclui documentação Swagger/Scalar em ambiente de desenvolvimento.

## Requisitos

- Node.js 22+
- Docker e Docker Compose
- npm (ou outro gerenciador, mas o projeto usa `package-lock.json`)

## Tecnologias

- Fastify 5
- TypeScript
- Drizzle ORM + PostgreSQL
- Zod (validação)
- Swagger/OpenAPI + Scalar API Reference (em `/docs` quando `NODE_ENV=development`)
- Vitest (testes unitários e de integração)
- dotenv-cli (para gestão de variáveis de ambiente em testes)

## Configuração

1. Clone o repositório e acesse a pasta do projeto.
2. Instale as dependências:

```bash
npm install
```

3. Suba o banco Postgres com Docker:

```bash
docker compose up -d
```

> **Nota**: Se preferir não usar Docker, você pode configurar uma instância PostgreSQL local e ajustar a `DATABASE_URL` no arquivo `.env` conforme necessário. 4. Crie um arquivo `.env` na raiz com:

```bash
# URL do banco (Docker local padrão)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/desafio

# Ativa docs em /docs
NODE_ENV=development
```

5. Rode as migrações (Drizzle):

```bash
npm run db:migrate
```

6. (Opcional) Popule o banco com dados sementes:

```bash
npm run db:seed
```

7. (Opcional) Para inspecionar o schema/estado com o Drizzle Studio:

```bash
npm run db:studio
```

## Executando o servidor

```bash
npm run dev
```

- Porta padrão: `http://localhost:3333`
- Logs legíveis habilitados (usando pino-pretty)
- Documentação da API (em dev): `http://localhost:3333/docs`
- Auto-reload quando arquivos são modificados

### Documentação interativa

A documentação interativa da API está disponível em modo de desenvolvimento:

1. Certifique-se que `NODE_ENV=development` está definido no `.env`
2. Execute `npm run dev`
3. Acesse `http://localhost:3333/docs` no navegador

A documentação é gerada automaticamente a partir das definições de rota e esquemas Zod, permitindo testar os endpoints diretamente na interface.

## Endpoints

Base URL: `http://localhost:3333`

- POST `/courses`

  - Cria um curso
  - Body (JSON):
    ```json
    { "title": "Curso de Docker" }
    ```
  - Validações:
    - `title`: string com mínimo 5 caracteres
  - Respostas:
    - 201: `{ "courseId": "<uuid>" }`
    - 400: Erro de validação

- GET `/courses`

  - Lista todos os cursos
  - Parâmetros de consulta (opcionais):
    - `search`: Filtra cursos pelo título
    - `orderBy`: Ordena por `id` ou `title` (padrão: `id`)
    - `page`: Número da página para paginação (padrão: 1)
  - Respostas:
    - 200: `{ "courses": [{ "id": "<uuid>", "title": "...", "enrollments": 0 }], "total": 10 }`

- GET `/courses/:id`
  - Busca um curso pelo ID
  - Parâmetros: `id` (UUID)
  - Respostas:
    - 200: `{ "course": { "id": "<uuid>", "title": "...", "description": "... | null" } }`
    - 404: vazio

Há um arquivo `requisicoes.http` com exemplos prontos (compatível com extensões de REST Client).

## Modelos (schema)

Tabelas principais definidas em `src/database/schema.ts`:

- `courses`
  - `id` (uuid, pk, default random)
  - `title` (text, único, obrigatório)
  - `description` (text, opcional)
- `users` (exemplo para estudos)
  - `id` (uuid, pk, default random)
  - `name` (text, obrigatório)
  - `email` (text, único, obrigatório)

## Fluxo principal (Mermaid)

```mermaid
sequenceDiagram
  participant C as Client
  participant S as Fastify Server
  participant V as Zod Validator
  participant DB as Drizzle + PostgreSQL

  C->>S: POST /courses {title}
  S->>V: Validar body
  V-->>S: OK ou Erro 400
  alt válido
    S->>DB: INSERT INTO courses (title)
    DB-->>S: {id}
    S-->>C: 201 {courseId}
  else inválido
    S-->>C: 400
  end

  C->>S: GET /courses
  S->>DB: SELECT id,title FROM courses
  DB-->>S: lista
  S-->>C: 200 {courses: [...]}

  C->>S: GET /courses/:id
  S->>V: Validar param id (uuid)
  V-->>S: OK ou Erro 400
  alt encontrado
    S->>DB: SELECT * FROM courses WHERE id=...
    DB-->>S: course
    S-->>C: 200 {course}
  else não encontrado
    S-->>C: 404
  end
```

## Scripts

- `npm run dev`: inicia o servidor com reload e carrega variáveis de `.env`
- `npm run db:generate`: gera artefatos do Drizzle a partir do schema
- `npm run db:migrate`: aplica migrações no banco
- `npm run db:seed`: popula o banco com dados iniciais/exemplo
- `npm run db:studio`: abre o Drizzle Studio para visualizar/gerenciar dados
- `npm test`: executa testes com Vitest (com cobertura)
- `npm run pretest`: prepara o banco de dados de teste antes dos testes

## Estrutura de arquivos

```
src/
├── app.ts               # Configuração principal da aplicação Fastify
├── server.ts            # Ponto de entrada - inicia o servidor HTTP
├── database/
│   ├── client.ts        # Cliente do Drizzle ORM
│   ├── schema.ts        # Definição do schema das tabelas
│   └── seed.ts          # Script para popular o banco com dados iniciais
├── routes/
│   ├── create-course.ts # Rota POST /courses
│   ├── get-courses.ts   # Rota GET /courses
│   └── get-course-by-id.ts # Rota GET /courses/:id
├── tests/
│   ├── factories/       # Factories para criação de dados nos testes
│   └── *.test.ts        # Arquivos de teste
└── env.d.ts             # Tipagem para variáveis de ambiente
```

## Testes

Os testes utilizam o Vitest com um banco de dados PostgreSQL dedicado para testes:

1. Configure o arquivo `.env.test` com:

```
NODE_ENV=test
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/desafio_test
```

2. Execute os testes:

```bash
npm test
```

3. Para visualizar relatório de cobertura de código:

```bash
start coverage/index.html
```

## Dicas e solução de problemas

- Conexão recusada ao Postgres: confirme `docker compose up -d` e que a porta `5432` não está em uso.
- Variável `DATABASE_URL` ausente: verifique seu `.env`. O Drizzle exige essa variável para `db:generate`, `db:migrate` e `db:studio`.
- Docs não aparecem em `/docs`: garanta `NODE_ENV=development` no `.env` e reinicie o servidor.
- Erro na execução dos testes: verifique se o banco de dados de teste existe e está configurado corretamente em `.env.test`.

## Dependências e Comandos de Instalação

### Dependências de Produção

```bash
# Framework e servidor web
npm install fastify@5.5.0

# ORM e banco de dados
npm install drizzle-orm@0.44.4 pg@8.16.3

# Validação e tipagem
npm install zod@4.0.17 fastify-type-provider-zod@5.0.3

# Logs formatados
npm install pino-pretty@13.1.1

# Documentação de API
npm install @fastify/swagger@9.5.1 @fastify/swagger-ui@5.2.3 @scalar/fastify-api-reference@1.34.2
```

### Dependências de Desenvolvimento

```bash
# TypeScript e tipos
npm install -D typescript@5.9.2 @types/node@24.2.1

# Ferramentas do Drizzle
npm install -D drizzle-kit@0.31.4

# Testes
npm install -D vitest@3.2.4 @vitest/coverage-v8@3.2.4 supertest@7.1.4 @types/supertest@6.0.3

# Dados falsos para testes
npm install -D @faker-js/faker@9.9.0

# Gerenciamento de variáveis de ambiente
npm install -D dotenv-cli@10.0.0
```

### Instalação completa em um único comando

```bash
npm install fastify@5.5.0 drizzle-orm@0.44.4 pg@8.16.3 zod@4.0.17 fastify-type-provider-zod@5.0.3 pino-pretty@13.1.1 @fastify/swagger@9.5.1 @fastify/swagger-ui@5.2.3 @scalar/fastify-api-reference@1.34.2

npm install -D typescript@5.9.2 @types/node@24.2.1 drizzle-kit@0.31.4 vitest@3.2.4 @vitest/coverage-v8@3.2.4 supertest@7.1.4 @types/supertest@6.0.3 @faker-js/faker@9.9.0 dotenv-cli@10.0.0
```

## Licença

ISC (ver `package.json`).
