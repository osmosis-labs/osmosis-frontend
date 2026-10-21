import { act, renderHook, waitFor } from "@testing-library/react";

import type { PhantomProvider } from "../use-phantom-wallet";

const key = (address: string) => ({ publicKey: { toBase58: () => address } });

/** A Phantom provider whose silent (`onlyIfTrusted`) connect resolves only
 *  when the test says so, so a manual action can land while it's in flight. */
function installProvider(manualAddress = "MANUAL") {
  let resolveEager: (address: string) => void = () => undefined;
  const provider: PhantomProvider = {
    connect: jest.fn((opts?: { onlyIfTrusted?: boolean }) =>
      opts?.onlyIfTrusted
        ? new Promise((resolve) => {
            resolveEager = (address) => resolve(key(address));
          })
        : Promise.resolve(key(manualAddress))
    ),
    disconnect: jest.fn(() => Promise.resolve()),
    on: jest.fn(),
  };
  (window as unknown as { phantom?: { solana?: PhantomProvider } }).phantom = {
    solana: provider,
  };
  return { resolveEager: (address: string) => resolveEager(address) };
}

// The session is module-level state, so each test loads a fresh copy of the
// hook module, sharing the test's React so the renderer and hook agree.
function loadHook() {
  const react = jest.requireActual("react");
  let hook!: typeof import("../use-phantom-wallet").usePhantomWallet;
  jest.isolateModules(() => {
    jest.doMock("react", () => react);
    hook = require("../use-phantom-wallet").usePhantomWallet;
  });
  return hook;
}

/** Loads a fresh hook module once per test, then renders it. (Loading it
 *  inside the render callback would reset the module state every render.) */
function renderPhantom(options?: { restoreSession?: boolean }) {
  const usePhantomWallet = loadHook();
  return renderHook(() => usePhantomWallet(options));
}

afterEach(() => {
  delete (window as unknown as { phantom?: unknown }).phantom;
});

describe("usePhantomWallet eager reconnect", () => {
  it("does not touch Phantom unless the caller asks to restore the session", async () => {
    installProvider();
    const provider = (
      window as unknown as { phantom: { solana: PhantomProvider } }
    ).phantom.solana;
    const { result } = renderPhantom();

    await act(async () => undefined);
    expect(provider.connect).not.toHaveBeenCalled();
    expect(result.current.address).toBeUndefined();
  });

  it("restores a trusted session when nothing else happened", async () => {
    const { resolveEager } = installProvider();
    const { result } = renderPhantom({ restoreSession: true });

    await act(async () => resolveEager("TRUSTED"));
    await waitFor(() => expect(result.current.address).toBe("TRUSTED"));
  });

  it("doesn't let a late silent reconnect overwrite a manual connect", async () => {
    const { resolveEager } = installProvider("MANUAL");
    const { result } = renderPhantom({ restoreSession: true });

    await act(async () => {
      await result.current.connect();
    });
    expect(result.current.address).toBe("MANUAL");

    await act(async () => resolveEager("STALE"));
    expect(result.current.address).toBe("MANUAL");
  });

  it("doesn't let a late silent reconnect undo a disconnect", async () => {
    const { resolveEager } = installProvider();
    const { result } = renderPhantom({ restoreSession: true });

    await act(async () => {
      await result.current.disconnect();
    });
    await act(async () => resolveEager("TRUSTED"));
    expect(result.current.address).toBeUndefined();
  });
});
