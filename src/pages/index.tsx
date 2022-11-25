import { type NextPage } from "next";
import Head from "next/head";
import { MainLayout } from "../modules/layouts/MainLayout";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Sebber Todo</title>
        <meta name="description" content="A very much not fancy todo app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MainLayout>
        <div>Hello</div>
      </MainLayout>
    </>
  );
};

export default Home;
