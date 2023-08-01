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

/** Router that delegates search problem to background thread, useful for unblocking the main thread for UI/DOM updates. */
export class BackgroundRoutes implements TokenOutGivenInRouter {
  protected static singletonWorker: OptimizedRoutesWorker | null = null;
  protected static nextRequestSerialNumber = 0;
  /** A pool of responses by serial number, with loops to observe responses as they come in.
   *  Map: Serial number => Response */
  protected static resolvableResponses = new Map<number, EncodedResponse>();

  constructor(params: OptimizedRoutesParams) {
    if (typeof window !== "undefined") {
      if (!BackgroundRoutes.singletonWorker) {
        // create a new worker singleton
        BackgroundRoutes.singletonWorker = new Worker(
          new URL("./worker.ts", import.meta.url)
        );

        // add received events to the basket of responses
        BackgroundRoutes.singletonWorker.addEventListener(
          "message",
          (event: MessageEvent<EncodedResponse>) => {
            BackgroundRoutes.resolvableResponses.set(
              event.data.serialNumber,
              event.data
            );
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
   *  @param timeoutMs The timeout in milliseconds to wait for a response. Defaults to 10 seconds. */
  static postSerialMessage(
    request: EncodedRequest,
    timeoutMs = 10_000
  ): Promise<EncodedResponse> {
    if (!BackgroundRoutes.singletonWorker) {
      throw new Error("Worker not initialized");
    }
    const serialNumber = ++BackgroundRoutes.nextRequestSerialNumber;
    BackgroundRoutes.singletonWorker.postMessage({
      serialNumber,
      ...request,
    });
    return new Promise(async (resolve, reject) => {
      setTimeout(() => {
        reject(new Error("Timeout"));
      }, timeoutMs);
      let maxIters = 1_000_000;
      do {
        await new Promise((resolve) => setTimeout(resolve, 100));
        const result = BackgroundRoutes.resolvableResponses.get(serialNumber);
        if (result) {
          BackgroundRoutes.resolvableResponses.delete(serialNumber);
          resolve(result);
          return;
        }
      } while (--maxIters > 0);
    });
  }
}
