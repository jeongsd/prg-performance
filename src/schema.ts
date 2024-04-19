
import { builder } from "./builder";
import { db } from "./db";
import { decodeGlobalID } from "@pothos/plugin-relay";

async function delay(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

const User = builder.prismaNode("User", {
  id: { field: "id" },
  fields: (t) => ({
    email: t.exposeString("email"),
    username: t.exposeString("username"),
    posts: t.relation("posts"),
  }),
});

builder.prismaNode("Post", {
  id: { field: "id" },
  fields: (t) => ({
    title: t.exposeString("title"),
    content: t.exposeString("content"),
    author: t.relation("author"),
    comments: t.relation("comments"),
  }),
});

builder.prismaNode("Comment", {
  id: { field: "id" },
  fields: (t) => ({
    comment: t.exposeString("comment"),
    author: t.relation("author"),
    post: t.relation("post"),
  }),
});

builder.queryType({
  fields: (t) => ({
    post: t.prismaField({
      type: "Post",
      nullable: true,
      args: {
        id: t.arg.id({ required: true }),
      },
      resolve: (query, root, args) => {
        const { id } = decodeGlobalID(String(args.id));
        return db.post.findUnique({
          ...query,
          where: { id: Number.parseInt(id, 10) },
        });
      },
    }),
    posts: t.prismaConnection({
      type: "Post",
      cursor: "id",
      resolve: async (query) => {
        const posts = await db.post.findMany({
          ...query,
        });

        await delay(500)

        return posts;
      },
    }),
    user: t.prismaField({
      type: "User",
      nullable: true,
      args: {
        id: t.arg.id({ required: true }),
      },
      resolve: (query, root, args) => {
        const { id } = decodeGlobalID(String(args.id));

        return db.user.findUnique({
          ...query,
          where: { id: Number.parseInt(id, 10) },
        });
      },
    }),
  }),
});

const UserInput = builder.inputType("UserInput", {
  fields: (t) => ({
    email: t.string({ required: true }),
    username: t.string({ required: true }),
  }),
});
const PostInput = builder.inputType("PostInput", {
  fields: (t) => ({
    title: t.string({ required: true }),
    content: t.string({ required: true }),
    authorId: t.id({ required: true }),
  }),
});
const CommentInput = builder.inputType("CommentInput", {
  fields: (t) => ({
    comment: t.string({ required: true }),
    authorId: t.id({ required: true }),
    postId: t.id({ required: true }),
  }),
});

builder.mutationType({
  fields: (t) => ({
    createUser: t.prismaField({
      type: "User",
      args: {
        input: t.arg({ type: UserInput, required: true }),
      },
      resolve: (include, root, args, ctx, info) =>
        db.user.create({
          data: args.input,
          ...include,
        }),
    }),
    createPost: t.prismaField({
      type: "Post",
      args: {
        input: t.arg({ type: PostInput, required: true }),
      },
      resolve: (include, root, args, ctx, info) => {
        const { id: authorId } = decodeGlobalID(String(args.input.authorId));

        return db.post.create({
          data: {
            content: args.input.content,
            title: args.input.title,
          },
          ...include,
        });
      },
    }),
    createComment: t.prismaField({
      type: "Comment",
      args: {
        input: t.arg({ type: CommentInput, required: true }),
      },
      resolve: (include, root, args, ctx, info) => {
        const { id: authorId } = decodeGlobalID(String(args.input.authorId));
        const { id: postId } = decodeGlobalID(String(args.input.postId));

        return db.comment.create({
          data: {
            comment: args.input.comment,
          },
        });
      },
    }),
    deletePost: t.prismaField({
      type: "Post",
      args: {
        id: t.arg.id({ required: true }),
      },
      resolve: (include, root, args, ctx, info) => {
        const { id } = decodeGlobalID(String(args.id));

        return db.post.delete({
          where: { id: Number(id) },
          ...include,
        });
      },
    }),
    deleteUser: t.prismaField({
      type: "User",
      args: {
        id: t.arg.id({ required: true }),
      },
      resolve: (include, root, args, ctx, info) => {
        const { id } = decodeGlobalID(String(args.id));
        return db.user.delete({
          where: { id: Number(id) },
          ...include,
        });
      },
    }),
  }),
});

export const schema = builder.toSchema();
