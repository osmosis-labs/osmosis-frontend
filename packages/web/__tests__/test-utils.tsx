/* eslint-disable import/no-extraneous-dependencies */
import { WalletStatus } from "@cosmos-kit/core";
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

import { TestWallet, testWalletInfo } from "~/__tests__/test-wallet";
import { trpcReact } from "~/__tests__/trpc-react";
import { MultiLanguageProvider } from "~/hooks/language/context";
import { WalletSelectProvider } from "~/hooks/use-wallet-select";
import { storeContext, StoreProvider } from "~/stores";
import { RootStore } from "~/stores/root";

let testRootStore: RootStore;

const queryClient = new QueryClient();
const trpcClient = trpcReact.createClient({
  links: [
    httpLink({
      transformer: superjson,
      url: "http://localhost:3000/trpc",
    }),
  ],
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
    console.error("Test account does not exist");
    return;
  }
  if (account?.isReadyToSendTx) {
    return;
  }

  const resolution = when(
    () =>
      account.isReadyToSendTx && account.walletStatus === WalletStatus.Connected
  );

  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      resolution.cancel();
      reject(new Error("Timeout waitAccountLoaded"));
    }, 10_000);

    resolution.then(() => {
      console.log("!");
      resolve();
    });
  });
}

export async function connectTestWallet({
  accountStore,
  chainId,
}: {
  accountStore: AccountStore<any>;
  chainId: string;
}) {
  const walletManager = await accountStore.addWallet(
    new TestWallet(testWalletInfo)
  );
  await walletManager.onMounted();
  await accountStore.getWalletRepo(chainId).connect(testWalletInfo.name, true);
  const account = accountStore.getWallet(chainId);
  await waitTestAccountLoaded(account);
}

export async function cleanupTestWallets() {
  localStorage.clear();
}
