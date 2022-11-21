import { type NextPage } from "next";
import Link from "next/link";
import { MainLayout } from "../layouts/MainLayout";
import useTodoLists from "./useTodoLists";
import { FaAngleRight } from "react-icons/fa";
import { Button } from "../style/buttons/button";

const TodoListDisplay = ({ id }: { id: string }) => {
  const { data: todoLists } = useTodoLists();
  const todo = todoLists?.find((list) => list.id === id);

  if (!todo) {
    return null;
  }

  return (
    <div className="flex flex-row items-center border-b bg-white p-4 hover:bg-gray-50">
      <FaAngleRight className="text-gray-500" />
      <span className="nice-font-family ml-2 text-xl font-extralight text-gray-500">
        {todo.name}
      </span>
    </div>
  );
};

const TodoListsDisplay = () => {
  const { data: todoLists } = useTodoLists();

  return (
    <>
      {todoLists?.map((list) => (
        <Link key={list.id} href={`/todos/${list.id}`}>
          <TodoListDisplay key={list.id} id={list.id} />
        </Link>
      ))}
    </>
  );
};

export const CreateTodoLinkButton = () => {
  const createTodoList = useCreateTodoList();

  return (
    <Button onClick={() => createTodoList.mutate()}>Make a new list</Button>
  );
};

export const TodoListsPage: NextPage = () => {
  return (
    <MainLayout>
      <div className="mx-auto mt-8 flex max-w-full flex-col justify-center lg:w-2/3">
        <h1 className="font-family-nice text-center text-6xl font-thin text-rose-400">
          Your Todo Lists
        </h1>
        <div className="flex flex-row">
          <CreateTodoLinkButton />
        </div>

        <div className="my-4 w-full rounded-md bg-gray-100 shadow-xl">
          <TodoListsDisplay />
        </div>
      </div>
    </MainLayout>
  );
};
