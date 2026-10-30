import "react-toastify/dist/ReactToastify.css"; // some styles overridden in globals.css
import "../styles/globals.css";

import { SpeedInsights } from "@vercel/speed-insights/next";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import duration from "dayjs/plugin/duration";
import isBetween from "dayjs/plugin/isBetween";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import utc from "dayjs/plugin/utc";
import { ProviderConfig, withLDProvider } from "launchdarkly-react-client-sdk";
import type { AppProps } from "next/app";
import { NuqsAdapter } from "nuqs/adapters/next/pages";
import { ComponentType, FunctionComponent, ReactNode, useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Bounce, ToastContainer } from "react-toastify";
import { WagmiProvider } from "wagmi";

import { Icon } from "~/components/assets";
import { ErrorFallback } from "~/components/error/error-fallback";
import { MainLayout } from "~/components/layouts";
import { MainLayoutMenu } from "~/components/main-menu";
import { wagmiConfig } from "~/config/wagmi";
import { MultiLanguageProvider, useTranslation } from "~/hooks";
import { ImmersiveBridge } from "~/hooks/bridge";
import { useFeatureFlags } from "~/hooks/use-feature-flags";
import { useWallet } from "~/hooks/use-wallet";
import { WalletSelectProvider } from "~/hooks/use-wallet-select";
import { SEO } from "~/next-seo.config";
import { api } from "~/utils/trpc";

// Note: for some reason, the above two icons were displaying black backgrounds when using sprite SVG.
import dayjsLocaleEs from "../localizations/dayjs-locale-es.js";
import dayjsLocaleKo from "../localizations/dayjs-locale-ko.js";
import en from "../localizations/en.json";
import { StoreProvider } from "../stores";

dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);
dayjs.extend(duration);
dayjs.extend(utc);
dayjs.extend(updateLocale);
dayjs.extend(isBetween);
dayjs.extend(localizedFormat);
dayjs.updateLocale("es", dayjsLocaleEs);
dayjs.updateLocale("ko", dayjsLocaleKo);

const DEFAULT_LANGUAGE = "en";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <NuqsAdapter>
      <WagmiProvider config={wagmiConfig}>
        <MultiLanguageProvider
          defaultLanguage={DEFAULT_LANGUAGE}
          defaultTranslations={{ en }}
        >
          <StoreProvider>
            <WalletSelectProvider>
              <ErrorBoundary fallback={<ErrorFallback />}>
                <SEO />
                <SpeedInsights />
                <ToastContainer
                  toastStyle={{
                    backgroundColor: "#2d2755",
                  }}
                  transition={Bounce}
                  newestOnTop
                />
                <MainLayoutWrapper>
                  {Component && <Component {...pageProps} />}
                </MainLayoutWrapper>
                <ImmersiveBridge />
              </ErrorBoundary>
            </WalletSelectProvider>
          </StoreProvider>
        </MultiLanguageProvider>
      </WagmiProvider>
    </NuqsAdapter>
  );
}

const MainLayoutWrapper: FunctionComponent<{
  children: ReactNode;
}> = ({ children }) => {
  const { t } = useTranslation();
  const flags = useFeatureFlags();

  const { wallet: osmosisWallet } = useWallet();

  const menus = useMemo(() => {
    if (!flags._isInitialized) {
      return [];
    }

    const menuItems: (MainLayoutMenu | null)[] = [
      {
        label: t("limitOrders.trade"),
        link: "/",
        icon: <Icon id="trade" className="h-6 w-6" />,
        selectionTest: /\/$/,
      },
      {
        label: t("menu.portfolio"),
        link: "/portfolio",
        icon: <Icon id="portfolio" className="h-6 w-6" />,
        selectionTest: /\/portfolio/,
      },
      {
        label: t("menu.assets"),
        link: "/assets",
        icon: <Icon id="assets" className="h-6 w-6" />,
        selectionTest: /\/assets/,
      },
      flags.staking
        ? {
            label: t("menu.stake"),
            link: "/stake",
            icon: <Icon id="ticket" className="h-6 w-6" />,
            selectionTest: /\/stake/,
          }
        : {
            label: t("menu.stake"),
            link:
              osmosisWallet?.walletInfo?.stakeUrl ??
              "https://wallet.keplr.app/chains/osmosis",
            icon: <Icon id="ticket" className="h-6 w-6" />,
          },
      {
        label: t("menu.pools"),
        link: "/pools",
        icon: <Icon id="pool" className="h-6 w-6" />,
        selectionTest: /\/pools/,
      },
    ];

    return menuItems.filter(Boolean) as MainLayoutMenu[];
  }, [
    flags.staking,
    flags._isInitialized,
    osmosisWallet?.walletInfo?.stakeUrl,
    t,
  ]);

  const secondaryMenuItems = useMemo<MainLayoutMenu[]>(() => {
    // Wait for the flag-gated primary menu so these links don't render first
    // and then jump down when it appears.
    if (!flags._isInitialized) {
      return [];
    }

    return [
      {
        label: t("menu.vote"),
        link:
          osmosisWallet?.walletInfo?.governanceUrl ??
          "https://wallet.keplr.app/chains/osmosis?tab=governance",
        icon: <Icon id="vote" className="h-6 w-6" />,
        // The wallet governance link doesn't work on mobile.
        hideOnMobile: true,
      },
      {
        label: t("menu.info"),
        link: "https://www.datalenses.zone/chain/osmosis/overview",
        icon: <Icon id="chart" className="h-6 w-6" />,
      },
      {
        label: t("menu.featureRequests"),
        link: "https://forum.osmosis.zone/c/site-feedback/2",
        icon: <Icon id="gift" className="h-6 w-6" />,
      },
      {
        label: t("menu.help"),
        link: "https://support.osmosis.zone/",
        icon: <Icon id="help-circle" className="h-6 w-6" />,
      },
    ];
  }, [flags._isInitialized, t, osmosisWallet?.walletInfo?.governanceUrl]);

  return (
    <MainLayout menus={menus} secondaryMenuItems={secondaryMenuItems}>
      {children}
    </MainLayout>
  );
};

const ldAnonymousContext = {
  key: "SHARED-CONTEXT-KEY",
  anonymous: true,
};

const myID = process.env.NEXT_PUBLIC_LAUNCH_DARKLY_CLIENT_SIDE_ID;

const isClientIdValid = Boolean(myID);

const ldConfig: ProviderConfig = {
  clientSideID: process.env.NEXT_PUBLIC_LAUNCH_DARKLY_CLIENT_SIDE_ID || "",
  options: {
    bootstrap: "localStorage",
  },
  context: ldAnonymousContext,
};

const LDWrappedApp = isClientIdValid
  ? withLDProvider(ldConfig)(MyApp as ComponentType<{}>)
  : MyApp;

export default api.withTRPC(LDWrappedApp);
