import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";

export function useToggleTodo(todoListId: string) {
  const utils = trpc.useContext();

  return trpc.todo.toggle.useMutation({
    async onMutate({ id }) {
      await utils.todo.getTodoList.cancel({ id: todoListId });
      const previousTodoList = utils.todo.getTodoList.getData({
        id: todoListId,
      });
      if (previousTodoList) {
        const oldTodo = previousTodoList?.todos.find((todo) => todo.id === id);

        utils.todo.getTodoList.setData({ id: todoListId }, (oldTodoList) => {
          const todoIndex = oldTodoList?.todos.findIndex(
            (todo) => todo.id === oldTodo?.id
          );
          if (!todoIndex) return oldTodoList;
          return Object.assign({}, oldTodoList, {
            todos: Object.assign([], oldTodoList?.todos, {
              [todoIndex]: Object.assign({}, oldTodo, { done: !oldTodo?.done }),
            }),
          });
        });
      }
      return { previousTodoList };
    },
    onSettled() {
      utils.todo.getTodoList.invalidate({ id: todoListId });
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
  return todoList?.todos.find((todo) => todo.id === id);
}

export function useEditTodoText(todoListId: string) {
  const utils = trpc.useContext();
  return trpc.todo.changeTodoText.useMutation({
    onSuccess() {
      utils.todo.getTodoList.invalidate({ id: todoListId });
    },
  });
}

export function useClearCompletedTodos() {
  const utils = trpc.useContext();
  return trpc.todo.clearCompleted.useMutation({
    onSuccess(_data, variables) {
      utils.todo.getTodoList.invalidate({ id: variables.id });
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
    onSuccess(data, variables) {
      utils.todo.getTodoList.setData({ id: variables.id }, (old) =>
        Object.assign({}, old, data)
      );
    },
  });
}

export function useAddTodo(id: string) {
  const utils = trpc.useContext();
  return trpc.todo.addTodo.useMutation({
    onSuccess() {
      utils.todo.getTodoList.invalidate({ id });
    },
  });
}

export function useDeleteTodoList() {
  const router = useRouter();
  const utils = trpc.useContext();
  return trpc.todo.deleteTodoList.useMutation({
    onSuccess(_data, variables) {
      utils.todo.getTodoList.invalidate({ id: variables.id });
      utils.todo.getTodoLists.invalidate();
      router.push(`/todos`);
    },
  });
}
