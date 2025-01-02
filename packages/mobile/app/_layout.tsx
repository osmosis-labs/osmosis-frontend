import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { superjson } from "@osmosis-labs/server";
import { localLink, makeSkipBatchLink } from "@osmosis-labs/trpc";
import {
  constructEdgeRouterKey,
  constructEdgeUrlPathname,
} from "@osmosis-labs/utils";
import { ThemeProvider } from "@react-navigation/native";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { loggerLink } from "@trpc/client";
import { useFonts } from "expo-font";
import { Redirect, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Toaster } from "sonner-native";

import { LockScreenModal } from "~/components/lock-screen-modal";
import { DefaultTheme } from "~/constants/themes";
import { useWallets } from "~/hooks/use-wallets";
import { getMobileAssetListAndChains } from "~/utils/asset-lists";
import { mmkvStorage } from "~/utils/mmkv";
import { api, RouterKeys } from "~/utils/trpc";
import { appRouter } from "~/utils/trpc-routers/root-router";

// eslint-disable-next-line @typescript-eslint/no-var-requires
global.Buffer = require("buffer").Buffer;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

const localStoragePersister = createSyncStoragePersister({
  storage: mmkvStorage,
  serialize: (client) => {
    try {
      return superjson.stringify(client);
    } catch (error) {
      console.error("Error serializing client", error);
      return "";
    }
  },
  deserialize: (cachedString) => superjson.parse(cachedString),
});

persistQueryClient({
  queryClient,
  persister: localStoragePersister,
  dehydrateOptions: {
    shouldDehydrateQuery: (query) => {
      const [key] = query.queryKey as [string[]];
      if (Array.isArray(key)) {
        const trpcKey = key.join(".") as RouterKeys;
        const excludedKeys: RouterKeys[] = [
          "local.assets.getAssetHistoricalPrice",
        ];

        /**
         * If the key is in the excludedKeys, we don't want to persist it in the cache.
         */
        if (excludedKeys.includes(trpcKey)) {
          return false;
        }
      }
      return true;
    },
  },
  // !! IMPORTANT !!
  // If you change a data model,
  // it's important to bump this buster value
  // so that the cache is invalidated
  // and data respecting the new model is fetched from the server.
  // Otherwise, the old data will be served from cache
  // and unexpected data structures will be run through the app.
  buster: "v1",
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 300,
  fade: true,
});

export default function RootLayout() {
  const [trpcClient] = useState(() =>
    api.createClient({
      transformer: superjson,
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        (runtime) => {
          const removeLastSlash = (url: string) => url.replace(/\/$/, "");
          const servers = {
            local: localLink({
              router: appRouter,
              getLists: async () => {
                const data = await queryClient.ensureQueryData({
                  queryKey: ["assetLists-and-chainLists"],
                  queryFn: async () =>
                    getMobileAssetListAndChains({
                      environment: "mainnet",
                    }),
                  cacheTime: 1000 * 60 * 30, // 30 minutes
                  retry: 3,
                });

                return data;
              },
              opentelemetryServiceName: "osmosis-mobile",
            })(runtime),
            [constructEdgeRouterKey("main")]: makeSkipBatchLink(
              removeLastSlash(
                process.env.EXPO_PUBLIC_OSMOSIS_BE_BASE_URL ?? ""
              ) +
                "/" +
                constructEdgeUrlPathname("main")
            )(runtime),
          };

          return (ctx) => {
            const { op } = ctx;
            const pathParts = op.path.split(".");
            const basePath = pathParts.shift() as string | "osmosisFe";

            /**
             * Combine the rest of the parts of the paths. This is what we're actually calling on the edge server.
             * E.g. It will convert `edge.pools.getPool` to `pools.getPool`
             */
            const possibleOsmosisFePath = pathParts.join(".");

            if (basePath === "osmosisFe") {
              return servers[constructEdgeRouterKey("main")]({
                ...ctx,
                op: {
                  ...op,
                  path: possibleOsmosisFePath,
                },
              });
            }

            return servers[basePath](ctx);
          };
        },
      ],
    })
  );

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={DefaultTheme}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <BottomSheetModalProvider>
              <OnboardingObserver />
              <LockScreenModal />
              <Toaster />
              <Stack
                screenOptions={{
                  animation: "simple_push",
                  animationDuration: 400,
                  animationTypeForReplace: "push",
                  presentation: "card",
                }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="onboarding"
                  options={{ headerShown: false }}
                />
                <Stack.Screen name="+not-found" />
              </Stack>
            </BottomSheetModalProvider>
            <StatusBar style="auto" />
          </GestureHandlerRootView>
        </ThemeProvider>
      </QueryClientProvider>
    </api.Provider>
  );
}

const OnboardingObserver = () => {
  const { currentWallet } = useWallets();

  if (!currentWallet) {
    return <Redirect href="/onboarding/welcome" />;
  }

  return null;
};
