import type { Todo } from "@prisma/client";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";

function updateTodo(todoId: string, newData: Partial<Todo>, todos: Todo[]) {
  const index = todos.findIndex((todo) => todo.id === todoId);
  if (-1 === index) throw new Error("Couldn't find todo");
  const oldTodo = todos[index];
  if (!oldTodo) throw new Error("Couldn't find todo");

  return [
    ...todos.slice(0, index),
    { ...todos[index], ...newData },
    ...todos.slice(index + 1),
  ] as Todo[];
}

function toggleTodo(todoId: string, todos: Todo[]): Todo[] {
  const index = todos.findIndex((todo) => todo.id === todoId);
  if (-1 === index) throw new Error("Couldn't find todo");
  const todo = todos[index];
  if (!todo) throw new Error("Couldn't find todo");

  return [
    ...todos.slice(0, index),
    { ...todos[index], done: !todo.done },
    ...todos.slice(index + 1),
  ] as Todo[];
}

export function useToggleTodo(todoListId: string) {
  const utils = trpc.useContext();

  return trpc.todo.toggle.useMutation({
    async onMutate({ id }) {
      await utils.todo.getTodos.cancel({ id: todoListId });
      const previousTodos = utils.todo.getTodos.getData({
        id: todoListId,
      });

      if (previousTodos && previousTodos.length > 0) {
        utils.todo.getTodos.setData(
          { id: todoListId },
          toggleTodo(id, previousTodos)
        );
      }

      return { previousTodos };
    },
    onSuccess(data, _variables) {
      utils.todo.getTodos.setData({ id: todoListId }, (todos) =>
        updateTodo(data.id, data, todos || [])
      );
    },
    onSettled() {
      utils.todo.getTodoList.invalidate({ id: todoListId });
    },
  });
}

export function useTodoList(id: string) {
  return trpc.todo.getTodoList.useQuery({ id });
}

export function useTodoLists() {
  return trpc.todo.getTodoLists.useQuery();
}

export function useTodos(todoListId: string) {
  return trpc.todo.getTodos.useQuery({ id: todoListId });
}

export function useTodo(id: string, todoListId: string) {
  const { data: todos } = useTodos(todoListId);
  return todos?.find((todo) => todo.id === id);
}

export function useEditTodoText(todoListId: string) {
  const utils = trpc.useContext();
  return trpc.todo.changeTodoText.useMutation({
    async onMutate(variables) {
      await utils.todo.getTodos.cancel({ id: todoListId });
      const previousTodos = utils.todo.getTodos.getData({
        id: todoListId,
      });
      if (previousTodos) {
        utils.todo.getTodos.setData(
          { id: todoListId },
          updateTodo(variables.id, { text: variables.text }, previousTodos)
        );
      }
      return { previousTodos };
    },
    onSuccess(data, _variables, context) {
      if (context?.previousTodos) {
        utils.todo.getTodos.setData(
          { id: todoListId },
          updateTodo(data.id, data, context.previousTodos)
        );
      }
    },
    onSettled() {
      utils.todo.getTodos.invalidate({ id: todoListId });
    },
  });
}

export function useClearCompletedTodos() {
  const utils = trpc.useContext();
  return trpc.todo.clearCompleted.useMutation({
    async onMutate({ id }) {
      await utils.todo.getTodos.cancel({ id });
      const previousTodos = utils.todo.getTodos.getData({ id });
      if (previousTodos) {
        utils.todo.getTodos.setData(
          { id },
          previousTodos.filter((todo) => !todo.done)
        );
      }
      return { previousTodos };
    },
    onSettled(_data, _error, variables) {
      utils.todo.getTodos.invalidate({ id: variables.id });
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

export function useChangeTodoListTitle() {
  const utils = trpc.useContext();
  return trpc.todo.changeTitle.useMutation({
    async onMutate(variables) {
      const { id, name } = variables;
      await utils.todo.getTodoList.cancel({ id: id });
      const previousTodoList = utils.todo.getTodoList.getData({ id });
      utils.todo.getTodoList.setData({ id }, (old) => {
        return Object.assign({}, old, { name });
      });

      // utils.todo.getTodoLists.setData(undefined, (todolists) => {
      //   const listIndex = todolists?.findIndex(
      //     (list: TodoList) => list.id === id
      //   );
      //   if (listIndex === undefined) return todolists;

      //   const list = todolists?.[listIndex];
      //   if (!list) return todolists;

      //   return Object.assign([], todolists, {
      //     listIndex: Object.assign({}, list, { name: name }),
      //   });
      // });
      return { previousTodoList };
    },
    onError(_err, { id }, context) {
      utils.todo.getTodoList.setData({ id }, context?.previousTodoList);
    },
    onSettled(data) {
      if (data?.id) {
        utils.todo.getTodoList.invalidate({ id: data.id });
      }
    },
  });
}

export function useAddTodo(todoListId: string) {
  const utils = trpc.useContext();
  return trpc.todo.addTodo.useMutation({
    async onMutate({ text }) {
      await utils.todo.getTodos.cancel({ id: todoListId });
      const previousTodos = utils.todo.getTodos.getData({
        id: todoListId,
      });
      if (previousTodos) {
        utils.todo.getTodos.setData({ id: todoListId }, [
          ...previousTodos,
          {
            todoListId: todoListId,
            id: "_optimistic_",
            text,
            done: false,
          },
        ]);
      }
      return { previousTodos };
    },
    onSuccess(data) {
      const optimisticTodoList = utils.todo.getTodos.getData({
        id: todoListId,
      });
      if (optimisticTodoList) {
        utils.todo.getTodos.setData(
          { id: todoListId },
          updateTodo("_optimistic_", data, optimisticTodoList)
        );
      }
    },
    onSettled() {
      utils.todo.getTodos.invalidate({ id: todoListId });
    },
  });
}

export function useDeleteTodoList() {
  const router = useRouter();
  const utils = trpc.useContext();
  return trpc.todo.deleteTodoList.useMutation({
    async onMutate({ id }) {
      await utils.todo.getTodoLists.cancel();
      utils.todo.getTodoLists.setData(undefined, (lists) => {
        return lists?.filter((list) => list.id !== id);
      });
    },
    onSuccess(_data, variables) {
      utils.todo.getTodoList.invalidate({ id: variables.id });
      utils.todo.getTodoLists.invalidate();
      router.push(`/todos`);
    },
  });
}
