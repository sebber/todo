import { Button } from "../style/buttons/Button";
import { useClearCompletedTodos } from "./queries";

export const ClearCompletedTodosButton = ({ id }: { id: string }) => {
  const clearCompletedTodos = useClearCompletedTodos();

  return (
    <Button onClick={() => clearCompletedTodos.mutate({ id: id })}>
      Clear completed
    </Button>
  );
};
