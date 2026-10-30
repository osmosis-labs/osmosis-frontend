/**
 * Tracks WalletConnect requests waiting on the user's phone, so the user can
 * back out and a stalled request cannot hang a flow forever.
 *
 * Settling is one-way: once a request is cancelled or times out, the caller's
 * promise is rejected and any answer the wallet sends later is ignored. The signed payload
 * never reaches the broadcast step, so nothing is sent after the user was told
 * the transaction stopped.
 */

/** Hard limit for a single wallet request. A late approval inside the window is
 *  the user's own action and goes through normally. The limit is the timer, not
 *  a deadline: if the browser was suspended (e.g. while the user was in the
 *  wallet app) and the approval is processed before the overdue timer fires, it
 *  still goes through, since the user was never told the request stopped. */
export const WC_REQUEST_TIMEOUT_MS = 120_000;

type Listener = () => void;

const inFlight = new Set<{ reject: () => void }>();
const listeners = new Set<Listener>();

/** Set by a cancel and held until the attempt ends, so a request that would
 *  have started after the cancel (e.g. the signature after an account lookup)
 *  is refused instead of reaching the phone. */
let cancelled = false;

/** Rejects every open request and refuses new ones until
 *  `resetWalletRequestCancel` is called. */
export function cancelWalletRequests() {
  cancelled = true;
  [...inFlight].forEach((request) => request.reject());
}

export function resetWalletRequestCancel() {
  cancelled = false;
}

export function subscribePendingWalletRequest(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** True while any WalletConnect request is waiting on the phone. */
export function hasPendingWalletRequest() {
  return inFlight.size > 0;
}

/**
 * Sends `send()` and races it against cancel and a hard timeout. The request is
 * not aborted on the phone (WalletConnect has no abort), only detached: its
 * eventual result is discarded.
 */
export function trackWalletRequest<T>({
  send,
  walletName,
  timeoutMs = WC_REQUEST_TIMEOUT_MS,
}: {
  send: () => Promise<T>;
  walletName: string;
  timeoutMs?: number;
}): Promise<T> {
  if (cancelled) return Promise.reject(new Error("Request rejected"));

  return new Promise<T>((resolve, reject) => {
    let settled = false;
    const pending = {
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
      listeners.forEach((listener) => listener());
      finish();
    }

    inFlight.add(pending);
    listeners.forEach((listener) => listener());

    send().then(
      (value) => settle(() => resolve(value)),
      (error) => settle(() => reject(error))
    );
  });
}
