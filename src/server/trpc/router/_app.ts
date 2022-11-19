import { router } from "../trpc";
import { authRouter } from "./auth";
import { exampleRouter } from "./example";
import { accountsRouter } from "./accounts";
import { todoRouter } from "./todo";

export const appRouter = router({
  example: exampleRouter,
  auth: authRouter,
  accounts: accountsRouter,
  todo: todoRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
