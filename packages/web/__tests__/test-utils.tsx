/* eslint-disable import/no-extraneous-dependencies */
import { WalletManager, WalletStatus } from "@cosmos-kit/core";
import { superjson } from "@osmosis-labs/server";
import { AccountStore } from "@osmosis-labs/stores";
import type { AvailableFlags } from "@osmosis-labs/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Queries, render, RenderHookOptions } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { httpLink } from "@trpc/react-query";
import { mockFlags } from "jest-launchdarkly-mock";
import { when } from "mobx";
import { ReactNode } from "react";

import { registerTestCleanup } from "~/__tests__/setup-tests";
import { TestWallet, testWalletInfo } from "~/__tests__/test-wallet";
import { trpcReact } from "~/__tests__/trpc-react";
import { MultiLanguageProvider } from "~/hooks/language/context";
import { WalletSelectProvider } from "~/hooks/use-wallet-select";
import { storeContext, StoreProvider } from "~/stores";
import { RootStore } from "~/stores/root";

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
    testWalletManagers.add(rootStore.accountStore.walletManager);
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
  account: ReturnType<AccountStore["getWallet"]>
) {
  if (!account) {
    throw new Error("Test account does not exist");
  }
  // MobX owns/cancels both the reaction and timeout on resolution or rejection.
  // Keep the timeout below Jest's default 5s test timeout so this descriptive
  // rejection, not a generic test timeout, reports a wallet that never connects.
  await when(
    () =>
      account.isReadyToSendTx &&
      account.walletStatus === WalletStatus.Connected,
    { timeout: 4_000 }
  );
}

export async function connectTestWallet({
  accountStore,
  chainId,
}: {
  accountStore: AccountStore<any>;
  chainId: string;
}) {
  testWalletManagers.add(accountStore.walletManager);
  const walletManager = await accountStore.addWallet(
    new TestWallet(testWalletInfo)
  );
  testWalletManagers.add(walletManager);
  await walletManager.onMounted();
  await accountStore.getWalletRepo(chainId).connect(testWalletInfo.name, true);
  const account = accountStore.getWallet(chainId);
  await waitTestAccountLoaded(account);
}
