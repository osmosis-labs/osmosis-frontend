import { AxelarAssetTransfer, Environment } from "@axelar-network/axelarjs-sdk";
import { useCallback, useEffect, useState } from "react";

export function useDepositAddress(
  sourceChain: string,
  destChain: string,
  address: string | undefined,
  coinMinimalDenom: string,
  generateOnMount = true,
  environment = Environment.MAINNET,
  shouldGenerate = true
): {
  depositAddress?: string;
  isLoading: boolean;
} {
  const [depositAddress, setDepositAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAddress, setLastAddress] = useState<string | null>(null);

  const generateAddress = useCallback(async () => {
    if (address) {
      setIsLoading(true);
      new AxelarAssetTransfer({ environment })
        .getDepositAddress(sourceChain, destChain, address, coinMinimalDenom)
        .then((generatedAddress) => {
          setDepositAddress(generatedAddress);
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
    if (
      address &&
      generateOnMount &&
      address != lastAddress &&
      shouldGenerate
    ) {
      setLastAddress(address);
      setDepositAddress(null);
      doGen().catch((e) => console.error(e));
    }
  }, [address, generateOnMount, shouldGenerate, doGen]);

  return {
    depositAddress: depositAddress || undefined,
    isLoading,
  };
}
