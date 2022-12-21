import { trpc } from "../../utils/trpc";

export function useTodoList(id: string) {
  return trpc.todo.getTodoLists.useQuery(undefined, {
    select: (lists) => lists.find((l) => l.id === id),
  });
}

export function useTodoLists() {
  return trpc.todo.getTodoLists.useQuery();
}

export function useTodos(todoListId: string) {
  return trpc.todo.getTodoLists.useQuery(undefined, {
    select: (lists) => lists.find((l) => l.id === todoListId)?.todos,
  });
}

export function useTodo(id: string, todoListId: string) {
  return trpc.todo.getTodoLists.useQuery(undefined, {
    select: (lists) =>
      lists
        .find((l) => l.id === todoListId)
        ?.todos?.find((todo) => todo.id === id),
  });
}

export function useToggleTodo(todoListId: string) {
  return trpc.todo.toggle.useMutation();
}

export function useEditTodoText(todoListId: string) {
  return trpc.todo.changeTodoText.useMutation();
}

export function useClearCompletedTodos() {
  return trpc.todo.clearCompleted.useMutation();
}

export function useCreateTodoList() {
  return trpc.todo.createTodoList.useMutation();
}

export function useChangeTodoListTitle() {
  return trpc.todo.changeTitle.useMutation();
}

export function useAddTodo(todoListId: string) {
  return trpc.todo.addTodo.useMutation();
}

export function useDeleteTodoList() {
  return trpc.todo.deleteTodoList.useMutation();
}
