import type { Todo } from "@prisma/client";
import { useForm } from "react-hook-form";
import { useEditTodoText, useTodo } from "./queries";

export default function TodoItemText({
  id,
  todoListId,
}: {
  id: string;
  todoListId: string;
}) {
  const { data: todo } = useTodo(id, todoListId);
  const editTodoText = useEditTodoText(todoListId);
  const { register, handleSubmit } = useForm<Pick<Todo, "text">>({
    defaultValues: { text: todo?.text ?? "What to dooo" },
  });
  const textInput = register("text");
  const onSubmit = (data: Pick<Todo, "text">) => {
    editTodoText.mutate({ id, text: data.text });
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
