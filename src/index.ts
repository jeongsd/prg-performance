import { Elysia } from "elysia";
import { ElysiaLogging, Logger } from "@otherguy/elysia-logging";
import elysiaYoga from "./elysiaYoga";


const app = new Elysia()
  .use(elysiaYoga).listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}/graphql`
);
