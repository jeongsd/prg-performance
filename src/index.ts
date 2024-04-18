import { Elysia } from "elysia";
import { logger } from "@bogeychan/elysia-logger";

import elysiaYoga from "./elysiaYoga";

const app = new Elysia().use(elysiaYoga).listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}/graphql`
);
