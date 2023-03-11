import { AxelarAssetTransfer, Environment } from "@axelar-network/axelarjs-sdk";
import { useCallback, useEffect, useRef, useState } from "react";

/** Generate deposit addresses reactively. Will hold onto the last generated address for each sourceChain/destChain/address/coinMinimalDenom combination until unmount.
 * @param sourceChain Source chain.
 * @param destChain Destination chain.
 * @param destinationAddress User's destination address to generate deposit address for (on counterparty).
 * @param coinMinimalDenom Axelar-accepted coin minimal denom to generate deposit address for.
 * @param autoWrapOrUnwrap Whether to automatically wrap or unwrap the coin into native coin.
 * @param environment Axelar environment to use.
 * @param shouldGenerate Whether to generate a deposit address on this render.
 */
export function useDepositAddress(
  sourceChain: string,
  destChain: string,
  destinationAddress: string | undefined,
  coinMinimalDenom: string,
  autoWrapOrUnwrap = false,
  environment = Environment.MAINNET,
  shouldGenerate = true
): {
  depositAddress?: string;
  isLoading: boolean;
} {
  const [depositAddress, setDepositAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /** Key: sourceChain/destChain/address/coinMinimalDenom */
  const depositAddressCache = useRef(new Map<string, string>());

  const generateAddress = useCallback(async () => {
    const cacheKey = `${sourceChain}/${destChain}/${destinationAddress}/${coinMinimalDenom}/${autoWrapOrUnwrap}`;
    const cachedDepositAddress = depositAddressCache.current.get(cacheKey);
    if (cachedDepositAddress) {
      setDepositAddress(cachedDepositAddress);
    } else if (destinationAddress) {
      setIsLoading(true);
      new AxelarAssetTransfer({ environment })
        .getDepositAddress({
          fromChain: sourceChain,
          toChain: destChain,
          destinationAddress: destinationAddress,
          asset: coinMinimalDenom,
          options: {
            refundAddress: destinationAddress,
            shouldUnwrapIntoNative: autoWrapOrUnwrap,
          },
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
    autoWrapOrUnwrap,
    setIsLoading,
  ]);

  const doGen = useCallback(
    () =>
      new Promise<void>((resolve, reject) => {
        generateAddress()
          .then((address) => {
            if (address) {
              setDepositAddress(address);
            }
            resolve();
          })
          .catch((e) => {
            reject(`useDepositAddress: ${e.message}`);
          });
      }),
    [generateAddress, setDepositAddress]
  );
  useEffect(() => {
    if (destinationAddress && shouldGenerate) {
      setDepositAddress(null);
      doGen().catch((e) => console.error(e));
    }
  }, [
    destinationAddress,
    coinMinimalDenom,
    sourceChain,
    destChain,
    shouldGenerate,
    doGen,
  ]);

  return {
    depositAddress: depositAddress || undefined,
    isLoading,
  };
}
