import { type Elysia } from "elysia";
import { useGraphQlJit } from '@envelop/graphql-jit'
import { useAPQ } from '@graphql-yoga/plugin-apq'
import { createYoga } from "graphql-yoga";
import { schema } from "./schema";

export const elysiaYoga = (app: Elysia) => {
  const yoga = createYoga({
    cors: false,
    schema,
    parserAndValidationCache: false,
    plugins: [
      // useGraphQlJit(),
      // useAPQ()
    ]
  });
  const result = app
    .get("/graphql", async ({ request }) => yoga.fetch(request))
    .post("/graphql", async ({ request, body, }) => {
      // console.log('body', body)
      return yoga.fetch(request)
    }, {
      type: "none",
    });
  return result;
};

export default elysiaYoga;
