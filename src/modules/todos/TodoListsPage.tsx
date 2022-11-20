import { type NextPage } from "next";
import Link from "next/link";
import { MainLayout } from "../layouts/MainLayout";
import useTodoLists from "./useTodoLists";
import { FaAngleRight, FaArchive } from "react-icons/fa";
import { CreateTodoLink } from "./CreateTodoLink";
import { trpc } from "../../utils/trpc";

const ArchiveTodoListButton = ({ id }: { id: string }) => {
  const utils = trpc.useContext();
  const archiveTodoList = trpc.todo.archiveTodoList.useMutation({
    onMutate(variables) {
      console.log("archiveTodoList - onMutate", { variables });
    },
    onSuccess(data, variables, context) {
      console.log("archiveTodoList - onMutate", { data, variables, context });
      utils.todo.getTodoList.invalidate({ id: id });
      utils.todo.getTodoLists.invalidate();
    },
  });

  return (
    <button
      onClick={() => archiveTodoList.mutate({ id: id })}
      className="invisible absolute right-4 justify-self-end rounded-md border p-2 hover:bg-white group-hover:visible"
    >
      <FaArchive />
    </button>
  );
};

const TodoListDisplay = ({ id }: { id: string }) => {
  const { data: todoLists } = useTodoLists();
  const todo = todoLists?.find((list) => list.id === id);

  if (!todo) {
    return null;
  }

  return (
    <Link href={`/todos/${id}`}>
      <div className="group relative flex flex-row items-center justify-between border-b bg-white p-4 hover:bg-gray-50">
        <FaAngleRight className="text-gray-500" />
        <span className="nice-font-family ml-2 flex grow text-xl font-extralight text-gray-500">
          {todo.name}
        </span>
        <ArchiveTodoListButton id={id} />
      </div>
    </Link>
  );
};

const TodoListsDisplay = () => {
  const { data: todoLists } = useTodoLists();

  return (
    <>
      {todoLists?.map((list) => (
        <TodoListDisplay key={list.id} id={list.id} />
      ))}
    </>
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
          <CreateTodoLink className="nice-font-family mt-4 rounded-md border border-gray-300 px-2 font-thin text-gray-500 hover:bg-gray-50">
            Make a new list
          </CreateTodoLink>
        </div>

        <div className="my-4 w-full rounded-md bg-gray-100 shadow-xl">
          <TodoListsDisplay />
        </div>
      </div>
    </MainLayout>
  );
};
