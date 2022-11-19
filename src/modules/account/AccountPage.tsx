import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { MainLayout } from "../layouts/MainLayout";

export const AccountPage: NextPage = () => {
  const { data: sessionData } = useSession();
  return <MainLayout>{sessionData?.user?.name}</MainLayout>;
};
