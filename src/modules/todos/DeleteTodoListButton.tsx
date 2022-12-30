import { useRouter } from "next/router";
import { AngryButton } from "../style/buttons/AngryButton";
import { useDeleteTodoList } from "./queries";

export const DeleteTodoListButton = ({ id }: { id: string }) => {
  const deleteTodoList = useDeleteTodoList();
  const router = useRouter();
  return (
    <AngryButton
      onClick={() => {
        deleteTodoList.mutate({ id: id });
        router.push(`/todos`);
      }}
    >
      Delete List
    </AngryButton>
  );
};
