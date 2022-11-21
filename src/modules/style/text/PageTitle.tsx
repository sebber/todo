import type { ReactNode } from "react";

export const PageTitle = ({ children }: { children: ReactNode }) => {
  return (
    <h1 className="font-family-nice text-center text-6xl font-thin text-rose-400">
      {children}
    </h1>
  );
};
