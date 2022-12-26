import { trpc } from "../../utils/trpc";
import type { Todo, TodoList } from "@prisma/client";

export function useTodoLists() {
  return trpc.todo.getTodoLists.useQuery();
}

export function useTodoList(id: string) {
  return trpc.todo.getTodoLists.useQuery(undefined, {
    select: (lists) => lists.find((l) => l.id === id),
  });
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

export function useCreateTodoList() {
  return trpc.todo.createTodoList.useMutation();
}

export function useDeleteTodoList() {
  const utils = trpc.useContext();
  return trpc.todo.deleteTodoList.useMutation({
    async onMutate(variables) {
      await utils.todo.getTodoLists.cancel();
      const previousData = utils.todo.getTodoLists.getData();

      utils.todo.getTodoLists.setData(undefined, (todoLists = []) => {
        return todoLists.filter((list) => list.id !== variables.id);
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

export function useChangeTodoListTitle() {
  const utils = trpc.useContext();
  return trpc.todo.changeTitle.useMutation({
    async onMutate(variables) {
      await utils.todo.getTodoLists.cancel();
      const previousData = utils.todo.getTodoLists.getData();

      utils.todo.getTodoLists.setData(undefined, (todoLists = []) => {
        return updateTodoList(todoLists, variables.id, (list) => ({
          ...list,
          name: variables.name,
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

export function useClearCompletedTodos() {
  const utils = trpc.useContext();
  return trpc.todo.clearCompleted.useMutation({
    async onMutate(variables) {
      await utils.todo.getTodoLists.cancel();
      const previousData = utils.todo.getTodoLists.getData();

      utils.todo.getTodoLists.setData(undefined, (todoLists = []) => {
        return updateTodoList(todoLists, variables.id, (list) => ({
          ...list,
          todos: list.todos.filter((todo) => !todo.done),
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

type TodoUpdateAction = (todo: Todo) => Todo;

function updateTodo(todos: Todo[], todoId: string, update: TodoUpdateAction) {
  if (todos?.length <= 0) return todos;
  const index = todos?.findIndex((list) => list.id === todoId);
  if (index === -1) return todos;
  const todo = todos[index];
  if (!todo) return todos;

  return [...todos.slice(0, index), update(todo), ...todos.slice(index + 1)];
}

export function useEditTodo(todoListId: string) {
  const utils = trpc.useContext();
  return trpc.todo.editTodo.useMutation({
    async onMutate(variables) {
      await utils.todo.getTodoLists.cancel();
      const previousData = utils.todo.getTodoLists.getData();

      utils.todo.getTodoLists.setData(undefined, (todoLists = []) => {
        return updateTodoList(todoLists, todoListId, (list) => ({
          ...list,
          todos: updateTodo(list.todos, variables.id, (todo) => ({
            ...todo,
            ...variables.data,
          })),
        }));
      });

      return { previousData };
    },
    onError(_err, _var, context) {
      if (context?.previousData) {
        utils.todo.getTodoLists.setData(undefined, context.previousData);
      }
    },
    onSettled(data, _error, variables) {
      utils.todo.getTodoLists.setData(undefined, (todoLists = []) => {
        return updateTodoList(todoLists, todoListId, (list) => ({
          ...list,
          todos: updateTodo(list.todos, variables.id, (todo) => ({
            ...todo,
            ...data,
          })),
        }));
      });
    },
  });
}
