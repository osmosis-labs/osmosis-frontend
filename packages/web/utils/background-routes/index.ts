import {
  OptimizedRoutesParams,
  RouteWithInAmount,
  SplitTokenInQuote,
  Token,
  TokenOutGivenInRouter,
} from "@osmosis-labs/pools";

import {
  checkResponseAndDecodeError,
  decodeRouteWithInAmount,
  decodeSplitTokenInQuote,
  emptySplitTokenInQuote,
  encodeCalculateTokenOutByTokenInParameters,
  encodeGetOptimizedRoutesByTokenInParameters,
  encodeOptimizedRoutesParams,
  encodeRouteByTokenInParameters,
} from "./coding";
import {
  EncodedRequest,
  EncodedResponse,
  OptimizedRoutesWorker,
} from "./worker";

/** Timeouts are expected with web workers, depending on the speed of the web worker's event loop as events (requests) are queued. */
const TIMEOUT_SYMBOL = Symbol("Timeout");

/** Ensures the resolveable responses doesn't grow indefinitely. Should be positive. */
const MAX_RESOLVABLE_RESPONSES = 100;

/** Router that delegates search problem to background thread, useful for unblocking the main thread for UI/DOM updates. */
export class BackgroundRoutes implements TokenOutGivenInRouter {
  protected static singletonWorker: OptimizedRoutesWorker | null = null;
  protected static nextRequestSerialNumber = 0;
  /** A pool of responses by serial number, with loops to observe responses as they come in.
   *  This allows us to maintain the Promise-based API of the router, while delegating the work to a background thread via event listeners.
   *  Map: Serial number => Response */
  protected static resolvableResponses = new Map<number, EncodedResponse>();

  constructor(params: OptimizedRoutesParams, worker?: Worker) {
    if (typeof window !== "undefined") {
      if (!BackgroundRoutes.singletonWorker) {
        // create a new worker singleton
        BackgroundRoutes.singletonWorker =
          worker ?? new Worker(new URL("./worker.ts", import.meta.url));

        // add received events to the basket of responses
        BackgroundRoutes.singletonWorker.addEventListener(
          "message",
          (event: MessageEvent<EncodedResponse>) => {
            BackgroundRoutes.resolvableResponses.set(
              event.data.serialNumber,
              event.data
            );

            // memory leak: clean up old timed out responses some number before current response
            let oldestSerialNumber =
              event.data.serialNumber - MAX_RESOLVABLE_RESPONSES;
            while (
              BackgroundRoutes.resolvableResponses.has(oldestSerialNumber--)
            ) {
              BackgroundRoutes.resolvableResponses.delete(oldestSerialNumber);
            }
          }
        );
      }

      // set the params
      const encodedParams = encodeOptimizedRoutesParams(params);
      BackgroundRoutes.postSerialMessage({ setParams: encodedParams });
    } else {
      console.warn("BackgroundRoutes is not supported in this environment");
    }
    // will initialize, but will throw if a method is called later
  }

  async routeByTokenIn(
    tokenIn: Token,
    tokenOutDenom: string
  ): Promise<SplitTokenInQuote> {
    const encodedResult = await BackgroundRoutes.postSerialMessage({
      routeByTokenIn: encodeRouteByTokenInParameters([tokenIn, tokenOutDenom]),
    });
    if (encodedResult === TIMEOUT_SYMBOL) return emptySplitTokenInQuote;
    if ("routeByTokenIn" in encodedResult) {
      return decodeSplitTokenInQuote(encodedResult.routeByTokenIn);
    }
    checkResponseAndDecodeError(encodedResult);

    throw new Error(
      `Unexpected response, expected routeByTokenIn got ${Object.keys(
        encodedResult
      ).join(", ")}`
    );
  }

  async getOptimizedRoutesByTokenIn(
    tokenIn: Token,
    tokenOutDenom: string
  ): Promise<RouteWithInAmount[]> {
    const encodedResult = await BackgroundRoutes.postSerialMessage({
      getOptimizedRoutesByTokenIn: encodeGetOptimizedRoutesByTokenInParameters([
        tokenIn,
        tokenOutDenom,
      ]),
    });
    if (encodedResult === TIMEOUT_SYMBOL) return [];
    if ("getOptimizedRoutesByTokenIn" in encodedResult) {
      return encodedResult.getOptimizedRoutesByTokenIn.map(
        decodeRouteWithInAmount
      );
    }
    checkResponseAndDecodeError(encodedResult);

    throw new Error(
      `Unexpected response, expected getOptimizedRoutesByTokenIn got ${Object.keys(
        encodedResult
      ).join(", ")}`
    );
  }

  async calculateTokenOutByTokenIn(
    routes: RouteWithInAmount[]
  ): Promise<SplitTokenInQuote> {
    const encodedResult = await BackgroundRoutes.postSerialMessage({
      calculateTokenOutByTokenIn: encodeCalculateTokenOutByTokenInParameters([
        routes,
      ]),
    });
    if (encodedResult === TIMEOUT_SYMBOL) return emptySplitTokenInQuote;
    if ("calculateTokenOutByTokenIn" in encodedResult) {
      return decodeSplitTokenInQuote(encodedResult.calculateTokenOutByTokenIn);
    }
    checkResponseAndDecodeError(encodedResult);

    throw new Error(
      `Unexpected response, expected calculateTokenOutByTokenIn got ${Object.keys(
        encodedResult
      ).join(", ")}`
    );
  }

  /** Terminates the Worker singleton, returning `true` or `false` if successful. */
  static terminate(): boolean {
    if (BackgroundRoutes.singletonWorker) {
      BackgroundRoutes.singletonWorker.terminate();
      BackgroundRoutes.singletonWorker = null;
      return true;
    }
    return false;
  }

  /** Use serial numbers to ensure outgoing requests are mapped to the correct response.
   *  This is a promise-based wrapper around `postMessage` and `addEventListener`.
   *  @param request The request to send to the worker.
   *  @param timeoutMs The timeout in milliseconds to wait for a response. Defaults to 10 seconds.
   *  @returns Promise containing the encoded response, or a symbol to indicate the promise timed out waiting for the given serial numberm response. */
  static postSerialMessage(
    request: EncodedRequest,
    timeoutMs = 6_000
  ): Promise<EncodedResponse | typeof TIMEOUT_SYMBOL> {
    if (!BackgroundRoutes.singletonWorker) {
      throw new Error("Worker not initialized");
    }
    const serialNumber = ++BackgroundRoutes.nextRequestSerialNumber;
    BackgroundRoutes.singletonWorker.postMessage({
      serialNumber,
      ...request,
    });

    return new Promise(async (resolve, reject) => {
      try {
        const tId = setTimeout(() => {
          resolve(TIMEOUT_SYMBOL);
        }, timeoutMs);
        let maxIterations = 1_000_000;
        do {
          await new Promise((resolve) => setTimeout(resolve, 100)); // sleep
          const result = BackgroundRoutes.resolvableResponses.get(serialNumber);
          if (result) {
            BackgroundRoutes.resolvableResponses.delete(serialNumber);
            resolve(result);
            return;
          }
        } while (--maxIterations > 0);
        clearTimeout(tId);
        resolve(TIMEOUT_SYMBOL);
      } catch (e) {
        reject(e);
      }
    });
  }
}
