import { PrismaClient } from "@prisma/client";

import { env } from "../../env/server.mjs";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

prisma.$use(async (params, next) => {
  if (params.model == "TodoList") {
    if (params.action === "findUnique" || params.action === "findFirst") {
      params.action = "findFirst";
      params.args.where["deletedAt"] = null;
    }
    if (params.action === "findMany") {
      if (params.args.where) {
        if (params.args.where.deletedAt == undefined) {
          params.args.where["deletedAt"] = null;
        }
      } else {
        params.args["where"] = { deletedAt: null };
      }
    }
  }
  return next(params);
});

prisma.$use(async (params, next) => {
  if (params.model == "TodoList") {
    if (params.action == "update") {
      params.action = "updateMany";
      params.args.where["deletedAt"] = null;
    }
    if (params.action == "updateMany") {
      if (params.args.where != undefined) {
        params.args.where["deletedAt"] = null;
      } else {
        params.args["where"] = { deleted: null };
      }
    }
  }
  return next(params);
});

prisma.$use(async (params, next) => {
  if (params.model === "TodoList") {
    if (params.action == "delete") {
      params.action = "update";
      params.args["data"] = { deletedAt: new Date() };
    }
    if (params.action == "deleteMany") {
      params.action = "updateMany";
      if (params.args.data != undefined) {
        params.args.data["deletedAt"] = new Date();
      } else {
        params.args["data"] = { deletedAt: new Date() };
      }
    }
  }
  return next(params);
});

if (env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
