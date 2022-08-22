import { useState, useEffect, useCallback } from "react";
import { AxelarAssetTransfer, Environment } from "@axelar-network/axelarjs-sdk";

export function useDepositAddress(
  sourceChain: string,
  destChain: string,
  address: string | undefined,
  tokenMinDenom: string,
  generateOnMount = true,
  environment = Environment.MAINNET
): {
  depositAddress?: string;
  isLoading: boolean;
  generateAddress: () => Promise<void>;
} {
  const [depositAddress, setDepositAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateAddress = useCallback(async () => {
    if (address && depositAddress === null) {
      setIsLoading(true);
      new AxelarAssetTransfer({ environment })
        .getDepositAddress(sourceChain, destChain, address, tokenMinDenom)
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
    depositAddress,
    address,
    sourceChain,
    destChain,
    tokenMinDenom,
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
    if (address && generateOnMount && !depositAddress) {
      doGen().catch((e) => console.error(e));
    }
  }, [address, generateOnMount, depositAddress, doGen]);

  return {
    depositAddress: depositAddress || undefined,
    isLoading,
    generateAddress: doGen,
  };
}
