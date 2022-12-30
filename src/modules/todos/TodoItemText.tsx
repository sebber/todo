import { Field, OneForm } from "@oneform/react";
import { useEditTodo } from "./queries";
import { useCallback } from "react";

export function TodoItemText({
  id,
  todoListId,
  text,
}: {
  id: string;
  todoListId: string;
  text: string;
}) {
  const editTodoText = useEditTodo(todoListId);
  const handleSubmit = useCallback(
    ({ registeredValues }: { registeredValues: Record<string, any> }) => {
      editTodoText.mutate({ id, data: { text: registeredValues.text } });
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement?.blur();
      }
    },
    []
  );

  return (
    <OneForm values={{ text }} onSubmit={handleSubmit}>
      <Field>
        <input
          type="text"
          name="text"
          className="nice-font-family w-full text-xl font-extralight text-gray-500 outline-none"
        />
      </Field>
    </OneForm>
  );
}
