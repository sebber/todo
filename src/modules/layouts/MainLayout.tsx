import React from "react";
import { useSession, signOut, signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

const Logo = () => {
  return (
    <div className="font-family-nice flex flex-1 justify-start text-2xl font-light text-indigo-400">
      <Link href="/">Todo</Link>
    </div>
  );
};

const linkClassname =
  "p-1 m-1 text-md font-bold text-gray-600 hover:text-gray-900";

const AuthenticatedMenu = () => {
  return (
    <>
      <Link href="/todos" className={linkClassname}>
        Todos
      </Link>
      <button onClick={() => signOut()} className={linkClassname}>
        Sign out
      </button>
    </>
  );
};

const UnauthenticatedMenu = () => {
  return (
    <button onClick={() => signIn()} className={linkClassname}>
      Sign in
    </button>
  );
};

const HeaderProfile = () => {
  const { data: session } = useSession();

  if (!session) {
    return null;
  }

  return (
    <Link href="/account" className="flex flex-row-reverse items-center">
      {session.user?.image ? (
        <div className="ml-2 overflow-hidden rounded-full shadow-md">
          <Image
            src={session.user?.image}
            width={32}
            height={32}
            alt={`${session.user?.name} profile image`}
          />
        </div>
      ) : null}
      <div className="hidden sm:block">{session.user?.name}</div>
    </Link>
  );
};

interface Props {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: Props): JSX.Element => {
  const { data: session } = useSession();

  return (
    <div className="h-full w-full">
      <div className="flex flex-row justify-evenly  p-2">
        <Logo />
        <nav className="flex flex-1 items-center justify-center">
          {session ? <AuthenticatedMenu /> : null}
        </nav>
        <div className="flex flex-1 justify-end">
          {session ? <HeaderProfile /> : <UnauthenticatedMenu />}
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
};
