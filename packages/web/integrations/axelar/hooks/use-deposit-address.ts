import { AxelarAssetTransfer, Environment } from "@axelar-network/axelarjs-sdk";
import { fromPromise, IPromiseBasedObservable } from "mobx-utils";
import { useCallback, useMemo, useRef, useState } from "react";

// A helper hook wrapping a reference to a Map for caching values.
function useCache<T>() {
  const cache = useRef<Map<string, T>>(new Map());
  const get = useCallback((key: string) => cache.current.get(key), []);
  const has = useCallback((key: string) => cache.current.has(key), []);
  const set = useCallback((key: string, value: T) => {
    cache.current.set(key, value);
  }, []);
  return { get, has, set };
}

/**
 * Generate deposit addresses reactively, saving each promise in an observable and caching the results.
 * @param sourceChain Source chain.
 * @param destChain Destination chain.
 * @param destinationAddress User's destination address to generate deposit address for (on counterparty).
 * @param coinMinimalDenom Axelar-accepted coin minimal denom to generate deposit address for.
 * @param shouldUnwrapIntoNative Whether to auto unwrap the coin into native coin when transferring out of Osmosis.
 * @param environment Axelar environment to use.
 * @param shouldGenerate Whether to generate a deposit address on this render.
 */
export function useDepositAddress(
  sourceChain: string,
  destChain: string,
  destinationAddress: string | undefined,
  coinMinimalDenom: string,
  shouldUnwrapIntoNative: boolean | undefined,
  environment = Environment.MAINNET,
  shouldGenerate = true
) {
  const [axelarAssetTransfer] = useState(
    () => new AxelarAssetTransfer({ environment })
  );

  const {
    get: cacheGet,
    set: cacheSet,
    has: cacheHas,
  } = useCache<IPromiseBasedObservable<string>>();

  const observable = useMemo(() => {
    const cacheKey = `${sourceChain}/${destChain}/${destinationAddress}/${coinMinimalDenom}/${Boolean(
      shouldUnwrapIntoNative
    )}`;
    if (destinationAddress && shouldGenerate) {
      if (!cacheHas(cacheKey)) {
        const generateAddress = async () => {
          try {
            return await axelarAssetTransfer.getDepositAddress({
              fromChain: sourceChain,
              toChain: destChain,
              destinationAddress: destinationAddress!,
              asset: coinMinimalDenom,
              options: { shouldUnwrapIntoNative },
            });
          } catch (e: unknown) {
            if (e instanceof Error) {
              console.error("useDepositAddress > generateAddress:", e.message);
            } else {
              console.error(
                "useDepositAddress > generateAddress: Unknown error"
              );
            }
            throw e;
          }
        };
        cacheSet(cacheKey, fromPromise(generateAddress()));
      }
      return cacheGet(cacheKey);
    }
  }, [
    axelarAssetTransfer,
    sourceChain,
    destChain,
    destinationAddress,
    coinMinimalDenom,
    shouldUnwrapIntoNative,
    shouldGenerate,
    cacheGet,
    cacheSet,
    cacheHas,
  ]);

  return {
    depositAddress:
      observable?.state === "fulfilled" ? observable.value : undefined,
    isLoading: observable?.state === "pending",
  };
}
