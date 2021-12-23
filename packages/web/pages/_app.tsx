import "../styles/globals.css";
import type { AppProps } from "next/app";
import { StoreProvider } from "../stores";
import { MainLayout } from "../components/layouts";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <StoreProvider>
      <MainLayout
        menus={[
          {
            label: "Trade",
            link: "/",
            selectionTest: /\/$/,
          },
          {
            label: "Pools",
            link: "/pools",
            selectionTest: /\/pools/,
          },
        ]}
      >
        <Component {...pageProps} />
      </MainLayout>
    </StoreProvider>
  );
}

export default MyApp;
