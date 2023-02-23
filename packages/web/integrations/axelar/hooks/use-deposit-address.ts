import { AxelarAssetTransfer, Environment } from "@axelar-network/axelarjs-sdk";
import { useCallback, useEffect, useRef, useState } from "react";

/** Generate deposit addresses reactively. Will hold onto the last generated address for each sourceChain/destChain/address/coinMinimalDenom combination until unmount.
 * @param sourceChain Source chain.
 * @param destChain Destination chain.
 * @param address User's destination address to generate deposit address for (on counterparty).
 * @param coinMinimalDenom Axelar-accepted coin minimal denom to generate deposit address for.
 * @param environment Axelar environment to use.
 * @param shouldGenerate Whether to generate a deposit address on this render.
 */
export function useDepositAddress(
  sourceChain: string,
  destChain: string,
  address: string | undefined,
  coinMinimalDenom: string,
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
    const cacheKey = `${sourceChain}/${destChain}/${address}/${coinMinimalDenom}`;
    const cachedDepositAddress = depositAddressCache.current.get(cacheKey);
    if (cachedDepositAddress) {
      setDepositAddress(cachedDepositAddress);
    } else if (address) {
      setIsLoading(true);
      new AxelarAssetTransfer({ environment })
        .getDepositAddress(sourceChain, destChain, address, coinMinimalDenom)
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
    address,
    sourceChain,
    destChain,
    coinMinimalDenom,
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
    if (address && shouldGenerate) {
      setDepositAddress(null);
      doGen().catch((e) => console.error(e));
    }
  }, [
    address,
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
