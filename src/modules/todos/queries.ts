import { trpc } from "../../utils/trpc";
import { Todo, type TodoList } from "@prisma/client";

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

type TodoListWithTodos = TodoList & { todos: Todo[] };
type TodoListUpdateAction = (todoList: TodoListWithTodos) => TodoListWithTodos;

function updateTodoList(
  todoLists: TodoListWithTodos[],
  todoListId: string,
  update: TodoListUpdateAction
) {
  if (todoLists?.length <= 0) return todoLists;
  const index = todoLists?.findIndex((list) => list.id === todoListId);
  if (index === -1) return todoLists;
  const todoList = todoLists[index];
  if (!todoList) return todoLists;

  return [
    ...todoLists.slice(0, index),
    update(todoList),
    ...todoLists.slice(index + 1),
  ];
}

export function useAddTodo(todoListId: string) {
  const utils = trpc.useContext();
  return trpc.todo.addTodo.useMutation({
    async onMutate(variables) {
      await utils.todo.getTodoLists.cancel();
      const previousData = utils.todo.getTodoLists.getData();

      utils.todo.getTodoLists.setData(undefined, (todoLists = []) => {
        return updateTodoList(todoLists, todoListId, (list) => ({
          ...list,
          todos: [
            ...list.todos,
            {
              todoListId,
              id: "_optimistic_id",
              text: variables.text,
              done: false,
            },
          ],
        }));
      });

      return { previousData };
    },
    onError(_err, _var, context) {
      if (context?.previousData) {
        utils.todo.getTodoLists.setData(undefined, context.previousData);
      }
    },
  });
}

export function useDeleteTodoList() {
  return trpc.todo.deleteTodoList.useMutation();
}
