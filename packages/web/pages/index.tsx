import type { NextPage } from "next";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores";
import { useEffect } from "react";

const Home: NextPage = observer(function () {
  const { chainStore, accountStore } = useStore();

  const current = chainStore.chainInfos[0];
  const account = accountStore.getAccount(current.chainId);

  useEffect(() => {
    account.init();
  }, [account]);

  return (
    <main className="max-w-container mx-auto">
      <h1 className="">{account.bech32Address}</h1>

      <p className="">
        Get started by editing <code className="">pages/index.tsx</code>
      </p>

      <div className="">
        <a href="https://nextjs.org/docs" className="">
          <h2>Documentation &rarr;</h2>
          <p>Find in-depth information about Next.js features and API.</p>
        </a>

        <a href="https://nextjs.org/learn" className="">
          <h2>Learn &rarr;</h2>
          <p>Learn about Next.js in an interactive course with quizzes!</p>
        </a>

        <a
          href="https://github.com/vercel/next.js/tree/master/examples"
          className=""
        >
          <h2>Examples &rarr;</h2>
          <p>Discover and deploy boilerplate example Next.js projects.</p>
        </a>

        <a
          href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          className=""
        >
          <h2>Deploy &rarr;</h2>
          <p>Instantly deploy your Next.js site to a public URL with Vercel.</p>
        </a>
      </div>
    </main>
  );
});

export default Home;
