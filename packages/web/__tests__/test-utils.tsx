/* eslint-disable import/no-extraneous-dependencies */
import { WalletStatus } from "@cosmos-kit/core";
import { superjson } from "@osmosis-labs/server";
import { AccountStore } from "@osmosis-labs/stores";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Queries, render, RenderHookOptions } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { createTRPCReact, httpLink } from "@trpc/react-query";
import { mockFlags } from "jest-launchdarkly-mock";
import { when } from "mobx";
import { ReactNode } from "react";

import { TestWallet, testWalletInfo } from "~/__tests__/test-wallet";
import { WalletSelectProvider } from "~/hooks";
import { MultiLanguageProvider } from "~/hooks/language/context";
import { AvailableFlags } from "~/hooks/use-feature-flags";
import { AppRouter } from "~/server/api/root-router";
import { storeContext, StoreProvider } from "~/stores";
import { RootStore } from "~/stores/root";

export const trpcReact = createTRPCReact<AppRouter>();
let testRootStore: RootStore;

const queryClient = new QueryClient();
export const withTRPC = ({ children }: { children?: ReactNode }) => {
  return (
    <StoreProvider>
      <storeContext.Consumer>
        {(rootStore) => {
          testRootStore = rootStore!;
          return (
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
          );
        }}
      </storeContext.Consumer>
    </StoreProvider>
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
  BaseElement extends Element | DocumentFragment = Container
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
