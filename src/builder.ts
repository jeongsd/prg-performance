import SchemaBuilder from "@pothos/core";
import DirectivePlugin from '@pothos/plugin-directives';
import PrismaPlugin from "@pothos/plugin-prisma";
import RelayPlugin from "@pothos/plugin-relay";
import type PrismaTypes from "../prisma/generated";
import { db } from "./db";


export const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes,
  Directives: {
    cacheControl: {
      locations: 'OBJECT' | 'FIELD_DEFINITION';
      args: { maxAge: number };
    };
  };
}>({
  plugins: [PrismaPlugin, RelayPlugin, DirectivePlugin],
  relayOptions: {},
  prisma: {
    client: db,
  },
});
