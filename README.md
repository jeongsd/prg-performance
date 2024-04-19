# Elysia with Bun runtime

# 초기화
```sh
npx prisma migrate dev --name init    
```


# Test 실행하기 

## 1. parserAndValidationCache

```diff
const yoga = createYoga({
  cors: false,
  schema,
+  parserAndValidationCache: false,
});
```

```sh
brew install k6
k6 run script.js

# npx artillery run --output test-run-report.json graphql.yaml
# npx artillery report test-run-report.json
```

## 2. Just In Time

https://github.com/zalando-incubator/graphql-jit

```ts
import { type Elysia } from "elysia";
import { useGraphQlJit } from '@envelop/graphql-jit'
import { createYoga } from "graphql-yoga";
import { schema } from "./schema";

export const elysiaYoga = (app: Elysia) => {
  const yoga = createYoga({
    cors: false,
    schema,
    parserAndValidationCache: true,
    plugins: [useGraphQlJit()]
  });
  const result = app
    .get("/graphql", async ({ request }) => yoga.fetch(request))
    .post("/graphql", async ({ request }) => yoga.fetch(request), {
      type: "none",
    });
  return result;
};

export default elysiaYoga;
```

## 3. Response Caching

https://the-guild.dev/graphql/yoga-server/docs/features/response-caching


```diff
posts: t.prismaConnection({
+  directives: {
+    cacheControl: {
+      maxAge: 1000
+    }
+  },
  type: "Post",
  cursor: "id",
  resolve: async (query) => {
    const posts = await db.post.findMany({
      ...query,
    });

    await delay(500)

    return posts;
  },
})

```

## 4. Automatic Persisted Queries

```diff
import { type Elysia } from "elysia";
import { useGraphQlJit } from '@envelop/graphql-jit'
import { useAPQ } from '@graphql-yoga/plugin-apq'
import { createYoga } from "graphql-yoga";
import { schema } from "./schema";

export const elysiaYoga = (app: Elysia) => {
  const yoga = createYoga({
    cors: false,
    schema,
    // parserAndValidationCache: false,
    plugins: [
      // useGraphQlJit(),
+      useAPQ()
    ]
  });
  const result = app
    .get("/graphql", async ({ request }) => yoga.fetch(request))
    .post("/graphql", async ({ request }) => yoga.fetch(request), {
      type: "none",
    });
  return result;
};

export default elysiaYoga;

```

```sh
k6 run script2.js
```