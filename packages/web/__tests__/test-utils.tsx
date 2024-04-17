import { superjson } from "@osmosis-labs/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// eslint-disable-next-line import/no-extraneous-dependencies
import { render } from "@testing-library/react";
import { createTRPCReact, httpLink } from "@trpc/react-query";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
// eslint-disable-next-line import/no-extraneous-dependencies
import { mockFlags } from "jest-launchdarkly-mock";
import { ReactNode } from "react";

// eslint-disable-next-line import/no-extraneous-dependencies
import { WalletSelectProvider } from "~/hooks";
import { MultiLanguageProvider } from "~/hooks/language/context";
import { AvailableFlags } from "~/hooks/use-feature-flags";
import { AppRouter } from "~/server/api/root-router";
import { StoreProvider } from "~/stores";

dayjs.extend(duration);

export const trpcReact = createTRPCReact<AppRouter>();

const queryClient = new QueryClient();
export const withTRPC = ({ children }: { children: ReactNode }) => (
  <StoreProvider>
    <WalletSelectProvider>
      <MultiLanguageProvider defaultLanguage="en">
        <trpcReact.Provider
          client={trpcReact.createClient({
            transformer: superjson,
            links: [
              httpLink({
                url: "http://localhost:3000/trpc",
              }),
            ],
          })}
          queryClient={queryClient}
        >
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </trpcReact.Provider>
      </MultiLanguageProvider>
    </WalletSelectProvider>
  </StoreProvider>
);

export function renderWithProviders(ui: React.ReactElement) {
  return render(ui, {
    wrapper: withTRPC,
  });
}

export function mockFeatureFlags(
  flags: Partial<Record<AvailableFlags, string | boolean | number>>
) {
  return mockFlags(flags);
}
