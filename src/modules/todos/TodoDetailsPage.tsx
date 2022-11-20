import { type Todo, type TodoList } from "@prisma/client";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { FaAngleDown } from "react-icons/fa";
import { trpc } from "../../utils/trpc";
import { MainLayout } from "../layouts/MainLayout";
import useTodoList from "./useTodoList";

const Todo = ({ id, todoListId }: { id: string; todoListId: string }) => {
  const { data: todoList } = useTodoList(todoListId);
  const todo = todoList?.todos.find((todo) => todo.id === id);
  const utils = trpc.useContext();
  const markTodoAsDone = trpc.todo.markTodoAsDone.useMutation({
    onSuccess() {
      utils.todo.getTodoList.invalidate({ id: todoListId });
    },
  });

  if (!todo) {
    return null;
  }

  return (
    <div className="flex flex-row items-center border-b bg-white p-2 py-4">
      <input
        id={`todo-input-${todo.id}`}
        type="checkbox"
        defaultChecked={todo.done}
        className="hidden"
        onClick={() =>
          !markTodoAsDone.isLoading &&
          markTodoAsDone.mutate({ id: todo.id, done: !todo.done })
        }
      />
      <label
        htmlFor={`todo-input-${todo.id}`}
        className="nice-font-family pl-12 text-xl font-extralight text-gray-500"
      >
        {todo.text}
      </label>
    </div>
  );
};

const TodoListDisplay = ({ id }: { id: string }) => {
  return (
    <>
      <TodoListHeader id={id} />
      <TodoListBody id={id} />
      <TodoListFooter id={id} />
    </>
  );
};

const TodoListHeader = ({ id }: { id: string }) => {
  const utils = trpc.useContext();
  const addTodo = trpc.todo.addTodo.useMutation({
    onSuccess() {
      utils.todo.getTodoList.invalidate({ id });
    },
  });

  const { register, handleSubmit, reset, formState } = useForm<
    Pick<Todo, "text">
  >({ defaultValues: { text: "" } });
  const onSubmit = (data: Pick<Todo, "text">) => {
    if (addTodo.isLoading) return;
    addTodo.mutate({ todoListId: id, text: data.text });
    reset();
  };

  return (
    <div className="flex flex-row items-center border-b bg-white p-2 py-4">
      <div className="mx-4">
        <FaAngleDown
          className={
            formState.dirtyFields.text ? "text-gray-500" : "text-gray-200"
          }
        />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          className="nice-font-family text-2xl font-thin italic outline-none placeholder:text-gray-300"
          placeholder="What needs to be done?"
          {...register("text")}
        />
      </form>
    </div>
  );
};

const TodoListBody = ({ id }: { id: string }) => {
  const { data: todoList } = useTodoList(id);

  return (
    <>
      {todoList?.todos.map((todo) => (
        <Todo key={todo.id} todoListId={id} id={todo.id} />
      ))}
    </>
  );
};

export const ClearCompletedTodosButton = ({ id }: { id: string }) => {
  const utils = trpc.useContext();
  const clearCompleted = trpc.todo.clearCompleted.useMutation({
    onSuccess() {
      utils.todo.getTodoList.invalidate({ id: id });
    },
  });

  return (
    <button
      className="nice-font-family rounded-md border px-2 font-thin text-gray-500 hover:border-gray-300 hover:bg-gray-50"
      onClick={() => clearCompleted.mutate({ id: id })}
    >
      Clear completed
    </button>
  );
};

const TodoListFooter = ({ id }: { id: string }) => {
  const { data: todoList } = useTodoList(id);
  const itemsLeftToDo = todoList?.todos.filter((t) => !t.done).length;
  const anyItemsAreDone = todoList?.todos.some((t) => t.done);

  return (
    <div className="flex flex-row items-center justify-between border-b bg-white p-2 py-4">
      <div className="nice-font-family px-2 font-thin text-gray-500">
        {itemsLeftToDo} items left
      </div>
      <div>
        {anyItemsAreDone ? <ClearCompletedTodosButton id={id} /> : null}
      </div>
    </div>
  );
};

const TodoListPageTitle = ({ id }: { id: string }) => {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return <PageTitleEditForm id={id} onComplete={() => setIsEditing(false)} />;
  }

  return (
    <div className="group relative">
      <PageTitleDisplay id={id} />
      <button
        onClick={() => setIsEditing(true)}
        className="nice-font-family invisible absolute right-0 top-0 rounded-md border border-rose-300 px-2 font-thin text-rose-400 group-hover:visible"
      >
        Edit
      </button>
    </div>
  );
};

const PageTitleDisplay = ({ id }: { id: string }) => {
  const { data: todoList } = useTodoList(id);
  return (
    <h1 className="font-family-nice text-center text-6xl font-thin text-rose-400">
      {todoList?.name}
    </h1>
  );
};
const PageTitleEditForm = ({
  id,
  onComplete,
}: {
  id: string;
  onComplete: () => void;
}) => {
  const { data: todolist } = useTodoList(id);
  const utils = trpc.useContext();
  const changeTitle = trpc.todo.changeTitle.useMutation({
    async onMutate(data) {
      await utils.todo.getTodoList.cancel({ id });
      const previousTodoList = utils.todo.getTodoList.getData({ id });
      utils.todo.getTodoList.setData({ id }, (todolist) => {
        if (!todolist) return todolist;
        return { ...todolist, name: data.name };
      });
      utils.todo.getTodoLists.setData(undefined, (todolists) => {
        const listIndex = todolists?.findIndex(
          (list: TodoList) => list.id === id
        );
        if (listIndex === undefined) return todolists;

        const list = todolists?.[listIndex];
        if (!list) return todolists;

        return Object.assign([], todolists, {
          listIndex: { ...list, name: data.name },
        });
      });
      return { previousTodoList };
    },
    onError(_err, _data, context) {
      utils.todo.getTodoList.setData({ id }, context?.previousTodoList);
    },
    onSettled: () => {
      utils.todo.getTodoList.invalidate({ id });
    },
  });
  const { register, handleSubmit } = useForm<Pick<TodoList, "name">>({
    defaultValues: { name: todolist?.name },
  });
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const onSubmit = (data: Pick<TodoList, "name">) => {
    changeTitle.mutate({ todoListId: id, name: data.name });
    onComplete();
  };

  const { ref, ...field } = register("name", { onBlur: onComplete });

  return (
    <form
      className="m-0 flex flex-row justify-center p-0"
      onSubmit={handleSubmit(onSubmit)}
    >
      <input
        autoFocus
        className="font-family-nice m-0 w-auto border-0 bg-transparent p-0 text-center text-6xl font-thin text-rose-400 outline-none focus:border-b-2"
        ref={(e) => {
          ref(e);
          nameInputRef.current = e;
        }}
        onKeyUp={(e) => e.key === "Escape" && nameInputRef.current?.blur()}
        {...field}
      />
    </form>
  );
};

export const TodoDetailsPage: NextPage = () => {
  const router = useRouter();
  const id = router.query.id as string;
  const { data: todoList } = useTodoList(id);

  if (!todoList) {
    return <MainLayout>...loading</MainLayout>;
  }

  return (
    <MainLayout>
      <div className="mx-auto mt-8 max-w-full px-4 pb-8 md:w-4/6">
        <TodoListPageTitle id={id} />
        <div className="my-4 w-full rounded-md bg-gray-100 shadow-xl">
          <TodoListDisplay id={id} />
        </div>
      </div>
    </MainLayout>
  );
};
