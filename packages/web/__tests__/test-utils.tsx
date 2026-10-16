/* eslint-disable import/no-extraneous-dependencies */
import { WalletManager, WalletStatus } from "@cosmos-kit/core";
import { superjson } from "@osmosis-labs/server";
import type { AvailableFlags } from "@osmosis-labs/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Queries, render, RenderHookOptions } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { httpLink } from "@trpc/react-query";
import { mockFlags } from "jest-launchdarkly-mock";
import { ReactNode } from "react";

import { registerTestCleanup } from "~/__tests__/setup-tests";
import { TestWallet, testWalletInfo } from "~/__tests__/test-wallet";
import { trpcReact } from "~/__tests__/trpc-react";
import { MultiLanguageProvider } from "~/hooks/language/context";
import { WalletSelectProvider } from "~/hooks/use-wallet-select";
import { storeContext, StoreProvider } from "~/stores";
import { RootStore } from "~/stores/root";
import type { WalletRuntime } from "~/stores/wallet-runtime";

let testRootStore: RootStore;
const testRootStores = new Set<RootStore>();
// AccountStore.addWallet replaces its WalletManager, so track every manager a
// test touched, not only the one current at teardown.
const testWalletManagers = new Set<WalletManager>();

const queryClient = new QueryClient();
const trpcClient = trpcReact.createClient({
  links: [
    httpLink({
      transformer: superjson,
      url: "http://localhost:3000/trpc",
    }),
  ],
});
registerTestCleanup(async () => {
  await queryClient.cancelQueries();
  queryClient.clear();
  for (const rootStore of testRootStores) {
    await rootStore.walletRuntime.unmount();
    testWalletManagers.add(rootStore.walletRuntime.walletManager);
  }
  for (const manager of testWalletManagers) {
    manager.onUnmounted();
    // Cosmos Kit exposes the session timer but has no session disposal method.
    if (manager.session.timeoutId !== undefined) {
      clearTimeout(manager.session.timeoutId as ReturnType<typeof setTimeout>);
    }
  }
  testWalletManagers.clear();
  testRootStores.clear();
  localStorage.clear();
});

const withTRPC = ({ children }: { children?: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <trpcReact.Provider client={trpcClient} queryClient={queryClient}>
        <MultiLanguageProvider defaultLanguage="en">
          <StoreProvider>
            <storeContext.Consumer>
              {(rootStore) => {
                testRootStore = rootStore!;
                testRootStores.add(testRootStore);
                return <WalletSelectProvider>{children}</WalletSelectProvider>;
              }}
            </storeContext.Consumer>
          </StoreProvider>
        </MultiLanguageProvider>
      </trpcReact.Provider>
    </QueryClientProvider>
  );
};

export function renderWithProviders(ui: React.ReactElement) {
  const utils = render(ui, {
    wrapper: withTRPC,
  });
  return { ...utils, rootStore: testRootStore };
}

export function renderHookWithProviders<
  Result,
  Props,
  Q extends Queries,
  Container extends Element | DocumentFragment = HTMLElement,
  BaseElement extends Element | DocumentFragment = Container,
>(
  render: (initialProps: Props) => Result,
  options?: RenderHookOptions<Props, Q, Container, BaseElement>
) {
  const utils = renderHook(render, {
    ...options,
    wrapper: withTRPC,
  });
  return { ...utils, rootStore: testRootStore };
}

export function resetQueryClient() {
  queryClient.clear();
}

export function mockFeatureFlags(
  flags: Partial<Record<AvailableFlags, string | boolean | number>>
) {
  return mockFlags(flags);
}

async function waitTestAccountLoaded(
  account: ReturnType<WalletRuntime["getWallet"]>
) {
  if (!account) {
    throw new Error("Test account does not exist");
  }
  const deadline = Date.now() + 4_000;
  while (account.walletStatus !== WalletStatus.Connected || !account.address) {
    if (Date.now() >= deadline)
      throw new Error("Test wallet did not connect within 4s");
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

export async function connectTestWallet({
  walletRuntime,
  chainId,
}: {
  walletRuntime: WalletRuntime;
  chainId: string;
}) {
  testWalletManagers.add(walletRuntime.walletManager);
  const walletManager = await walletRuntime.installWallet(
    new TestWallet(testWalletInfo)
  );
  testWalletManagers.add(walletManager);
  await walletRuntime.mount();
  await walletRuntime.getWalletRepo(chainId).connect(testWalletInfo.name, true);
  const account = walletRuntime.getWallet(chainId);
  await waitTestAccountLoaded(account);
}
