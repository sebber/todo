import { trpc } from "../../utils/trpc";

export default function useTodoLists() {
  return trpc.todo.getTodoLists.useQuery();
}
