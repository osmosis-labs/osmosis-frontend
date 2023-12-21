import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// eslint-disable-next-line import/no-extraneous-dependencies
import { render } from "@testing-library/react";
import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
// eslint-disable-next-line import/no-extraneous-dependencies
import { mockFlags } from "jest-launchdarkly-mock";
import { ReactNode } from "react";
import SuperJSON from "superjson";

import { MultiLanguageProvider } from "~/hooks/language/context";
import { AvailableFlags } from "~/hooks/use-feature-flags";
import { AppRouter } from "~/server/api/root";

export const trpcReact = createTRPCReact<AppRouter>();

const queryClient = new QueryClient();
export const withTRPC = ({ children }: { children: ReactNode }) => (
  <MultiLanguageProvider>
    <trpcReact.Provider
      client={trpcReact.createClient({
        transformer: SuperJSON,
        links: [
          httpBatchLink({
            url: "http://localhost:3000/trpc",
          }),
        ],
      })}
      queryClient={queryClient}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpcReact.Provider>
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
