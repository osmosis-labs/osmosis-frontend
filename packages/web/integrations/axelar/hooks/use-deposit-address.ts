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

  const generateAddress = useCallback(async () => {
    const cacheKey = `${sourceChain}/${destChain}/${destinationAddress}/${coinMinimalDenom}/${Boolean(
      autoUnwrapIntoNative
    )}`;
    const cacheHit = depositAddressCache.current.get(cacheKey);
    if (cacheHit) {
      setDepositAddress(cacheHit);
    } else if (destinationAddress) {
      setIsLoading(true);
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
          setDepositAddress(generatedAddress);
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
    if (destinationAddress && shouldGenerate && !isLoading) {
      generateAddress();
    }
  }, [
    destinationAddress,
    coinMinimalDenom,
    sourceChain,
    destChain,
    shouldGenerate,
    isLoading,
    generateAddress,
  ]);

  return {
    depositAddress: depositAddress || undefined,
    isLoading,
  };
}
