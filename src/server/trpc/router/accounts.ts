import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const accountsRouter = router({
  getUserById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.user.findUnique({ where: { id: input.id } });
    }),
});
