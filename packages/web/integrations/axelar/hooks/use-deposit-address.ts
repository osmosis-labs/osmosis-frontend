import { AxelarAssetTransfer, Environment } from "@axelar-network/axelarjs-sdk";
import { useCallback, useEffect, useRef, useState } from "react";

/** Generate deposit addresses reactively. Will hold onto the last generated address for each sourceChain/destChain/address/coinMinimalDenom combination until unmount.
 * @param sourceChain Source chain.
 * @param destChain Destination chain.
 * @param destinationAddress User's destination address to generate deposit address for (on counterparty).
 * @param coinMinimalDenom Axelar-accepted coin minimal denom to generate deposit address for.
 * @param autoUnwrapIntoNative Whether to auto unwrap the coin into native coin when transferring out of Osmosis.
 * @param environment Axelar environment to use.
 * @param shouldGenerate Whether to generate a deposit address on this render.
 */
export function useDepositAddress(
  sourceChain: string,
  destChain: string,
  destinationAddress: string | undefined,
  coinMinimalDenom: string,
  autoUnwrapIntoNative: boolean | undefined,
  environment = Environment.MAINNET,
  shouldGenerate = true
): {
  depositAddress?: string;
  isLoading: boolean;
} {
  const [depositAddress, setDepositAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /** Key: sourceChain/destChain/address/coinMinimalDenom/autoUnwrap */
  const depositAddressCache = useRef(new Map<string, string>());
  /** Remembers most recent generating address. */
  const latestGenCacheKey = useRef("");

  const generateAddress = useCallback(async () => {
    const cacheKey = `${sourceChain}/${destChain}/${destinationAddress}/${coinMinimalDenom}/${Boolean(
      autoUnwrapIntoNative
    )}`;
    const cachedDepositAddress = depositAddressCache.current.get(cacheKey);
    if (cachedDepositAddress) {
      setDepositAddress(cachedDepositAddress);
    } else if (destinationAddress) {
      setIsLoading(true);
      // if the user changes the setting before the address populates, we don't want to set the address in useState
      latestGenCacheKey.current = cacheKey;
      new AxelarAssetTransfer({ environment })
        .getDepositAddress({
          fromChain: sourceChain,
          toChain: destChain,
          destinationAddress: destinationAddress,
          asset: coinMinimalDenom,
          options: autoUnwrapIntoNative
            ? {
                shouldUnwrapIntoNative: autoUnwrapIntoNative,
              }
            : undefined,
        })
        .then((generatedAddress) => {
          if (latestGenCacheKey.current === cacheKey) {
            setDepositAddress(generatedAddress);
          }
          depositAddressCache.current.set(cacheKey, generatedAddress);
        })
        .catch((e: any) => {
          console.error("useDepositAddress > getDepositAddress:", e.message);
        })
        .finally(() => setIsLoading(false));
    }
    return null;
  }, [
    environment,
    destinationAddress,
    sourceChain,
    destChain,
    coinMinimalDenom,
    autoUnwrapIntoNative,
    setIsLoading,
  ]);

  useEffect(() => {
    if (destinationAddress && shouldGenerate) {
      generateAddress();
    }
  }, [
    destinationAddress,
    coinMinimalDenom,
    sourceChain,
    destChain,
    shouldGenerate,
    generateAddress,
  ]);

  return {
    depositAddress: depositAddress || undefined,
    isLoading,
  };
}
