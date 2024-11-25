import { superjson } from "@osmosis-labs/server";
import { localLink } from "@osmosis-labs/trpc";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeProvider } from "@react-navigation/native";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { loggerLink } from "@trpc/client";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";

import { DefaultTheme } from "~/constants/themes";
import { getMobileAssetListAndChains } from "~/utils/asset-lists";
import { api } from "~/utils/trpc";
import { appRouter } from "~/utils/trpc-routers/root-router";

const localStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  serialize: (client) => superjson.stringify(client),
  deserialize: (cachedString) => superjson.parse(cachedString),
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

persistQueryClient({
  queryClient,
  persister: localStoragePersister,

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
          // initialize the different links for different targets (edge and node)
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
          };

          return (ctx) => servers["local"](ctx);
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
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </QueryClientProvider>
    </api.Provider>
  );
}
