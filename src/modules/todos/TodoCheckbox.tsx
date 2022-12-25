import { useEffect, useState } from "react";
import { useTodo, useEditTodo } from "./queries";

export const TodoCheckbox = ({
  id,
  todoListId,
}: {
  id: string;
  todoListId: string;
}) => {
  const { data: todo } = useTodo(id, todoListId);
  const editTodo = useEditTodo(todoListId);
  const [done, setDone] = useState<boolean>(todo?.done || false);

  useEffect(() => {
    setDone(todo?.done ?? false);
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
