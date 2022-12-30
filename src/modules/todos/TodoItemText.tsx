import type { Todo } from "@prisma/client";
import { useForm } from "react-hook-form";
import { useTodo, useEditTodo } from "./queries";

export default function TodoItemText({
  id,
  todoListId,
  text,
}: {
  id: string;
  todoListId: string;
  text: string;
}) {
  const editTodoText = useEditTodo(todoListId);
  const { register, handleSubmit } = useForm<Pick<Todo, "text">>({
    defaultValues: { text: text },
  });
  const textInput = register("text");
  const onSubmit = (data: Pick<Todo, "text">) => {
    editTodoText.mutate({ id, data: { text: data.text } });
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement?.blur();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <input
        type="text"
        className="nice-font-family w-full text-xl font-extralight text-gray-500 outline-none"
        {...textInput}
      />
    </form>
  );
}
