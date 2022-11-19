import type { ReactNode, HTMLAttributes } from "react";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";

interface Props extends HTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export const CreateTodoLink = ({ children, ...props }: Props) => {
  const router = useRouter();
  const createTodoList = trpc.todo.createTodoList.useMutation({
    onSuccess(data) {
      router.push(`/todos/${data.id}`);
    },
  });

  return (
    <button {...props} onClick={() => createTodoList.mutate()}>
      {children}
    </button>
  );
};
