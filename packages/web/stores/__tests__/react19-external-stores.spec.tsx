import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
// Valtio is deliberately exercised through the existing WalletConnect dependency.
// eslint-disable-next-line import/no-extraneous-dependencies
import { proxy, useSnapshot } from "valtio";
import { custom } from "viem";
import { mainnet } from "viem/chains";
import { createConfig, createStorage, useAccount, WagmiProvider } from "wagmi";
import { create, useStore } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import { createStore } from "zustand/vanilla";

import { useNavBarStore } from "../nav-bar-store";

it("keeps Zustand shallow selectors stable and releases StrictMode subscriptions", () => {
  const store = createStore(() => ({ count: 0, unrelated: 0 }));
  const subscribe = store.subscribe;
  const listeners = new Set();
  const dispose = jest.fn();
  store.subscribe = (listener) => {
    listeners.add(listener);
    const unsubscribe = subscribe(listener);
    return () => {
      listeners.delete(listener);
      dispose();
      unsubscribe();
    };
  };
  const rendered = jest.fn();
  function Counter() {
    const value = useStore(
      store,
      useShallow((state) => ({ count: state.count }))
    );
    rendered(value);
    return <span>{value.count}</span>;
  }
  const { unmount } = render(
    <StrictMode>
      <Counter />
    </StrictMode>
  );
  expect(listeners.size).toBe(1);
  expect(dispose).toHaveBeenCalled(); // StrictMode effect replay.
  rendered.mockClear();
  act(() => store.setState({ unrelated: 1 }));
  expect(rendered).not.toHaveBeenCalled();
  act(() => store.setState({ count: 1 }));
  expect(screen.getByText("1")).toBeTruthy();
  unmount();
  expect(listeners.size).toBe(0);
  rendered.mockClear();
  act(() => store.setState({ count: 2 }));
  expect(rendered).not.toHaveBeenCalled();
});

it("hydrates Zustand's server snapshot before showing persisted client state", async () => {
  const storageData = new Map([
    ["react19-peer-test", JSON.stringify({ state: { count: 7 }, version: 0 })],
  ]);
  const store = createStore(
    persist(() => ({ count: 0 }), {
      name: "react19-peer-test",
      storage: createJSONStorage(() => ({
        getItem: (key) => storageData.get(key) ?? null,
        setItem: (key, value) => {
          storageData.set(key, value);
        },
        removeItem: (key) => {
          storageData.delete(key);
        },
      })),
    })
  );
  const subscribe = jest.spyOn(store, "subscribe");
  function Counter() {
    return <span>{useStore(store, (state) => state.count)}</span>;
  }
  const container = document.createElement("div");
  container.innerHTML = renderToString(<Counter />);
  expect(container.textContent).toBe("0");
  expect(subscribe).not.toHaveBeenCalled();
  expect(store.getState().count).toBe(7);
  const recoverable = jest.fn();
  const root = hydrateRoot(
    container,
    <StrictMode>
      <Counter />
    </StrictMode>,
    {
      onRecoverableError: recoverable,
    }
  );
  try {
    await act(async () => {});
    expect(recoverable).not.toHaveBeenCalled();
    expect(container.textContent).toBe("7");
    act(() => store.setState({ count: 8 }));
    expect(container.textContent).toBe("8");
    expect(JSON.parse(storageData.get("react19-peer-test")!).state.count).toBe(
      8
    );
  } finally {
    act(() => root.unmount());
    subscribe.mockRestore();
  }
});

it("keeps the application navbar store's SSR snapshot stable through hydration", async () => {
  const initialState = useNavBarStore.getInitialState();
  useNavBarStore.setState({ ...initialState, title: "Client title" });
  function Title() {
    return (
      <span>{useNavBarStore((state) => state.title) ?? "Server title"}</span>
    );
  }
  const container = document.createElement("div");
  container.innerHTML = renderToString(<Title />);
  expect(container.textContent).toBe("Server title");
  const recoverable = jest.fn();
  const root = hydrateRoot(container, <Title />, {
    onRecoverableError: recoverable,
  });
  try {
    await act(async () => {});
    expect(recoverable).not.toHaveBeenCalled();
    expect(container.textContent).toBe("Client title");
    act(() => useNavBarStore.getState().setTitle("Updated title"));
    expect(container.textContent).toBe("Updated title");
  } finally {
    act(() => root.unmount());
    useNavBarStore.setState(initialState, true);
  }
});

it("hydrates wagmi offline and releases account subscriptions without RPC or connectors", async () => {
  const request = jest.fn(async () => {
    throw new Error("Unexpected RPC in offline test");
  });
  const config = createConfig({
    chains: [mainnet],
    transports: { [mainnet.id]: custom({ request }) },
    connectors: [],
    multiInjectedProviderDiscovery: false,
    // ssr hydration expects a persist-enabled store in this wagmi version.
    storage: createStorage({
      storage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      },
    }),
    ssr: true,
  });
  const subscribe = config.subscribe.bind(config);
  const subscriptions = new Set();
  const dispose = jest.fn();
  config.subscribe = (...args) => {
    const unsubscribe = subscribe(...args);
    subscriptions.add(unsubscribe);
    return () => {
      subscriptions.delete(unsubscribe);
      dispose();
      unsubscribe();
    };
  };
  const rendered = jest.fn();
  function Account() {
    const { status } = useAccount();
    rendered(status);
    return <span>{status}</span>;
  }
  const view = (
    <StrictMode>
      <WagmiProvider config={config} reconnectOnMount={false}>
        <Account />
      </WagmiProvider>
    </StrictMode>
  );
  const container = document.createElement("div");
  container.innerHTML = renderToString(view);
  expect(container.textContent).toBe("disconnected");
  expect(subscriptions.size).toBe(0);
  const recoverable = jest.fn();
  const root = hydrateRoot(container, view, {
    onRecoverableError: recoverable,
  });
  try {
    await act(async () => {});
    expect(recoverable).not.toHaveBeenCalled();
    expect(subscriptions.size).toBe(1);
    expect(dispose).toHaveBeenCalled();
    rendered.mockClear();
    act(() => config.setState((state) => ({ ...state, chainId: mainnet.id })));
    expect(rendered).not.toHaveBeenCalled();
    act(() => config.setState((state) => ({ ...state, status: "connecting" })));
    expect(container.textContent).toBe("connecting");
    act(() =>
      config.setState((state) => ({ ...state, status: "disconnected" }))
    );
    expect(container.textContent).toBe("disconnected");
  } finally {
    act(() => root.unmount());
  }
  expect(subscriptions.size).toBe(0);
  rendered.mockClear();
  act(() => config.setState((state) => ({ ...state, status: "connecting" })));
  expect(rendered).not.toHaveBeenCalled();
  expect(request).not.toHaveBeenCalled();
  expect(config.connectors).toHaveLength(0);
});

it("keeps WalletConnect's Valtio selector reactive and stops rendering on unmount", async () => {
  const state = proxy({ count: 0, unrelated: 0 });
  const rendered = jest.fn();
  const { result, unmount } = renderHook(
    () => {
      const snapshot = useSnapshot(state);
      rendered(snapshot.count);
      return snapshot.count;
    },
    { wrapper: StrictMode }
  );
  rendered.mockClear();
  await act(async () => {
    state.unrelated++;
  });
  expect(rendered).not.toHaveBeenCalled();
  await act(async () => {
    state.count++;
  });
  expect(result.current).toBe(1);
  unmount();
  rendered.mockClear();
  await act(async () => {
    state.count++;
  });
  expect(rendered).not.toHaveBeenCalled();
});

it("keeps React Query observers reactive alongside a Zustand selector", async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  const useStore = create(() => ({ count: 0 }));
  const queryFn = jest.fn(async () => "cached");
  const { result, unmount } = renderHook(
    () => ({
      count: useStore((state) => state.count),
      data: useQuery({ queryKey: ["react19-peers"], queryFn }).data,
    }),
    {
      wrapper: ({ children }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    }
  );
  try {
    await waitFor(() => expect(result.current.data).toBe("cached"));
    act(() => useStore.setState({ count: 1 }));
    expect(result.current.count).toBe(1);
    act(() => client.setQueryData(["react19-peers"], "updated"));
    await waitFor(() => expect(result.current.data).toBe("updated"));
    expect(queryFn).toHaveBeenCalledTimes(1);
  } finally {
    unmount();
    expect(
      client
        .getQueryCache()
        .find({ queryKey: ["react19-peers"] })
        ?.getObserversCount()
    ).toBe(0);
    client.clear();
  }
});
