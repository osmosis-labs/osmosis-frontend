import { OptimizedRoutes } from "@osmosis-labs/pools";

import {
  decodeCalculateTokenOutByTokenInParameters,
  decodeGetOptimizedRoutesByTokenInParameters,
  decodeOptimizedRoutesParams,
  decodeRouteByTokenInParameters,
  EncodedCalculateTokenOutByTokenInParameters,
  EncodedError,
  EncodedGetOptimizedRoutesByTokenInParameters,
  EncodedOptimizedRoutesParams,
  EncodedRouteByTokenInParameters,
  EncodedRouteWithInAmount,
  EncodedSplitTokenInQuote,
  encodeError,
  encodeRouteWithInAmount,
  encodeSplitTokenInQuote,
} from "./coding";

/** Worker, with `postMessage` signature typed with messages expected by the routes worker script. */
export interface OptimizedRoutesWorker extends Worker {
  postMessage(message: Serial & EncodedRequest): void;
}

type Serial = {
  serialNumber: number;
};

// see README in coders folder for details, but data between threads has to be compatible with structured clone algorithm

/** Object keyed by method names, containing the structured-clone-compatible encoded form of the parameters. */
export type EncodedRequest =
  | {
      setParams: EncodedOptimizedRoutesParams;
    }
  | {
      routeByTokenIn: EncodedRouteByTokenInParameters;
    }
  | {
      getOptimizedRoutesByTokenIn: EncodedGetOptimizedRoutesByTokenInParameters;
    }
  | {
      calculateTokenOutByTokenIn: EncodedCalculateTokenOutByTokenInParameters;
    };

/** Object keyed by method names, containing the structured-clone-compatible encoded form of the resolved return objects. */
export type EncodedResponse = Serial &
  (
    | {
        setParams: boolean;
      }
    | {
        routeByTokenIn: EncodedSplitTokenInQuote;
      }
    | {
        getOptimizedRoutesByTokenIn: EncodedRouteWithInAmount[];
      }
    | {
        calculateTokenOutByTokenIn: EncodedSplitTokenInQuote;
      }
    | {
        error: EncodedError;
      }
  );

// singleton instance of the router on this thread, replaced if new params are received (containing fresh pools amongst other data)
let router: OptimizedRoutes | null = null;

/** Receive a message, with a serial number to identify the async response. */
self.onmessage = async (event: MessageEvent<Serial & EncodedRequest>) => {
  if ("setParams" in event.data) {
    const params = decodeOptimizedRoutesParams(event.data.setParams);
    router = new OptimizedRoutes(params);
    postMessage({ serialNumber: event.data.serialNumber, setParams: true });
    return;
  }

  // the following messages require the router to be set
  if (!router) {
    postMessage({ serialNumber: event.data.serialNumber, setParams: false });
  } else {
    try {
      if ("routeByTokenIn" in event.data) {
        const [tokenIn, tokenOutDenom] = decodeRouteByTokenInParameters(
          event.data.routeByTokenIn
        );
        const result = await router.routeByTokenIn(tokenIn, tokenOutDenom);
        postMessage({
          serialNumber: event.data.serialNumber,
          routeByTokenIn: encodeSplitTokenInQuote(result),
        });
      } else if ("getOptimizedRoutesByTokenIn" in event.data) {
        const [tokenIn, tokenOutDenom] =
          decodeGetOptimizedRoutesByTokenInParameters(
            event.data.getOptimizedRoutesByTokenIn
          );
        const result = await router.getOptimizedRoutesByTokenIn(
          tokenIn,
          tokenOutDenom
        );
        postMessage({
          serialNumber: event.data.serialNumber,
          getOptimizedRoutesByTokenIn: result.map(encodeRouteWithInAmount),
        });
      } else if ("calculateTokenOutByTokenIn" in event.data) {
        const [routes] = decodeCalculateTokenOutByTokenInParameters(
          event.data.calculateTokenOutByTokenIn
        );
        const result = await router.calculateTokenOutByTokenIn(routes);
        postMessage({
          serialNumber: event.data.serialNumber,
          calculateTokenOutByTokenIn: encodeSplitTokenInQuote(result),
        });
      }
    } catch (e) {
      postMessage({
        serialNumber: event.data.serialNumber,
        error: encodeError(e as Error),
      });
    }
  }
};
