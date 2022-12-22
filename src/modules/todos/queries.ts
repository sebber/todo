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
  return trpc.todo.deleteTodoList.useMutation();
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

type TodoUpdateAction = (todo: Todo) => Todo;

function updateTodo(todos: Todo[], todoId: string, update: TodoUpdateAction) {
  if (todos?.length <= 0) return todos;
  const index = todos?.findIndex((list) => list.id === todoId);
  if (index === -1) return todos;
  const todo = todos[index];
  if (!todo) return todos;

  return [...todos.slice(0, index), update(todo), ...todos.slice(index + 1)];
}

export function useToggleTodo(todoListId: string) {
  const utils = trpc.useContext();
  return trpc.todo.toggle.useMutation({
    async onMutate(variables) {
      await utils.todo.getTodoLists.cancel();
      const previousData = utils.todo.getTodoLists.getData();

      utils.todo.getTodoLists.setData(undefined, (todoLists = []) => {
        return updateTodoList(todoLists, todoListId, (list) => ({
          ...list,
          todos: updateTodo(list.todos, variables.id, (todo) => ({
            ...todo,
            done: !todo.done,
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
  });
}

export function useEditTodoText(todoListId: string) {
  const utils = trpc.useContext();
  return trpc.todo.changeTodoText.useMutation({
    async onMutate(variables) {
      await utils.todo.getTodoLists.cancel();
      const previousData = utils.todo.getTodoLists.getData();

      utils.todo.getTodoLists.setData(undefined, (todoLists = []) => {
        return updateTodoList(todoLists, todoListId, (list) => ({
          ...list,
          todos: updateTodo(list.todos, variables.id, (todo) => ({
            ...todo,
            text: variables.text,
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
  });
}

export function useClearCompletedTodos() {
  return trpc.todo.clearCompleted.useMutation();
}
