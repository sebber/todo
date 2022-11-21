import type { HTMLAttributes, ReactNode } from "react";

type Props = {
  children: ReactNode;
} & HTMLAttributes<HTMLButtonElement>;

export const AngryButton = ({ children, ...props }: Props) => {
  return (
    <button
      {...props}
      className="nice-font-family mt-4 rounded-md border border-rose-300 px-2 font-thin text-rose-500 hover:bg-gray-50"
    >
      {children}
    </button>
  );
};
