import { useTodo, useToggleTodo } from "./queries";

export const TodoCheckbox = ({
  id,
  todoListId,
}: {
  id: string;
  todoListId: string;
}) => {
  const { data: todo } = useTodo(id, todoListId);
  const toggleTodo = useToggleTodo(todoListId);

  return (
    <input
      id={`todo-input-${id}`}
      type="checkbox"
      checked={todo?.done}
      className="bg-gray-200 accent-indigo-400"
      onChange={() => toggleTodo.mutate({ id })}
    />
  );
};
