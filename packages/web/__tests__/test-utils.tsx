import { superjson } from "@osmosis-labs/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// eslint-disable-next-line import/no-extraneous-dependencies
import { render } from "@testing-library/react";
import { createTRPCReact, httpLink } from "@trpc/react-query";
// eslint-disable-next-line import/no-extraneous-dependencies
import { mockFlags } from "jest-launchdarkly-mock";
import { ReactNode } from "react";

// eslint-disable-next-line import/no-extraneous-dependencies
import { WalletSelectProvider } from "~/hooks";
import { MultiLanguageProvider } from "~/hooks/language/context";
import { AvailableFlags } from "~/hooks/use-feature-flags";
import { AppRouter } from "~/server/api/root-router";
import { StoreProvider } from "~/stores";

export const trpcReact = createTRPCReact<AppRouter>();

const queryClient = new QueryClient();
export const withTRPC = ({ children }: { children: ReactNode }) => (
  <MultiLanguageProvider defaultLanguage="en">
    <StoreProvider>
      <WalletSelectProvider>
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
      </WalletSelectProvider>
    </StoreProvider>
  </MultiLanguageProvider>
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
