import NextAuth, { type NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
// import CredentialsProvider from "next-auth/providers/credentials";

// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import { env } from "../../../env/server.mjs";
import { prisma } from "../../../server/db/client";

export const authOptions: NextAuthOptions = {
  // Include user.id on session
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    }),
    // CredentialsProvider({
    //   name: "Credentials",
    //   credentials: {
    //     username: { label: "Username", type: "text", placeholder: "jsmith" },
    //     password: { label: "Password", type: "password" },
    //   },
    //   async authorize(credentials, req) {
    //     // You need to provide your own logic here that takes the credentials
    //     // submitted and returns either a object representing a user or value
    //     // that is false/null if the credentials are invalid.
    //     // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
    //     // You can also use the `req` object to obtain additional parameters
    //     // (i.e., the request IP address)
    //     // const res = await fetch("/your/endpoint", {
    //     //   method: 'POST',
    //     //   body: JSON.stringify(credentials),
    //     //   headers: { "Content-Type": "application/json" }
    //     // })
    //     // const user = await res.json()

    //     const user = await prisma.user.findFirst({
    //       where: { email: credentials?.username },
    //     });
    //     console.log("user", user);

    //     return user;

    //     // // If no error and we have user data, return it
    //     // if (res.ok && user) {
    //     //   return user;
    //     // }
    //     // // Return null if user data could not be retrieved
    //     // return null;
    //   },
    // }),
    // ...add more providers here
  ],
  // session: { strategy: "jwt" },
  // jwt: {
  //   secret: "Ei/3cMeiJTcYkZh/AEjKNbvK/MKG/X83Rk0rvAHLdEs=",
  //   // maxAge: 60 * 60 * 24 * 30,
  //   maxAge: 60 * 2,
  // },
};

export default NextAuth(authOptions);
