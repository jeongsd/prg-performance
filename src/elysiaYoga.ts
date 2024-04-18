import { type Elysia } from "elysia";

import { createYoga } from "graphql-yoga";
import { schema } from "./schema";

export const elysiaYoga = (app: Elysia) => {
  const yoga = createYoga({
    cors: false,
    schema,
    parserAndValidationCache: true,
  });
  const result = app
    .get("/graphql", async ({ request }) => yoga.fetch(request))
    .post("/graphql", async ({ request }) => yoga.fetch(request), {
      type: "none",
    });
  return result;
};

export default elysiaYoga;
