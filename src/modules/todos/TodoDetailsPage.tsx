import { type Todo, type TodoList } from "@prisma/client";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useRef, useState, type HTMLAttributes } from "react";
import { useForm } from "react-hook-form";
import { FaAngleDown } from "react-icons/fa";
import { MainLayout } from "../layouts/MainLayout";
import { AngryButton } from "../style/buttons/AngryButton";
import { Button } from "../style/buttons/Button";
import { PageTitle } from "../style/text/PageTitle";
import {
  useAddTodo,
  useChangeTodoListTitle,
  useClearCompletedTodos,
  useDeleteTodoList,
  useEditTodoText,
  useMarkTodoAsDone,
  useTodo,
  useTodoList,
} from "./hooks";

const TodoTextEditForm = ({
  id,
  todoListId,
  defaultText,
  onComplete,
}: {
  id: string;
  todoListId: string;
  defaultText: string;
  onComplete: () => void;
}) => {
  const editTodoText = useEditTodoText(todoListId);
  const { register, handleSubmit } = useForm<Pick<Todo, "text">>({
    defaultValues: { text: defaultText },
  });
  const onSubmit = (data: Pick<Todo, "text">) => {
    editTodoText.mutate({ id, text: data.text });
    onComplete();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        className="nice-font-family pl-12 text-xl font-extralight text-gray-500"
        type="text"
        autoFocus
        {...register("text", { onBlur: onComplete })}
      />
    </form>
  );
};

const TodoTextLabel = ({
  children,
  ...props
}: { children: string } & HTMLAttributes<HTMLLabelElement>) => {
  return (
    <label
      {...props}
      className="nice-font-family pl-12 text-xl font-extralight text-gray-500"
    >
      {children}
    </label>
  );
};

const Todo = ({ id, todoListId }: { id: string; todoListId: string }) => {
  const todo = useTodo(id, todoListId);
  const markTodoAsDone = useMarkTodoAsDone();
  const [isEditing, setIsEditing] = useState(false);

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
      {isEditing ? (
        <TodoTextEditForm
          onComplete={() => setIsEditing(false)}
          id={id}
          todoListId={todoListId}
          defaultText={todo.text}
        />
      ) : (
        <TodoTextLabel onDoubleClick={() => setIsEditing(true)}>
          {todo.text}
        </TodoTextLabel>
      )}
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
  const addTodo = useAddTodo(id);
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
  const clearCompletedTodos = useClearCompletedTodos();

  return (
    <Button onClick={() => clearCompletedTodos.mutate({ id: id })}>
      Clear completed
    </Button>
  );
};

export const DeleteTodoListButton = ({ id }: { id: string }) => {
  const deleteTodoList = useDeleteTodoList();

  return (
    <AngryButton onClick={() => deleteTodoList.mutate({ id: id })}>
      Delete List
    </AngryButton>
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
  const onSubmit = (data: Pick<TodoList, "name">) => {
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
