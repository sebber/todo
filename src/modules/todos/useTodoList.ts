import { trpc } from "../../utils/trpc";

export default function useTodoList(id: string) {
  return trpc.todo.getTodoList.useQuery({ id: id });
}
