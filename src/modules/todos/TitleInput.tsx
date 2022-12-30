import { FaAngleDown } from "react-icons/fa";

type TitleInputProps = Pick<
  React.ComponentPropsWithoutRef<"input">,
  "name" | "onChange" | "value"
> & { value?: string };

export const TitleInput = (props: TitleInputProps) => {
  const isDirty = props?.value?.length ?? 0 > 0;
  return (
    <div className="flex flex-row items-center border-b bg-white p-2 py-4">
      <div className="mx-4">
        <FaAngleDown className={isDirty ? "text-gray-500" : "text-gray-200"} />
      </div>
      <input
        className="nice-font-family text-2xl font-thin italic outline-none placeholder:text-gray-300"
        placeholder="What needs to be done?"
        type="text"
        {...props}
      />
    </div>
  );
};
