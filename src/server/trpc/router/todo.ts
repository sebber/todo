import { NotFoundError } from "@prisma/client/runtime";
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const todoRouter = router({
  createTodoList: protectedProcedure.mutation(({ ctx }) => {
    return ctx.prisma.todoList.create({
      data: {
        name: "New Todo List",
        ownerId: ctx.session.user.id,
      },
    });
  }),
  deleteTodoList: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.todoList.delete({ where: { id: input.id } });
    }),
  changeTitle: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.todoList.updateMany({
        where: { id: input.id, ownerId: ctx.session.user.id },
        data: { name: input.name },
      });
      return ctx.prisma.todoList.findUnique({ where: { id: input.id } });
    }),
  addTodo: protectedProcedure
    .input(z.object({ todoListId: z.string(), text: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.todo.create({
        data: { todoListId: input.todoListId, text: input.text },
      });
    }),
  changeTodoText: protectedProcedure
    .input(z.object({ id: z.string(), text: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.todo.update({
        where: { id: input.id },
        data: { text: input.text },
      });
    }),
  toggle: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const todo = await ctx.prisma.todo.findUnique({
        where: { id: input.id },
      });
      if (!todo) {
        throw new NotFoundError("Did not find todo");
      }
      return ctx.prisma.todo.update({
        where: { id: input.id },
        data: { done: !todo.done },
      });
    }),
  clearCompleted: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.todo.deleteMany({
        where: { todoListId: input.id, done: true },
      });
    }),
  getTodoLists: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.todoList.findMany({
      where: { ownerId: ctx.session.user.id },
    });
  }),
  getTodoList: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.todoList.findFirst({
        where: { id: input.id, ownerId: ctx.session.user.id },
      });
    }),
  getTodos: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.todo.findMany({
        where: { todoListId: input.id },
      });
    }),
});
