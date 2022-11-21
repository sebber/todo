import type { HTMLAttributes, ReactNode } from "react";

type Props = {
  children: ReactNode;
} & HTMLAttributes<HTMLButtonElement>;

export const Button = ({ children, ...props }: Props) => {
  return (
    <button
      {...props}
      className="nice-font-family mt-4 rounded-md border border-gray-300 px-2 font-thin text-gray-500 hover:bg-gray-50"
    >
      {children}
    </button>
  );
};
