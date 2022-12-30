import { useEffect, useState } from "react";
import { useEditTodo } from "./queries";

export const TodoCheckbox = ({
  id,
  todoListId,
  checked,
}: {
  id: string;
  todoListId: string;
  checked: boolean;
}) => {
  const editTodo = useEditTodo(todoListId);
  const [done, setDone] = useState<boolean>(checked);

  useEffect(() => {
    setDone(checked);
  }, [checked]);

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
