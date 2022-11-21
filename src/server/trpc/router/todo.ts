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
    .input(z.object({ todoListId: z.string(), name: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.todoList.updateMany({
        where: { id: input.todoListId, ownerId: ctx.session.user.id },
        data: { name: input.name },
      });
    }),
  addTodo: protectedProcedure
    .input(z.object({ todoListId: z.string(), text: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.todo.create({
        data: { todoListId: input.todoListId, text: input.text },
      });
    }),
  markTodoAsDone: protectedProcedure
    .input(z.object({ id: z.string(), done: z.boolean() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.todo.update({
        where: { id: input.id },
        data: { done: input.done },
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
        include: { todos: true },
      });
    }),
});
