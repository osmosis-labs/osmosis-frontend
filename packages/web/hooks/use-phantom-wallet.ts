import { useCallback, useSyncExternalStore } from "react";

export const PHANTOM_DOWNLOAD_URL = "https://phantom.app/";

/** Minimal surface of the injected Phantom (window.phantom.solana)
 *  provider that this app uses. */
export type PhantomProvider = {
  connect: (opts?: {
    onlyIfTrusted?: boolean;
  }) => Promise<{ publicKey?: { toBase58: () => string } }>;
  disconnect?: () => Promise<void>;
  signTransaction?: (tx: unknown) => Promise<unknown>;
  signAndSendTransaction?: (tx: unknown) => Promise<{ signature: string }>;
  on?: (event: string, handler: (arg: unknown) => void) => void;
  off?: (event: string, handler: (arg: unknown) => void) => void;
};

export const getPhantomProvider = (): PhantomProvider | undefined =>
  typeof window === "undefined"
    ? undefined
    : (window as unknown as { phantom?: { solana?: PhantomProvider } }).phantom
        ?.solana ??
      (window as unknown as { solana?: PhantomProvider }).solana ??
      undefined;

// Module-level connection state so every consumer (amount screen, wallet
// select modal, quote flow) observes the same Phantom session.
let phantomAddress: string | undefined;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

let eventsWired = false;
const wireProviderEvents = (provider: PhantomProvider) => {
  if (eventsWired) return;
  eventsWired = true;
  provider.on?.("accountChanged", (publicKey) => {
    phantomAddress =
      (publicKey as { toBase58?: () => string } | null)?.toBase58?.() ??
      undefined;
    emit();
  });
  provider.on?.("disconnect", () => {
    phantomAddress = undefined;
    emit();
  });
};

const subscribe = (callback: () => void) => {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
};

/**
 * Shared Phantom (Solana) wallet session. `connect` opens the Phantom
 * prompt (or the install page when the extension is absent) and the
 * resulting address is visible to every consumer of this hook, tracking
 * account switches and disconnects from the extension.
 */
export const usePhantomWallet = () => {
  const address = useSyncExternalStore(
    subscribe,
    () => phantomAddress,
    () => undefined
  );

  const connect = useCallback(async (): Promise<string | undefined> => {
    const provider = getPhantomProvider();
    if (!provider) {
      window.open(PHANTOM_DOWNLOAD_URL, "_blank", "noopener");
      return undefined;
    }
    wireProviderEvents(provider);
    const response = await provider.connect();
    phantomAddress = response?.publicKey?.toBase58?.();
    emit();
    return phantomAddress;
  }, []);

  const disconnect = useCallback(async () => {
    await getPhantomProvider()?.disconnect?.();
    phantomAddress = undefined;
    emit();
  }, []);

  return { address, connect, disconnect };
};
