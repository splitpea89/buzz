import { clerkClient } from "@clerk/nextjs";
import type { User } from "@clerk/nextjs/dist/types/api";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(1, "10 s"),
    analytics: true
});

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
        take: 100,
        orderBy: [{createdAt: "desc"}],
    });

    const users = (await clerkClient.users.getUserList({
        userId: posts.map((post) => post.authorId),
        limit: 100,
    })).map(filterUserForClient);

    return posts.map((post) => {
        const author = users.find((user) => user.id === post.authorId);

        if (!author || !author.username) throw new TRPCError({code: "INTERNAL_SERVER_ERROR", message: "Author for post not found"});

        return {
            post,
            author: {
                ...author,
                username: author.username,
            }
        };
    });
  }),

  create: privateProcedure.input(z.object({
    content: z.string().min(1).max(255),
  })).mutation(async ({ ctx, input }) => {
    const authorId = ctx.userId;

    const { success } = await ratelimit.limit(authorId);

    if (!success) throw new TRPCError({code: "TOO_MANY_REQUESTS"});

    const post = await ctx.prisma.post.create({
        data: {
            authorId,
            content: input.content,
        }
    });

    return post;
  })
});
