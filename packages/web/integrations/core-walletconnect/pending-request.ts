/**
 * Tracks the WalletConnect request currently waiting on the user's phone, so
 * the UI can offer a way out and a stalled request cannot hang a flow forever.
 *
 * Settling is one-way: once a request is cancelled or times out, the caller's
 * promise is rejected and any answer the wallet sends later is ignored. The
 * signed payload never reaches the broadcast step, so nothing is sent after the
 * user was told the transaction stopped.
 */

/** Hard limit for a single wallet request. A late approval inside the window is
 *  the user's own action and goes through normally. */
export const WC_REQUEST_TIMEOUT_MS = 120_000;

/** How long to wait with no answer before the UI shows the waiting state. */
export const WC_WAITING_NOTICE_DELAY_MS = 5_000;

export interface PendingWalletRequest {
  walletName: string;
  startedAt: number;
  cancel: () => void;
}

type Listener = () => void;

const inFlight = new Set<PendingWalletRequest & { reject: () => void }>();
let current: PendingWalletRequest | null = null;
const listeners = new Set<Listener>();

/** The snapshot is rebuilt on every change so it stays referentially stable
 *  between changes. Cancelling it cancels every in-flight request: requests
 *  can overlap (e.g. an account lookup while a signature is open), and a
 *  cancel that left any of them live could still end in a broadcast. */
function refresh() {
  const [first] = inFlight;
  current = first
    ? {
        walletName: first.walletName,
        startedAt: first.startedAt,
        cancel: () => [...inFlight].forEach((request) => request.reject()),
      }
    : null;
  listeners.forEach((listener) => listener());
}

export function subscribePendingWalletRequest(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getPendingWalletRequest() {
  return current;
}

/**
 * Races `request` against the user's cancel and a hard timeout. The underlying
 * request is not aborted (WalletConnect has no abort), only detached: its
 * eventual result is discarded.
 */
export function trackWalletRequest<T>({
  request,
  walletName,
  timeoutMs = WC_REQUEST_TIMEOUT_MS,
}: {
  request: Promise<T>;
  walletName: string;
  timeoutMs?: number;
}): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let settled = false;

    const pending = {
      walletName,
      startedAt: Date.now(),
      cancel: () => {},
      reject: () => settle(() => reject(new Error("Request rejected"))),
    };

    const timer = setTimeout(
      () =>
        settle(() =>
          reject(
            new Error(
              `${walletName} did not respond in time. Nothing was signed or sent, please try again.`
            )
          )
        ),
      timeoutMs
    );

    function settle(finish: () => void) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      inFlight.delete(pending);
      refresh();
      finish();
    }

    inFlight.add(pending);
    refresh();

    request.then(
      (value) => settle(() => resolve(value)),
      (error) => settle(() => reject(error))
    );
  });
}
