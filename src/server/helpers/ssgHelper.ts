import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "../api/root";
import { prisma } from "../db";
import superjson from "superjson";


export const generateSSGHelper = () => {
    const helpers = createServerSideHelpers({
      router: appRouter,
      ctx: { prisma, userId: null },
      transformer: superjson,
    });
    return helpers;
}