import { type Todo, type TodoList } from "@prisma/client";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useCallback, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { MainLayout } from "../layouts/MainLayout";
import { PageTitle } from "../style/text/PageTitle";
import {
  useAddTodo,
  useChangeTodoListTitle,
  useTodoList,
  useTodos,
} from "./queries";
import { TodoCheckbox } from "./TodoCheckbox";
import { TodoItemText } from "./TodoItemText";
import { Field, OneForm } from "@oneform/react";
import { ClearCompletedTodosButton } from "./ClearCompletedTodosButton";
import { DeleteTodoListButton } from "./DeleteTodoListButton";
import { TitleInput } from "./TitleInput";

const Todo = ({
  id,
  todoListId,
  todo,
}: {
  id: string;
  todoListId: string;
  todo: Todo;
}) => {
  return (
    <div className="flex flex-row items-center border-b bg-white p-2 py-4">
      <div className="border-gray-500 px-4">
        <TodoCheckbox id={id} todoListId={todoListId} checked={todo.done} />
      </div>
      <TodoItemText id={id} todoListId={todoListId} text={todo.text} />
    </div>
  );
};

const TodoListDisplay = ({ id }: { id: string }) => {
  const { data: todos = [] } = useTodos(id);

  return (
    <>
      <TodoListHeader id={id} />
      <TodoListBody id={id} todos={todos} />
      <TodoListFooter id={id} todos={todos} />
    </>
  );
};

const TodoListHeader = ({ id }: { id: string }) => {
  const addTodo = useAddTodo(id);

  const handleSubmit = useCallback(
    ({ registeredValues: data }: { registeredValues: Record<string, any> }) => {
      if (addTodo.isLoading) return;
      addTodo.mutate({ todoListId: id, text: data.text });
    },
    []
  );

  return (
    <OneForm onSubmit={handleSubmit} values={{}}>
      <Field>
        <TitleInput name="text" />
      </Field>
    </OneForm>
  );
};

const TodoListBody = ({ id, todos }: { id: string; todos: Todo[] }) => {
  return (
    <>
      {todos?.map((todo) => (
        <Todo key={todo.id} todoListId={id} id={todo.id} todo={todo} />
      ))}
    </>
  );
};

const TodoListFooter = ({ id, todos }: { id: string; todos: Todo[] }) => {
  const itemsLeftToDo = useMemo(
    () => todos?.filter((t) => !t.done).length,
    [todos]
  );
  const anyItemsAreDone = useMemo(() => todos?.some((t) => t.done), [todos]);

  return (
    <div className="flex flex-row items-center justify-between border-b bg-white p-2 py-4">
      <div className="nice-font-family px-2 font-thin text-gray-500">
        {itemsLeftToDo} items left
      </div>
      <div className="grid grid-flow-col grid-rows-1 gap-2">
        {anyItemsAreDone ? <ClearCompletedTodosButton id={id} /> : null}
        <DeleteTodoListButton id={id} />
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
  return <PageTitle>{todoList?.name}</PageTitle>;
};

const PageTitleEditForm = ({
  id,
  onComplete,
}: {
  id: string;
  onComplete: () => void;
}) => {
  const { data: todolist } = useTodoList(id);
  const changeTitle = useChangeTodoListTitle();
  const { register, handleSubmit } = useForm<Pick<TodoList, "name">>({
    defaultValues: { name: todolist?.name },
  });
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const onSubmit = async (data: Pick<TodoList, "name">) => {
    changeTitle.mutate({ id, name: data.name });
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
      <TodoListPageTitle id={id} />
      <div className="my-4 w-full rounded-md bg-gray-100 shadow-xl">
        <TodoListDisplay id={id} />
      </div>
    </MainLayout>
  );
};
