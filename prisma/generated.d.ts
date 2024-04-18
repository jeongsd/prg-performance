/* eslint-disable */
import type { Prisma, User, Post, Comment } from "./client";
export default interface PrismaTypes {
    User: {
        Name: "User";
        Shape: User;
        Include: Prisma.UserInclude;
        Select: Prisma.UserSelect;
        OrderBy: Prisma.UserOrderByWithRelationInput;
        WhereUnique: Prisma.UserWhereUniqueInput;
        Where: Prisma.UserWhereInput;
        Create: {};
        Update: {};
        RelationName: "posts" | "comments";
        ListRelations: "posts" | "comments";
        Relations: {
            posts: {
                Shape: Post[];
                Name: "Post";
            };
            comments: {
                Shape: Comment[];
                Name: "Comment";
            };
        };
    };
    Post: {
        Name: "Post";
        Shape: Post;
        Include: Prisma.PostInclude;
        Select: Prisma.PostSelect;
        OrderBy: Prisma.PostOrderByWithRelationInput;
        WhereUnique: Prisma.PostWhereUniqueInput;
        Where: Prisma.PostWhereInput;
        Create: {};
        Update: {};
        RelationName: "comments" | "author";
        ListRelations: "comments";
        Relations: {
            comments: {
                Shape: Comment[];
                Name: "Comment";
            };
            author: {
                Shape: User | null;
                Name: "User";
            };
        };
    };
    Comment: {
        Name: "Comment";
        Shape: Comment;
        Include: Prisma.CommentInclude;
        Select: Prisma.CommentSelect;
        OrderBy: Prisma.CommentOrderByWithRelationInput;
        WhereUnique: Prisma.CommentWhereUniqueInput;
        Where: Prisma.CommentWhereInput;
        Create: {};
        Update: {};
        RelationName: "author" | "post";
        ListRelations: never;
        Relations: {
            author: {
                Shape: User | null;
                Name: "User";
            };
            post: {
                Shape: Post | null;
                Name: "Post";
            };
        };
    };
}