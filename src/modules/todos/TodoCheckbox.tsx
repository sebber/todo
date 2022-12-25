import { useCallback, useState } from "react";
import { useTodo, useToggleTodo, useEditTodo } from "./queries";

export const TodoCheckbox = ({
  id,
  todoListId,
}: {
  id: string;
  todoListId: string;
}) => {
  const { data: todo } = useTodo(id, todoListId);
  const editTodo = useEditTodo();
  const [done, setDone] = useState<boolean>(todo?.done || false);

  useCallback(() => {
    if (todo !== undefined) {
      setDone(todo?.done);
    }
  }, [todo?.done]);

  return (
    <input
      id={`todo-input-${id}`}
      type="checkbox"
      checked={done}
      className="bg-gray-200 accent-indigo-400"
      onChange={(e) => {
        const checked = e.currentTarget.checked;
        setDone(checked);
        editTodo.mutate({ id, data: { done: checked } });
      }}
    />
  );
};
