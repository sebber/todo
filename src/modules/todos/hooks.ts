import { useRouter } from "next/router";
import { useMemo } from "react";
import { trpc } from "../../utils/trpc";

export function useMarkTodoAsDone() {
  const utils = trpc.useContext();

  return trpc.todo.markTodoAsDone.useMutation({
    onSuccess(data) {
      utils.todo.getTodoList.invalidate({ id: data.todoListId });
    },
  });
}

export function useTodoList(id: string) {
  return trpc.todo.getTodoList.useQuery({ id: id });
}

export function useTodoLists() {
  return trpc.todo.getTodoLists.useQuery();
}

export function useTodo(id: string, todoListId: string) {
  const { data: todoList } = useTodoList(todoListId);
  const todo = useMemo(
    () => todoList?.todos.find((todo) => todo.id === id),
    [todoList?.todos, id]
  );
  return todo;
}

export function useClearCompletedTodos(todoListId: string) {
  const utils = trpc.useContext();
  return trpc.todo.clearCompleted.useMutation({
    onSuccess() {
      utils.todo.getTodoList.invalidate({ id: todoListId });
    },
  });
}

export function useCreateTodoList() {
  const router = useRouter();
  return trpc.todo.createTodoList.useMutation({
    onSuccess(data) {
      router.push(`/todos/${data.id}`);
    },
  });
}